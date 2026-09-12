require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, '../data');
const uploadDir = path.join(__dirname, '../uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const dbFile = path.join(dataDir, 'db.json');

const initial = {
  users: [],
  videos: [],
  blogs: [],
  plans: [
    {
      id: 1,
      name: 'Premium',
      price: 99,
      period: 'month',
      features: 'Exclusive documentaries, early access, premium blogs',
      active: 1
    },
    {
      id: 2,
      name: 'Premium+',
      price: 199,
      period: 'month',
      features: 'All Premium benefits, exclusive series, bonus content',
      active: 1
    }
  ],
  payments: [],
  settings: {
    site_name: 'NIKHILVERSE',
    youtube_sync: 'off',
    ai_enabled: 'on',
    razorpay_enabled: 'off'
  }
};

let db;

try {
  db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
} catch (e) {
  db = initial;
  save();
}

function save() {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function idOf(arr) {
  return arr.length
    ? Math.max(...arr.map(x => Number(x.id) || 0)) + 1
    : 1;
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));


// ======================================================
// YOUTUBE DATA API
// ======================================================

const YOUTUBE_API_BASE =
  'https://www.googleapis.com/youtube/v3';

const youtubeChannels = [
  {
    name: 'SIFI By Nikhil',
    handle: '@SIFIByNikhil'
  },
  {
    name: 'TAH By Nikhil',
    handle: '@TAHBYNikhil2'
  }
];

async function youtubeGet(endpoint, params) {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }

  const url = new URL(
    YOUTUBE_API_BASE + '/' + endpoint
  );

  Object.entries({
    ...params,
    key
  }).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });

  const r = await fetch(url);
  const data = await r.json();

  if (!r.ok) {
    throw new Error(
      data?.error?.message ||
      `YouTube API error ${r.status}`
    );
  }

  return data;
}


// ======================================================
// ISO 8601 DURATION -> SECONDS
// ======================================================

