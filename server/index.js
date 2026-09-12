require('dotenv').config();
const express=require('express'),path=require('path'),fs=require('fs'),jwt=require('jsonwebtoken'),bcrypt=require('bcryptjs'),multer=require('multer');
const app=express(),PORT=process.env.PORT||3000;
const dataDir=path.join(__dirname,'../data'), uploadDir=path.join(__dirname,'../uploads');
fs.mkdirSync(dataDir,{recursive:true}); fs.mkdirSync(uploadDir,{recursive:true});
const dbFile=path.join(dataDir,'db.json');
const initial={users:[],videos:[],blogs:[],plans:[{id:1,name:'Premium',price:99,period:'month',features:'Exclusive documentaries, early access, premium blogs',active:1},{id:2,name:'Premium+',price:199,period:'month',features:'All Premium benefits, exclusive series, bonus content',active:1}],payments:[],settings:{site_name:'NIKHILVERSE',youtube_sync:'off',ai_enabled:'on',razorpay_enabled:'off'}};
let db;
try{db=JSON.parse(fs.readFileSync(dbFile,'utf8'));}catch(e){db=initial;save();}
function save(){fs.writeFileSync(dbFile,JSON.stringify(db,null,2));}
function idOf(a){return a.length?Math.max(...a.map(x=>Number(x.id)||0))+1:1;}
app.use(express.json({limit:'10mb'}));app.use(express.urlencoded({extended:true}));app.use('/uploads',express.static(uploadDir));app.use(express.static(path.join(__dirname,'../public')));app.use('/admin',express.static(path.join(__dirname,'../admin')));
// YouTube Data API v3 auto-sync (server-side; API key is NEVER stored in source code).
const YOUTUBE_API_BASE='https://www.googleapis.com/youtube/v3';
const youtubeChannels=[
  {name:'SIFI By Nikhil',handle:'@SIFIByNikhil'},
  {name:'TAH By Nikhil',handle:'@TAHBYNikhil2'}
];

async function youtubeGet(endpoint, params){
  const key=process.env.YOUTUBE_API_KEY;
  if(!key) throw new Error('YOUTUBE_API_KEY is not configured');
  const url=new URL(YOUTUBE_API_BASE+'/'+endpoint);
  Object.entries({...params,key}).forEach(([k,v])=>url.searchParams.set(k,v));
  const r=await fetch(url);
  const data=await r.json();
  if(!r.ok) throw new Error(data?.error?.message || `YouTube API error ${r.status}`);
  return data;
}

