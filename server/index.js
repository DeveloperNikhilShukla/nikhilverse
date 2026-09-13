require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

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
// REALTIME YOUTUBE STATS
// ======================================================

app.get('/api/youtube/stats', async (req, res) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(503).json({
        ok: false,
        error: 'YOUTUBE_API_KEY is not configured'
      });
    }

    const channels = {};

    for (const channel of youtubeChannels) {
      const response = await youtubeGet('channels', {
        part: 'statistics,snippet',
        forHandle: channel.handle
      });

      const item = response.items?.[0];
      if (!item) continue;

      channels[channel.handle] = {
        name: item.snippet?.title || channel.name,
        handle: channel.handle,
        subscribers: Number(item.statistics?.subscriberCount || 0),
        views: Number(item.statistics?.viewCount || 0),
        videos: Number(item.statistics?.videoCount || 0)
      };
    }

    const totalSubscribers = Object.values(channels)
      .reduce((total, channel) => total + Number(channel.subscribers || 0), 0);

    const ids = db.videos
      .filter(v => v.youtube_id)
      .map(v => v.youtube_id);

    const videos = {};

    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      if (!batch.length) continue;

      const response = await youtubeGet('videos', {
        part: 'statistics',
        id: batch.join(',')
      });

      for (const item of response.items || []) {
        videos[item.id] = {
          views: Number(item.statistics?.viewCount || 0),
          likes: Number(item.statistics?.likeCount || 0),
          comments: Number(item.statistics?.commentCount || 0)
        };
      }
    }

    res.json({
      ok: true,
      channels,
      totalSubscribers,
      videos,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Realtime YouTube stats failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Unable to fetch YouTube statistics'
    });
  }
});


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
// YOUTUBE PLAYLISTS
// ======================================================

app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = [];
    for (const channel of youtubeChannels) {
      const channelResponse = await youtubeGet('channels', { part: 'id,snippet', forHandle: channel.handle });
      const channelItem = channelResponse.items?.[0];
      if (!channelItem) continue;
      let pageToken = '';
      do {
        const params = { part: 'snippet,contentDetails', channelId: channelItem.id, maxResults: '50' };
        if (pageToken) params.pageToken = pageToken;
        const response = await youtubeGet('playlists', params);
        for (const playlist of response.items || []) {
          const snippet = playlist.snippet || {};
          const thumbnails = snippet.thumbnails || {};
          const thumbnail = thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || '';
          playlists.push({ id: playlist.id, title: snippet.title || 'Untitled Playlist', description: snippet.description || '', thumbnail, channel: channel.name, channelHandle: channel.handle, videoCount: Number(playlist.contentDetails?.itemCount || 0) });
        }
        pageToken = response.nextPageToken || '';
      } while (pageToken);
    }
    const unique = Array.from(new Map(playlists.map(p => [p.id, p])).values());
    res.json({ ok: true, count: unique.length, playlists: unique });
  } catch (error) {
    console.error('YouTube playlists error:', error);
    res.status(500).json({ ok: false, error: error.message || 'Unable to load playlists' });
  }
});

app.get('/api/playlist', async (req, res) => {
  try {
    const playlistId = String(req.query.id || '').trim();
    if (!playlistId) return res.status(400).json({ ok: false, error: 'Playlist ID is required' });
    const playlistResponse = await youtubeGet('playlists', { part: 'snippet,contentDetails', id: playlistId, maxResults: '1' });
    const playlist = playlistResponse.items?.[0];
    if (!playlist) return res.status(404).json({ ok: false, error: 'Playlist not found' });
    const videos = [];
    let pageToken = '';
    do {
      const params = { part: 'snippet,contentDetails,status', playlistId, maxResults: '50' };
      if (pageToken) params.pageToken = pageToken;
      const response = await youtubeGet('playlistItems', params);
      for (const item of response.items || []) {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        if (!videoId || item.status?.privacyStatus === 'private' || item.snippet?.title === 'Deleted video') continue;
        const thumbnails = item.snippet?.thumbnails || {};
        const thumbnail = thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        videos.push({ videoId, youtube_id: videoId, title: item.snippet?.title || 'Untitled video', description: item.snippet?.description || '', thumbnail, position: Number(item.snippet?.position ?? videos.length), channelTitle: item.snippet?.videoOwnerChannelTitle || '' });
      }
      pageToken = response.nextPageToken || '';
    } while (pageToken);
    videos.sort((a, b) => a.position - b.position);
    res.json({ ok: true, playlist: { id: playlist.id, title: playlist.snippet?.title || 'Playlist', description: playlist.snippet?.description || '', channelTitle: playlist.snippet?.channelTitle || '', videoCount: Number(playlist.contentDetails?.itemCount || videos.length) }, videos });
  } catch (error) {
    console.error('YouTube playlist detail error:', error);
    res.status(500).json({ ok: false, error: error.message || 'Unable to load playlist' });
  }
});

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
// RAZORPAY PLACEHOLDER
// ======================================================

app.post(
  '/api/payment/create',
  (req, res) => {

    if (
      !process.env.RAZORPAY_KEY_ID
    ) {

      return res.status(503).json({
        error:
          'Razorpay is not configured. Add RAZORPAY_KEY_ID/SECRET and webhook settings to .env.'
      });
    }

    res.json({

      configured: true,

      message:
        'Razorpay order endpoint placeholder ready for gateway SDK integration.'
    });
  }
);


// ======================================================
// ======================================================
// NIKHIL AI - OPENAI
// ======================================================

app.post('/api/ai', async (req, res) => {
  try {
    const q = String(req.body.message || '').trim();

    if (!q) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OPENAI_API_KEY is not configured'
      });
    }

    const terms = q
      .toLowerCase()
      .split(/\s+/)
      .filter(x => x.length > 2);

    const matches = db.videos
      .filter(v => {
        const text = String(
          (v.title || '') + ' ' +
          (v.description || '') + ' ' +
          (v.category || '') + ' ' +
          (v.channel || '')
        ).toLowerCase();

        return terms.some(t => text.includes(t));
      })
      .slice(0, 10);

    const contextVideos = matches.length
      ? matches
      : db.videos.slice(0, 10);

    const contentContext = contextVideos
      .map((v, i) =>
        `${i + 1}. ${v.title}
Channel: ${v.channel || 'NIKHILVERSE'}
Category: ${v.category || 'Videos'}
URL: ${v.youtube_url || ''}
Description: ${v.description || ''}`
      )
      .join('\n\n');

    const systemInstructions = `
You are Nikhil AI, the official AI assistant for NIKHILVERSE.

Your job:
- Answer users naturally and helpfully.
- You can answer general questions.
- Help users discover NIKHILVERSE documentaries, videos and content.
- When relevant, use the NIKHILVERSE content provided below.
- Never invent a NIKHILVERSE video, title, URL, channel or fact.
- If the provided NIKHILVERSE content does not contain the requested information, clearly say that you could not find it.
- Reply in the same language/style as the user.
- For Hindi/Hinglish users, reply in natural Hindi/Hinglish.
- Keep normal answers concise but useful.

NIKHILVERSE CONTENT:
${contentContext}
`;

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);

      return res.status(500).json({
        error:
          data?.error?.message ||
          'OpenAI API request failed'
      });
    }

    const answer =
      data.output_text ||
      'Sorry, mujhe abhi response nahi mila.';

    res.json({
      answer,
      results: matches
    });

  } catch (e) {
    console.error('Nikhil AI error:', e);

    res.status(500).json({
      error: 'Nikhil AI temporarily unavailable'
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