function durationToSeconds(duration) {
  const match = String(duration || '').match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return (
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}


// ======================================================
// YOUTUBE SYNC
// ======================================================

async function syncYouTube() {
  if (!process.env.YOUTUBE_API_KEY) {
    return {
      skipped: true,
      reason: 'YOUTUBE_API_KEY missing'
    };
  }

  let added = 0;
  let updated = 0;
  let channels = 0;
  let skippedShorts = 0;
  let removedShorts = 0;

  // Faster lookup for existing videos
  const existingByYoutubeId = new Map(
    db.videos
      .filter(v => v.youtube_id)
      .map(v => [v.youtube_id, v])
  );

  for (const channel of youtubeChannels) {

    // --------------------------------------------------
    // Find channel
    // --------------------------------------------------

    const ch = await youtubeGet('channels', {
      part: 'contentDetails,snippet',
      forHandle: channel.handle
    });

    const channelItem = ch.items?.[0];

    if (!channelItem) {
      throw new Error(
        `YouTube channel not found: ${channel.handle}`
      );
    }

    channels++;

    const uploadsId =
      channelItem.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsId) {
      throw new Error(
        `Uploads playlist not found: ${channel.handle}`
      );
    }

    // --------------------------------------------------
    // Fetch ALL playlist pages
    // --------------------------------------------------

    let pageToken = '';
    let allItems = [];

    do {
      const params = {
        part: 'snippet,contentDetails,status',
        playlistId: uploadsId,
        maxResults: '50'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const playlistResponse = await youtubeGet(
        'playlistItems',
        params
      );

      const items = playlistResponse.items || [];

      allItems.push(...items);

      pageToken =
        playlistResponse.nextPageToken || '';

    } while (pageToken);


    // --------------------------------------------------
    // Get video IDs
    // --------------------------------------------------

    const videoIds = allItems
      .map(item =>
        item.contentDetails?.videoId ||
        item.snippet?.resourceId?.videoId
      )
      .filter(Boolean);


    // --------------------------------------------------
    // YouTube videos.list supports max 50 IDs
    // --------------------------------------------------

    for (let i = 0; i < videoIds.length; i += 50) {

      const batchIds = videoIds.slice(i, i + 50);

      const videoResponse = await youtubeGet(
        'videos',
        {
          part: 'contentDetails,snippet,status',
          id: batchIds.join(',')
        }
      );

      const videoMap = new Map(
        (videoResponse.items || []).map(v => [
          v.id,
          v
        ])
      );


      // ------------------------------------------------
      // Process playlist items
      // ------------------------------------------------

      for (const x of allItems) {

        const videoId =
          x.contentDetails?.videoId ||
          x.snippet?.resourceId?.videoId;

        if (!videoId) continue;

        // Skip private videos
        if (
          x.status?.privacyStatus === 'private'
        ) {
          continue;
        }

        const video = videoMap.get(videoId);

        if (!video) continue;

        const title =
          x.snippet?.title ||
          video.snippet?.title ||
          '';

        const description =
          x.snippet?.description ||
          video.snippet?.description ||
          '';

        const durationISO =
          video.contentDetails?.duration ||
          'PT0S';

        const totalSeconds =
          durationToSeconds(durationISO);


        // ------------------------------------------------
        // SHORTS DETECTION
        // ------------------------------------------------

        const combinedText =
          `${title} ${description}`;

        const hasShortsTag =
          /(^|\s)#shorts\b/i.test(
            combinedText
          );

        /*
         * YouTube Shorts can be up to 3 minutes.
         * For this documentary website we exclude
         * videos <= 3 minutes as Shorts too.
         */
        const isShort =
          hasShortsTag ||
          totalSeconds <= 180;


        // ------------------------------------------------
        // REMOVE / SKIP SHORTS
        // ------------------------------------------------

        if (isShort) {

          skippedShorts++;

          const existing =
            existingByYoutubeId.get(videoId);

          if (existing) {

            db.videos = db.videos.filter(
              v => v.youtube_id !== videoId
            );

            existingByYoutubeId.delete(
              videoId
            );

            removedShorts++;
          }

          continue;
        }


        // ------------------------------------------------
        // Published date
        // ------------------------------------------------

        const publishedAt =
          x.contentDetails?.videoPublishedAt ||
          x.snippet?.publishedAt ||
          video.snippet?.publishedAt ||
          new Date().toISOString();


        // ------------------------------------------------
        // Thumbnail
        // ------------------------------------------------

        const thumbs =
          x.snippet?.thumbnails ||
          video.snippet?.thumbnails ||
          {};

        const thumb =
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          thumbs.medium?.url ||
          thumbs.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


        // ------------------------------------------------
        // Existing video
        // ------------------------------------------------

        const existing =
          existingByYoutubeId.get(videoId);


        // ------------------------------------------------
        // Video data
        // ------------------------------------------------

        const itemData = {
          id:
            existing?.id ||
            idOf(db.videos),

          title,

          description,

          thumbnail: thumb,

          youtube_id: videoId,

          channel: channel.name,

          category:
            /documentary/i.test(
              `${title} ${description}`
            )
              ? 'Documentaries'
              : 'Videos',

          access:
            existing?.access ||
            'free',

          published_at: publishedAt,

          status:
            existing?.status ||
            'published',

          source: 'youtube',

          youtube_url:
            `https://www.youtube.com/watch?v=${videoId}`
        };


        // ------------------------------------------------
        // Update / Add
        // ------------------------------------------------

        if (existing) {

          Object.assign(
            existing,
            itemData
          );

          updated++;

        } else {

          db.videos.push(itemData);

          existingByYoutubeId.set(
            videoId,
            itemData
          );

          added++;
        }
      }
    }
  }


  // ----------------------------------------------------
  // Save last sync time
  // ----------------------------------------------------

  db.settings.youtube_last_sync =
    new Date().toISOString();

  save();


  // ----------------------------------------------------
  // Sync result
  // ----------------------------------------------------

  return {
    ok: true,
    channels,
    added,
    updated,
    skippedShorts,
    removedShorts,
    total: db.videos.length,
    lastSync:
      db.settings.youtube_last_sync
  };
}


// ======================================================
// YOUTUBE STATUS
// ======================================================

app.get(
  '/api/youtube/status',
  (req, res) =>
    res.json({
      configured:
        Boolean(
          process.env.YOUTUBE_API_KEY
        ),

      sync:
        db.settings.youtube_sync ||
        'off',

      lastSync:
        db.settings.youtube_last_sync ||
        null
    })
);


// ======================================================
// ADMIN YOUTUBE SYNC
// ======================================================

app.post(
  '/api/admin/youtube-sync',
  auth,
  admin,
  async (req, res) => {

    try {

      const result =
        await syncYouTube();

      res.json(result);

    } catch (e) {

      console.error(
        'YouTube sync failed:',
        e
      );

      res.status(500).json({
        error: e.message
      });
    }
  }
);


// ======================================================
// FILE UPLOAD
// ======================================================

const upload = multer({
  storage: multer.diskStorage({

    destination: uploadDir,

    filename: (req, file) => {

      return (
        Date.now() +
        '-' +
        file.originalname.replace(
          /[^a-z0-9._-]/gi,
          '_'
        )
      );
    }
  })
});


// ======================================================
// AUTH
// ======================================================