async function syncYouTube() {
  if (!process.env.YOUTUBE_API_KEY) {
    return { skipped: true, reason: 'YOUTUBE_API_KEY missing' };
  }

  let added = 0;
  let updated = 0;
  let channels = 0;
  let skippedShorts = 0;

  for (const channel of youtubeChannels) {
    const ch = await youtubeGet('channels', {
      part: 'contentDetails,snippet',
      forHandle: channel.handle
    });

    const channelItem = ch.items?.[0];

    if (!channelItem) {
      throw new Error(`YouTube channel not found: ${channel.handle}`);
    }

    channels++;

    const uploadsId =
      channelItem.contentDetails.relatedPlaylists.uploads;

    let pageToken = '';

    // Fetch ALL pages, not only first 50 videos
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

      for (const x of items) {
        const videoId =
          x.contentDetails?.videoId ||
          x.snippet?.resourceId?.videoId;

        if (!videoId) continue;

        // Skip private/deleted videos
        if (x.status?.privacyStatus === 'private') continue;

        const title = x.snippet?.title || '';
        const description = x.snippet?.description || '';

        /*
         * Get actual video duration.
         * YouTube returns ISO-8601 duration such as:
         * PT2M30S = 2 minutes 30 seconds
         */
        const videoResponse = await youtubeGet('videos', {
          part: 'contentDetails',
          id: videoId
        });

        const video = videoResponse.items?.[0];

        if (!video) continue;

        const durationISO =
          video.contentDetails?.duration || 'PT0S';

        // Convert ISO duration to seconds
        const durationMatch = durationISO.match(
          /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );

        const hours = Number(durationMatch?.[1] || 0);
        const minutes = Number(durationMatch?.[2] || 0);
        const seconds = Number(durationMatch?.[3] || 0);

        const totalSeconds =
          hours * 3600 +
          minutes * 60 +
          seconds;

        /*
         * Shorts filter:
         * 1. #shorts in title/description
         * 2. Videos <= 3 minutes
         */
        const isShort =
          /(^|\s)#shorts\b/i.test(title) ||
          /(^|\s)#shorts\b/i.test(description) ||
          totalSeconds <= 180;

        if (isShort) {
          skippedShorts++;
          continue;
        }

        const publishedAt =
          x.contentDetails?.videoPublishedAt ||
          x.snippet?.publishedAt ||
          new Date().toISOString();

        const thumbs =
          x.snippet?.thumbnails || {};

        const thumb =
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          thumbs.medium?.url ||
          thumbs.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        const existing = db.videos.find(
          v => v.youtube_id === videoId
        );

        const itemData = {
          id: existing?.id || nextId(db.videos),
          title: title,
          description: description,
          thumbnail: thumb,
          youtube_id: videoId,
          channel: channel.name,
          category:
            'Documentaries',
          access: existing?.access || 'free',
          published_at: publishedAt,
          status: existing?.status || 'published',
          source: 'youtube',
          youtube_url:
            `https://www.youtube.com/watch?v=${videoId}`
        };

        if (existing) {
          Object.assign(existing, itemData);
          updated++;
        } else {
          db.videos.push(itemData);
          added++;
        }
      }

      // Move to next page
      pageToken =
        playlistResponse.nextPageToken || '';

    } while (pageToken);
  }

  db.settings.youtube_last_sync =
    new Date().toISOString();

  save();

  return {
    ok: true,
    channels,
    added,
    updated,
    skippedShorts,
    total: db.videos.length,
    lastSync: db.settings.youtube_last_sync
  };
}

app.get('/api/youtube/status',(req,res)=>res.json({
  configured:Boolean(process.env.YOUTUBE_API_KEY),
  sync:db.settings.youtube_sync||'off',
  lastSync:db.settings.youtube_last_sync||null
}));

app.post('/api/admin/youtube-sync',auth,admin,async(req,res)=>{
  try{res.json(await syncYouTube());}
  catch(e){res.status(500).json({error:e.message});}
});