function auth(req, res, next) {

  try {

    const token =
      (req.headers.authorization || '')
        .replace('Bearer ', '');

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        'dev-secret'
    );

    next();

  } catch (e) {

    res.status(401).json({
      error: 'Unauthorized'
    });
  }
}


// ======================================================
// ADMIN AUTH
// ======================================================

function admin(req, res, next) {

  if (req.user?.role !== 'admin') {

    return res.status(403).json({
      error: 'Admin only'
    });
  }

  next();
}


// ======================================================
// PUBLIC VIDEOS
// ======================================================

app.get(
  '/api/videos',
  (req, res) => {

    res.json(
      db.videos
        .filter(
          v =>
            !v.status ||
            v.status === 'published'
        )
        .sort(
          (a, b) =>
            String(
              b.published_at || ''
            ).localeCompare(
              String(
                a.published_at || ''
              )
            )
        )
    );
  }
);


// ======================================================
// BLOGS
// ======================================================

app.get(
  '/api/blogs',
  (req, res) =>
    res.json(db.blogs)
);


// ======================================================
// PLANS
// ======================================================

app.get(
  '/api/plans',
  (req, res) =>
    res.json(
      db.plans.filter(
        p => p.active !== 0
      )
    )
);


// ======================================================
// USER REGISTER
// ======================================================

app.post(
  '/api/register',
  async (req, res) => {

    const {
      name = '',
      email = '',
      password = ''
    } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        error:
          'Email and password required'
      });
    }

    if (
      db.users.some(
        u => u.email === email
      )
    ) {

      return res.status(400).json({
        error:
          'Email already registered'
      });
    }

    const u = {

      id: idOf(db.users),

      name,

      email,

      password:
        await bcrypt.hash(
          password,
          10
        ),

      plan: 'free',

      created_at:
        new Date().toISOString()
    };

    db.users.push(u);

    save();

    res.json({
      id: u.id
    });
  }
);


// ======================================================
// USER LOGIN
// ======================================================

app.post(
  '/api/login',
  async (req, res) => {

    const u =
      db.users.find(
        x =>
          x.email ===
          req.body.email
      );

    if (
      !u ||
      !(
        await bcrypt.compare(
          req.body.password || '',
          u.password
        )
      )
    ) {

      return res.status(401).json({
        error:
          'Invalid credentials'
      });
    }

    res.json({

      token:
        jwt.sign(
          {
            id: u.id,
            email: u.email,
            plan: u.plan
          },

          process.env.JWT_SECRET ||
            'dev-secret'
        )
    });
  }
);


// ======================================================
// ADMIN LOGIN
// ======================================================

app.post(
  '/api/admin/login',
  async (req, res) => {

    const email =
      process.env.ADMIN_EMAIL ||
      'admin@nikhilverse.media';

    const password =
      process.env.ADMIN_PASSWORD ||
      'change-me';

    if (
      req.body.email !== email ||
      req.body.password !== password
    ) {

      return res.status(401).json({
        error:
          'Invalid admin credentials'
      });
    }

    res.json({

      token:
        jwt.sign(
          {
            role: 'admin',
            email
          },

          process.env.JWT_SECRET ||
            'dev-secret'
        )
    });
  }
);


// ======================================================
// CURRENT USER
// ======================================================

app.get(
  '/api/me',
  auth,
  (req, res) => {

    res.json(
      db.users.find(
        u =>
          u.id ===
          req.user.id
      ) ||
      req.user
    );
  }
);


// ======================================================
// ADMIN ADD / EDIT VIDEO
// ======================================================

app.post(
  '/api/admin/videos',
  auth,
  admin,
  (req, res) => {

    const v = req.body;

    const item = {

      id:
        v.id ||
        idOf(db.videos),

      title:
        v.title || '',

      description:
        v.description || '',

      thumbnail:
        v.thumbnail || '',

      youtube_id:
        v.youtube_id || '',

      channel:
        v.channel || '',

      category:
        v.category || '',

      access:
        v.access || 'free',

      published_at:
        v.published_at ||
        new Date().toISOString(),

      status:
        v.status ||
        'published'
    };

    const i =
      db.videos.findIndex(
        x => x.id == item.id
      );

    if (i >= 0) {

      db.videos[i] = item;

    } else {

      db.videos.push(item);
    }

    save();

    res.json(item);
  }
);


// ======================================================
// ADMIN DELETE VIDEO
// ======================================================

app.delete(
  '/api/admin/videos/:id',
  auth,
  admin,
  (req, res) => {

    db.videos =
      db.videos.filter(
        v =>
          v.id !=
          req.params.id
      );

    save();

    res.json({
      ok: true
    });
  }
);


// ======================================================
// ADMIN CREATE BLOG
// ======================================================

app.post(
  '/api/admin/blogs',
  auth,
  admin,
  (req, res) => {

    const b = req.body;

    const slug =
      b.slug ||
      String(
        b.title ||
          'article'
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /^-|-$/g,
          ''
        );

    const item = {

      id:
        idOf(db.blogs),

      title:
        b.title || '',

      slug,

      excerpt:
        b.excerpt || '',

      content:
        b.content || '',

      featured_image:
        b.featured_image || '',

      images:
        b.images || [],

      author:
        b.author || 'Nikhil',

      access:
        b.access || 'public',

      created_at:
        new Date().toISOString()
    };

    db.blogs.push(item);

    save();

    res.json(item);
  }
);


// ======================================================
// ADMIN UPLOAD
// ======================================================

app.post(
  '/api/admin/upload',
  auth,
  admin,
  upload.single('image'),
  (req, res) => {

    if (!req.file) {

      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    res.json({
      url:
        '/uploads/' +
        req.file.filename
    });
  }
);


// ======================================================
// ADMIN PLANS
// ======================================================

app.post(
  '/api/admin/plans',
  auth,
  admin,
  (req, res) => {

    const p = {

      id:
        idOf(db.plans),

      name:
        req.body.name ||
        'Premium',

      price:
        Number(
          req.body.price
        ) || 0,

      period:
        req.body.period ||
        'month',

      features:
        req.body.features ||
        '',

      active: 1
    };

    db.plans.push(p);

    save();

    res.json(p);
  }
);


// ======================================================
// ADMIN STATS
// ======================================================

app.get(
  '/api/admin/stats',
  auth,
  admin,
  (req, res) => {

    res.json({

      users:
        db.users.length,

      videos:
        db.videos.length,

      blogs:
        db.blogs.length,

      premium:
        db.users.filter(
          u =>
            u.plan !== 'free'
        ).length,

      payments:
        db.payments
          .filter(
            p =>
              p.status ===
              'paid'
          )
          .reduce(
            (n, p) =>
              n +
              Number(
                p.amount || 0
              ),
            0
          )
    });
  }
);


// ======================================================
// ADMIN SETTINGS
// ======================================================

app.get(
  '/api/admin/settings',
  auth,
  admin,
  (req, res) =>
    res.json(db.settings)
);


app.post(
  '/api/admin/settings',
  auth,
  admin,
  (req, res) => {

    db.settings = {
      ...db.settings,
      ...req.body
    };

    save();

    res.json(
      db.settings
    );
  }
);


// ======================================================
// RAZORPAY PAYMENT INTEGRATION
// ======================================================

function getOptionalUser(req) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch (e) {
    return null;
  }
}

app.get('/api/payment/config', (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(503).json({
      error: 'Razorpay is not configured on the server.'
    });
  }

  res.json({
    configured: true,
    key_id: process.env.RAZORPAY_KEY_ID,
    currency: 'INR'
  });
});

app.post('/api/payment/create', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render Environment.'
      });
    }

    const planId = Number(req.body?.planId);
    const plan = db.plans.find(p => Number(p.id) === planId && p.active !== 0);

    if (!plan) {
      return res.status(404).json({
        error: 'Premium plan not found.'
      });
    }

    const amount = Math.round(Number(plan.price) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid plan amount.'
      });
    }

    const user = getOptionalUser(req);
    const receipt = `nv_${Date.now()}`.slice(0, 40);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          plan_id: String(plan.id),
          plan_name: String(plan.name),
          user_id: user?.id ? String(user.id) : '',
          user_email: user?.email || ''
        }
      })
    });

    const order = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error('Razorpay order error:', JSON.stringify(order));
      return res.status(502).json({
        error: order?.error?.description || 'Razorpay order creation failed.'
      });
    }

    res.json({
      key_id: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        period: plan.period
      }
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({
      error: error.message || 'Unable to create Razorpay order.'
    });
  }
});