const upload=multer({storage:multer.diskStorage({destination:uploadDir,filename:(r,f)=>Date.now()+'-'+f.originalname.replace(/[^a-z0-9._-]/gi,'_')})});
function auth(req,res,next){try{req.user=jwt.verify((req.headers.authorization||'').replace('Bearer ',''),process.env.JWT_SECRET||'dev-secret');next()}catch(e){res.status(401).json({error:'Unauthorized'})}}
function admin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({error:'Admin only'});next()}
app.get('/api/videos',(req,res)=>res.json(db.videos.filter(v=>!v.status||v.status==='published').sort((a,b)=>String(b.published_at||'').localeCompare(String(a.published_at||'')))));
app.get('/api/blogs',(req,res)=>res.json(db.blogs));
app.get('/api/plans',(req,res)=>res.json(db.plans.filter(p=>p.active!==0)));
app.post('/api/register',async(req,res)=>{const {name='',email='',password=''}=req.body;if(!email||!password)return res.status(400).json({error:'Email and password required'});if(db.users.some(u=>u.email===email))return res.status(400).json({error:'Email already registered'});const u={id:idOf(db.users),name,email,password:await bcrypt.hash(password,10),plan:'free',created_at:new Date().toISOString()};db.users.push(u);save();res.json({id:u.id});});
app.post('/api/login',async(req,res)=>{const u=db.users.find(x=>x.email===req.body.email);if(!u||!(await bcrypt.compare(req.body.password||'',u.password)))return res.status(401).json({error:'Invalid credentials'});res.json({token:jwt.sign({id:u.id,email:u.email,plan:u.plan},process.env.JWT_SECRET||'dev-secret')});});
app.post('/api/admin/login',async(req,res)=>{const email=process.env.ADMIN_EMAIL||'admin@nikhilverse.media',password=process.env.ADMIN_PASSWORD||'change-me';if(req.body.email!==email||req.body.password!==password)return res.status(401).json({error:'Invalid admin credentials'});res.json({token:jwt.sign({role:'admin',email},process.env.JWT_SECRET||'dev-secret')});});
app.get('/api/me',auth,(req,res)=>res.json(db.users.find(u=>u.id===req.user.id)||req.user));
app.post('/api/admin/videos',auth,admin,(req,res)=>{const v=req.body;let item={id:v.id||idOf(db.videos),title:v.title||'',description:v.description||'',thumbnail:v.thumbnail||'',youtube_id:v.youtube_id||'',channel:v.channel||'',category:v.category||'',access:v.access||'free',published_at:v.published_at||new Date().toISOString(),status:v.status||'published'};const i=db.videos.findIndex(x=>x.id==item.id);if(i>=0)db.videos[i]=item;else db.videos.push(item);save();res.json(item);});
app.delete('/api/admin/videos/:id',auth,admin,(req,res)=>{db.videos=db.videos.filter(v=>v.id!=req.params.id);save();res.json({ok:true});});
app.post('/api/admin/blogs',auth,admin,(req,res)=>{const b=req.body,slug=b.slug||String(b.title||'article').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');const item={id:idOf(db.blogs),title:b.title||'',slug,excerpt:b.excerpt||'',content:b.content||'',featured_image:b.featured_image||'',images:b.images||[],author:b.author||'Nikhil',access:b.access||'public',created_at:new Date().toISOString()};db.blogs.push(item);save();res.json(item);});
app.post('/api/admin/upload',auth,admin,upload.single('image'),(req,res)=>res.json({url:'/uploads/'+req.file.filename}));
app.post('/api/admin/plans',auth,admin,(req,res)=>{const p={id:idOf(db.plans),name:req.body.name||'Premium',price:Number(req.body.price)||0,period:req.body.period||'month',features:req.body.features||'',active:1};db.plans.push(p);save();res.json(p);});
app.get('/api/admin/stats',auth,admin,(req,res)=>res.json({users:db.users.length,videos:db.videos.length,blogs:db.blogs.length,premium:db.users.filter(u=>u.plan!=='free').length,payments:db.payments.filter(p=>p.status==='paid').reduce((n,p)=>n+Number(p.amount||0),0)}));
app.get('/api/admin/settings',auth,admin,(req,res)=>res.json(db.settings));
app.post('/api/admin/settings',auth,admin,(req,res)=>{db.settings={...db.settings,...req.body};save();res.json(db.settings);});
app.post('/api/payment/create',(req,res)=>{if(!process.env.RAZORPAY_KEY_ID)return res.status(503).json({error:'Razorpay is not configured. Add RAZORPAY_KEY_ID/SECRET and webhook settings to .env.'});res.json({configured:true,message:'Razorpay order endpoint placeholder ready for gateway SDK integration.'});});
app.post('/api/ai',(req,res)=>{const q=String(req.body.message||'').trim();const terms=q.toLowerCase().split(/\s+/).filter(x=>x.length>2);const matches=db.videos.filter(v=>terms.some(t=>String(v.title+' '+v.description+' '+v.category).toLowerCase().includes(t))).slice(0,5);res.json({answer:process.env.OPENAI_API_KEY?'Nikhil AI is configured for API integration; connect your OpenAI Responses API call in this endpoint.':'Hi! Main Nikhil AI hoon. Main general questions mein help kar sakta hoon aur NIKHILVERSE ke available content ko search kar sakta hoon. Live AI replies ke liye OPENAI_API_KEY add karein.',results:matches});});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));

app.listen(PORT,'0.0.0.0',()=>{
  console.log(`NIKHILVERSE running on port ${PORT}`);
  // First sync shortly after startup, then every 15 minutes.
  setTimeout(()=>syncYouTube().then(r=>console.log('YouTube sync:',r)).catch(e=>console.error('YouTube sync failed:',e.message)),2000);
  setInterval(()=>syncYouTube().then(r=>console.log('YouTube sync:',r)).catch(e=>console.error('YouTube sync failed:',e.message)), Number(process.env.YOUTUBE_SYNC_INTERVAL_MS||900000));
});