app.post('/api/payment/verify', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'Missing Razorpay payment verification fields.'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(503).json({
        error: 'Razorpay secret is not configured.'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const received = String(razorpay_signature);
    const valid = received.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(received)
      );

    if (!valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Razorpay payment signature.'
      });
    }

    const plan = db.plans.find(p => Number(p.id) === Number(planId) && p.active !== 0);
    const user = getOptionalUser(req);

    const payment = {
      id: idOf(db.payments),
      amount: plan ? Number(plan.price) : 0,
      currency: 'INR',
      plan_id: plan ? plan.id : Number(planId) || null,
      plan_name: plan ? plan.name : '',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      user_id: user?.id || null,
      user_email: user?.email || '',
      status: 'paid',
      created_at: new Date().toISOString()
    };

    db.payments.push(payment);

    if (user?.id && plan) {
      const dbUser = db.users.find(u => Number(u.id) === Number(user.id));
      if (dbUser) {
        dbUser.plan = plan.name;
        dbUser.plan_id = plan.id;
        dbUser.plan_period = plan.period;
        dbUser.plan_started_at = new Date().toISOString();
      }
    }

    save();

    res.json({
      success: true,
      message: `Payment successful. ${plan?.name || 'Premium'} activated.`,
      payment_id: razorpay_payment_id,
      plan: plan || null
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed.'
    });
  }
});


// ======================================================
// NIKHIL AI - OPENAI
// ======================================================

app.post('/api/ai', async (req, res) => {
  try {
    const q = String(req.body?.message || '').trim();

    if (!q) {
      return res.status(400).json({
        error: 'Please enter a question.'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is not configured on the server.'
      });
    }

    // Find relevant NIKHILVERSE videos
    const allVideos = Array.isArray(db.videos) ? db.videos : [];

    const words = q
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const results = allVideos
      .map(v => {
        const text = `${v.title || ''} ${v.description || ''} ${v.category || ''} ${v.channel || ''}`.toLowerCase();
        let score = 0;

        for (const word of words) {
          if (word.length > 2 && text.includes(word)) {
            score++;
          }
        }

        return { ...v, score };
      })
      .filter(v => v.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const videoContext = results.length
      ? results.map(v =>
          `Title: ${v.title || ''}\nCategory: ${v.category || ''}\nChannel: ${v.channel || ''}\nDescription: ${v.description || ''}\nYouTube: ${v.youtube_id ? `https://www.youtube.com/watch?v=${v.youtube_id}` : ''}`
        ).join('\n\n')
      : 'No directly matching videos found in the NIKHILVERSE database.';

    const systemInstructions = `
You are Nikhil AI, the official AI assistant for NIKHILVERSE.

Answer the user's question naturally and helpfully.

If the user asks about NIKHILVERSE videos, documentaries, shows or content, use the supplied video information when relevant.

If matching videos are available, mention their titles clearly.

You can answer in Hindi, Hinglish or English depending on the user's question.

Do not invent NIKHILVERSE videos that are not present in the supplied context.

For general questions, answer normally and helpfully.

NIKHILVERSE VIDEO CONTEXT:
${videoContext}
`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5',
        instructions: systemInstructions,
        input: q,
        store: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', JSON.stringify(data));

      return res.status(response.status).json({
        error: data?.error?.message || `OpenAI API request failed (${response.status}).`
      });
    }

    // Raw Responses API: extract text from output -> message -> content.
    const answer = (data.output || [])
      .filter(item => item.type === 'message')
      .flatMap(item => item.content || [])
      .filter(part => part.type === 'output_text')
      .map(part => part.text || '')
      .join('\n')
      .trim();

    if (!answer) {
      console.error('OpenAI returned no text:', JSON.stringify(data));

      return res.status(502).json({
        error: 'OpenAI returned no text response.'
      });
    }

    return res.json({
      answer,
      results: results.map(({ score, ...video }) => video)
    });

  } catch (err) {
    console.error('Nikhil AI error:', err);

    return res.status(500).json({
      error: 'Nikhil AI server error: ' + (err.message || 'Unknown error')
    });
  }
});


// ======================================================
// FRONTEND FALLBACK
// ======================================================

app.get(
  '*',
  (req, res) =>
    res.sendFile(
      path.join(
        __dirname,
        '../public/index.html'
      )
    )
);


// ======================================================
// START SERVER
// ======================================================

app.listen(
  PORT,
  '0.0.0.0',
  () => {

    console.log(
      `NIKHILVERSE running on port ${PORT}`
    );

    // First sync 2 seconds after startup
    setTimeout(
      () => {

        syncYouTube()
          .then(r =>
            console.log(
              'YouTube sync:',
              r
            )
          )
          .catch(e =>
            console.error(
              'YouTube sync failed:',
              e.message
            )
          );

      },
      2000
    );


    // Automatic sync every 15 minutes
    setInterval(
      () => {

        syncYouTube()
          .then(r =>
            console.log(
              'YouTube sync:',
              r
            )
          )
          .catch(e =>
            console.error(
              'YouTube sync failed:',
              e.message
            )
          );

      },
      Number(
        process.env.YOUTUBE_SYNC_INTERVAL_MS ||
        900000
      )
    );
  }
);
