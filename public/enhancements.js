(function(){
  'use strict';
  const APK='https://github.com/DeveloperNikhilShukla/Repository-name-nikhilverse-android/releases/latest/download/NIKHILVERSE.apk';
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function injectUI(){
    if(document.getElementById('nvEnhancements')) return;
    const style=document.createElement('style'); style.id='nvEnhancements'; style.textContent=`
      .nv-app-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 13px;border-radius:20px;text-decoration:none;font-weight:800;font-size:12px;color:#fff!important;background:linear-gradient(135deg,#118cff,#6d55ff);box-shadow:0 0 18px rgba(45,143,255,.32);border:1px solid #67b9ff;white-space:nowrap}.nv-app-btn:hover{transform:translateY(-1px);box-shadow:0 0 25px rgba(45,143,255,.5)}
      .nv-tools{width:min(1250px,92%);margin:18px auto 0;display:flex;gap:9px;flex-wrap:wrap;align-items:center}.nv-pill{border:1px solid #213957;background:#081321;color:#9eb4cc;padding:8px 12px;border-radius:999px;cursor:pointer;font-size:12px}.nv-pill.active,.nv-pill:hover{color:#fff;border-color:#49a9ff;background:#0d2741}.nv-watchlist-count{font-size:11px;color:#6faeff;margin-left:auto}
      .nv-newsletter{width:min(1250px,92%);margin:35px auto;padding:25px;border:1px solid #1d3854;border-radius:16px;background:linear-gradient(135deg,#081522,#0b1829);display:flex;align-items:center;justify-content:space-between;gap:20px}.nv-newsletter h3{margin:0 0 6px}.nv-newsletter p{margin:0;color:#8298b0;font-size:12px}.nv-newsletter form{display:flex;gap:8px}.nv-newsletter input{background:#050b14;border:1px solid #29435f;color:#fff;border-radius:9px;padding:11px 13px;min-width:230px}.nv-newsletter button{border:0;border-radius:9px;padding:11px 15px;font-weight:800;cursor:pointer}.nv-timeline{width:min(1250px,92%);margin:30px auto;padding:20px;border:1px solid #1a3048;border-radius:16px;background:#07111e}.nv-timeline-track{display:flex;gap:10px;overflow:auto;padding-bottom:5px}.nv-era{min-width:170px;padding:13px;border:1px solid #1d3854;border-radius:12px;background:#091725}.nv-era b{display:block;color:#63b8ff;font-size:12px}.nv-era span{display:block;margin-top:5px;color:#aabbd0;font-size:11px;line-height:1.4}
      .nv-quiz{position:fixed;inset:0;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;z-index:100000;padding:20px}.nv-quiz.open{display:flex}.nv-quiz-card{width:min(520px,100%);background:#081321;border:1px solid #2a4b6b;border-radius:18px;padding:25px;box-shadow:0 30px 80px #000}.nv-quiz-card h2{margin-top:0}.nv-q{color:#a9bdd2;line-height:1.6}.nv-answers{display:grid;gap:9px;margin-top:15px}.nv-answer{padding:11px;border:1px solid #29445f;border-radius:10px;background:#0a1828;color:#fff;text-align:left;cursor:pointer}.nv-answer:hover{border-color:#4daaff}.nv-close{float:right;border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}
      .nv-continue{width:min(1250px,92%);margin:20px auto;padding:18px;border:1px solid #1d3854;border-radius:14px;background:#07111e}.nv-continue h3{margin:0 0 12px}.nv-continue-card{display:flex;gap:14px;align-items:center}.nv-continue-card img{width:180px;height:100px;object-fit:cover;border-radius:9px}.nv-continue-card button{border:0;border-radius:9px;padding:10px 14px;font-weight:800;cursor:pointer}.nv-install{display:none}.nv-install.show{display:inline-flex}
      .nv-preview{position:absolute!important;inset:0;width:100%;height:100%;border:0;z-index:3;pointer-events:none}.card,.video-card{position:relative}.nv-save{position:absolute;right:9px;top:9px;z-index:8;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(2,8,15,.8);color:#fff;cursor:pointer}.nv-save.saved{background:#168cff}.card{cursor:pointer}
      @media(max-width:900px){
        .nv-mobile-menu-btn{display:flex!important;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid #294766;border-radius:12px;background:#081321;color:#fff;font-size:22px;cursor:pointer;flex:0 0 auto}
        .nv-mobile-menu{display:none;position:fixed;left:10px;right:10px;top:68px;z-index:100001;background:rgba(5,9,18,.98);border:1px solid #294766;border-radius:16px;padding:10px;box-shadow:0 25px 70px rgba(0,0,0,.7)}
        .nv-mobile-menu.open{display:block}
        .nv-mobile-menu a,.nv-mobile-menu button{display:flex;width:100%;align-items:center;gap:10px;padding:13px 14px;margin:2px 0;border:0;border-radius:10px;background:transparent;color:#dce9f6;text-decoration:none;font:inherit;text-align:left;cursor:pointer}
        .nv-mobile-menu a:hover,.nv-mobile-menu button:hover{background:#10253b;color:#fff}
        .nv-mobile-search{display:flex;gap:7px;padding:8px}.nv-mobile-search input{flex:1;min-width:0;background:#050b14;border:1px solid #29435f;color:#fff;border-radius:10px;padding:11px}.nv-mobile-search button{width:auto;margin:0;background:#168cff;color:#fff;font-weight:800;padding:10px 13px}
        .header-actions{gap:6px!important}.header-actions .nv-app-btn{display:none}
        .nv-tools{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none;padding-bottom:6px}.nv-tools::-webkit-scrollbar{display:none}.nv-pill{flex:0 0 auto}
        .nv-newsletter,.nv-continue,.nv-timeline{width:94%;}.nv-newsletter{flex-direction:column;align-items:stretch}.nv-newsletter form{flex-direction:column}.nv-newsletter input{min-width:0;width:100%}
      }
      .nv-mobile-menu-btn{display:none}
      @media(max-width:700px){
        .nv-app-btn{padding:8px 10px}.nv-watchlist-count{margin-left:0}.nv-continue-card{flex-wrap:wrap}.nv-continue-card img{width:130px;height:75px}
        .nv-quiz{padding:10px}.nv-quiz-card{padding:18px;max-height:90vh;overflow:auto}.nv-era{min-width:145px}
        .nv-mobile-menu{top:62px}
      }
    `; document.head.appendChild(style);

    // App links in header/footer, admin links hidden from public UI
    $$('a[href="/admin/"],a[href="/admin"]').forEach(a=>a.remove());
    addMobileNavigation();
    const actions=$('.header-actions');
    if(actions && !actions.querySelector('.nv-app-btn')){ const a=document.createElement('a'); a.className='nv-app-btn'; a.href=APK; a.target='_blank'; a.rel='noopener'; a.textContent='📱 Android App'; actions.insertBefore(a, actions.firstChild); }
    const footer=$('footer');
    if(footer && !footer.querySelector('.nv-footer-app')){ const a=document.createElement('a'); a.className='nv-app-btn nv-footer-app'; a.href=APK; a.target='_blank'; a.rel='noopener'; a.textContent='📱 Download Android App'; a.style.margin='12px 0'; footer.appendChild(a); }

    // Search and category controls
    const videos=$('#videos');
    if(videos && !$('#nvTools')){
      const tools=document.createElement('div'); tools.id='nvTools'; tools.className='nv-tools'; tools.innerHTML=`<button class="nv-pill active" data-filter="all">All</button><button class="nv-pill" data-filter="documentaries">Documentaries</button><button class="nv-pill" data-filter="sci-fi">Sci-Fi</button><button class="nv-pill" data-filter="aliens">Aliens</button><button class="nv-pill" data-filter="mythology">Mythology</button><button class="nv-pill" data-filter="ancient">Ancient History</button><button class="nv-pill" id="nvQuizBtn">🧠 Quiz</button><span class="nv-watchlist-count" id="nvWLCount">Watchlist: 0</span><span class="nv-watchlist-count" id="nvBadge">🌌 Cosmic Explorer · Streak 0</span>`;
      videos.insertBefore(tools, videos.querySelector('.video-grid'));
      tools.addEventListener('click',e=>{const b=e.target.closest('.nv-pill'); if(!b)return; if(b.id==='nvQuizBtn'){openQuiz();return;} $$('.nv-pill[data-filter]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); filterCards(b.dataset.filter);});
    }
    addContinue(); addTimeline(); addNewsletter(); addQuiz(); updateWatchlistCount();
  }

  function addMobileNavigation(){
    if(document.getElementById('nvMobileMenu')) return;
    const header=document.querySelector('header');
    const nav=header?.querySelector('nav');
    if(!header||!nav) return;
    const btn=document.createElement('button'); btn.className='nv-mobile-menu-btn'; btn.type='button'; btn.setAttribute('aria-label','Open menu'); btn.setAttribute('aria-expanded','false'); btn.textContent='☰';
    nav.insertBefore(btn,nav.firstChild);
    const menu=document.createElement('div'); menu.id='nvMobileMenu'; menu.className='nv-mobile-menu';
    menu.innerHTML=`<div class="nv-mobile-search"><input id="nvMobileSearch" type="search" placeholder="Search videos…" autocomplete="off"><button type="button" id="nvMobileSearchBtn">Search</button></div>
      <a href="#home">🏠 Home</a><a href="#videos">🎬 Movies / Videos</a><a href="#shows">📺 TV Shows</a><a href="#documentaries">🎞️ Documentaries</a><a href="#scifi">🛸 Sci-Fi</a><button type="button" id="nvMobilePlaylists">📂 Playlists</button><a href="#premium">👑 Premium</a><a href="#videos" id="nvMobileMyList">💾 My List</a><a class="nv-mobile-app" href="${APK}" target="_blank" rel="noopener">📱 Download Android App</a><button type="button" id="nvMobileAI">🤖 Nikhil AI</button>`;
    header.appendChild(menu);
    const close=()=>{menu.classList.remove('open');btn.setAttribute('aria-expanded','false');};
    btn.addEventListener('click',e=>{e.stopPropagation();const open=menu.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    menu.querySelector('#nvMobileAI')?.addEventListener('click',()=>{close();window.openAI?.();});
    menu.querySelector('#nvMobilePlaylists')?.addEventListener('click',()=>{close();document.getElementById('playlistNavBtn')?.click();});
    menu.querySelector('#nvMobileMyList')?.addEventListener('click',e=>{e.preventDefault();close();document.querySelector('#videos')?.scrollIntoView({behavior:'smooth'});setTimeout(()=>filterCards('watchlist'),250);});
    const runSearch=()=>{const q=(menu.querySelector('#nvMobileSearch')?.value||'').toLowerCase().trim(); close(); document.querySelector('#videos')?.scrollIntoView({behavior:'smooth'}); setTimeout(()=>{$$('#videoGrid .card').forEach(c=>c.style.display=!q||c.innerText.toLowerCase().includes(q)?'':'none');},250);};
    menu.querySelector('#nvMobileSearchBtn')?.addEventListener('click',runSearch); menu.querySelector('#nvMobileSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter')runSearch();});
    document.addEventListener('click',e=>{if(menu.classList.contains('open')&&!menu.contains(e.target)&&e.target!==btn)close();});
  }

  function filterCards(filter){
    const cards=$$('#videoGrid .card'); cards.forEach(c=>{const t=(c.innerText||'').toLowerCase(); const id=c.dataset.videoId||''; const wl=JSON.parse(localStorage.getItem('nv_watchlist')||'[]'); c.style.display=filter==='all'||(filter==='watchlist'&&wl.includes(id))||t.includes(filter)?'':'none';});
  }
  function updateWatchlistCount(){const wl=JSON.parse(localStorage.getItem('nv_watchlist')||'[]'); const el=$('#nvWLCount'); if(el)el.textContent='Watchlist: '+wl.length; const b=$('#nvBadge'); if(b){const today=new Date().toISOString().slice(0,10);let s=JSON.parse(localStorage.getItem('nv_streak')||'{"last":"","count":0}');if(s.last!==today){const y=new Date(Date.now()-86400000).toISOString().slice(0,10);s.count=s.last===y?s.count+1:1;s.last=today;localStorage.setItem('nv_streak',JSON.stringify(s));}const badge=s.count>=14?'🏆 Universe Master':s.count>=7?'🚀 Space Explorer':'🌌 Cosmic Explorer';b.textContent=badge+' · Streak '+s.count;}}
  function toggleWL(id){let wl=JSON.parse(localStorage.getItem('nv_watchlist')||'[]'); wl=wl.includes(id)?wl.filter(x=>x!==id):[...wl,id]; localStorage.setItem('nv_watchlist',JSON.stringify(wl)); updateWatchlistCount(); return wl.includes(id);}
  function enhanceCards(){
    $$('.card').forEach(c=>{
      if(c.dataset.nvEnhanced)return; c.dataset.nvEnhanced='1';
      const m=c.getAttribute('onclick')||''; const id=(m.match(/youtube_id[^']*['"]\s*\+?[^]*?/i)||[]); // fallback from href-like onclick is handled below
      const text=c.innerHTML; const yt=(text.match(/vi\/([A-Za-z0-9_-]{6,})/)||[])[1];
      let videoId=c.dataset.videoId || yt; if(!videoId){const img=c.querySelector('img'); const src=img?.src||''; videoId=(src.match(/vi\/([A-Za-z0-9_-]{6,})/)||[])[1];}
      if(!videoId){return;}
      c.addEventListener('click',e=>{if(e.target.closest('.nv-save'))return; e.preventDefault(); location.href='/watch.html?id='+encodeURIComponent(videoId);},true);
      const b=document.createElement('button'); b.className='nv-save'; b.type='button'; b.title='Save to Watchlist'; const saved=JSON.parse(localStorage.getItem('nv_watchlist')||'[]').includes(videoId); b.classList.toggle('saved',saved); b.textContent=saved?'✓':'＋'; b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const s=toggleWL(videoId);b.classList.toggle('saved',s);b.textContent=s?'✓':'＋';}); c.appendChild(b);
      let timer; c.addEventListener('mouseenter',()=>{if(window.innerWidth<900)return;timer=setTimeout(()=>{const thumb=c.querySelector('.thumb,.video-thumb');if(!thumb||thumb.querySelector('.nv-preview'))return;const iframe=document.createElement('iframe');iframe.className='nv-preview';iframe.src='https://www.youtube.com/embed/'+encodeURIComponent(videoId)+'?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1';iframe.allow='autoplay; encrypted-media';thumb.appendChild(iframe);},800);}); c.addEventListener('mouseleave',()=>{clearTimeout(timer);const p=c.querySelector('.nv-preview');if(p)p.remove();});
    });
  }
  function addContinue(){
    if($('#nvContinue'))return; const data=JSON.parse(localStorage.getItem('nv_continue')||'null'); if(!data?.id)return; const box=document.createElement('section'); box.id='nvContinue'; box.className='nv-continue'; box.innerHTML=`<h3>▶ Continue Watching</h3><div class="nv-continue-card"><img src="https://i.ytimg.com/vi/${encodeURIComponent(data.id)}/hqdefault.jpg"><div><b>${esc(data.title||'Continue watching')}</b><p style="color:#8097af;font-size:12px">Resume from ${Math.floor(data.time||0)} seconds</p><button onclick="location.href='/watch.html?id=${encodeURIComponent(data.id)}'">Resume →</button></div></div>`; const home=$('#videos'); home?.parentNode?.insertBefore(box,home); }
  function addTimeline(){ if($('#nvTimeline'))return; const sec=document.createElement('section'); sec.id='nvTimeline'; sec.className='nv-timeline'; sec.innerHTML='<h2>🌌 Universe Timeline</h2><div class="nv-timeline-track"><div class="nv-era"><b>Big Bang</b><span>Origins of the observable universe.</span></div><div class="nv-era"><b>Ancient Egypt</b><span>Myths, monuments and mysteries.</span></div><div class="nv-era"><b>Ramayana Era</b><span>Stories, archaeology and traditions.</span></div><div class="nv-era"><b>Modern Space Age</b><span>NASA, planets, aliens and exploration.</span></div><div class="nv-era"><b>Future 3000 AD</b><span>Speculative futures and civilizations.</span></div></div>'; const s=$('#blog'); if(s)s.parentNode.insertBefore(sec,s); }
  function addNewsletter(){ if($('footer')&&!$('#nvNewsletter')){const sec=document.createElement('section');sec.id='nvNewsletter';sec.className='nv-newsletter';sec.innerHTML='<div><h3>🔔 New Episode Alerts</h3><p>Get a simple alert when new NIKHILVERSE episodes arrive.</p></div><form><input type="email" required placeholder="Your email address"><button>Subscribe</button></form>'; document.querySelector('footer').parentNode.insertBefore(sec,document.querySelector('footer')); sec.querySelector('form').addEventListener('submit',e=>{e.preventDefault();localStorage.setItem('nv_newsletter',sec.querySelector('input').value);sec.querySelector('form').innerHTML='<b>✓ Subscribed to NIKHILVERSE alerts</b>';}); if(localStorage.getItem('nv_newsletter'))sec.querySelector('form').innerHTML='<b>✓ You are subscribed</b>';}}
  function addQuiz(){if($('#nvQuiz'))return;const q=document.createElement('div');q.id='nvQuiz';q.className='nv-quiz';q.innerHTML='<div class="nv-quiz-card"><button class="nv-close">×</button><h2>🧠 NIKHILVERSE Quiz</h2><div class="nv-q">Which topic best matches NIKHILVERSE?</div><div class="nv-answers"><button class="nv-answer">Space & Sci-Fi</button><button class="nv-answer">Ancient Mysteries</button><button class="nv-answer">Technology & History</button></div><p id="nvQuizResult" style="color:#6fbaff"></p></div>';document.body.appendChild(q);q.querySelector('.nv-close').onclick=()=>q.classList.remove('open');q.querySelectorAll('.nv-answer').forEach(b=>b.onclick=()=>{$('#nvQuizResult').textContent='✓ Great choice — explore the latest NIKHILVERSE videos!'; localStorage.setItem('nv_quiz_done','1');});}
  function openQuiz(){$('#nvQuiz')?.classList.add('open');}
  window.nvOpenQuiz=openQuiz;

  function registerPWA(){if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{}); let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const b=$('.nv-install');if(b)b.classList.add('show');}); window.nvInstall=()=>{if(deferred){deferred.prompt();deferred=null;}};}
  function init(){injectUI(); registerPWA(); $$('#videoGrid .card').forEach(()=>{}); $$("a").filter(a=>/My List/i.test(a.textContent||'')).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector('#videos')?.scrollIntoView({behavior:'smooth'});setTimeout(()=>filterCards('watchlist'),250);})); const obs=new MutationObserver(()=>enhanceCards()); const grid=$('#videoGrid'); if(grid)obs.observe(grid,{childList:true,subtree:true}); enhanceCards(); const search=$('#siteSearch'); if(search){search.addEventListener('input',()=>{const q=search.value.toLowerCase().trim(); $$('#videoGrid .card').forEach(c=>c.style.display=!q||c.innerText.toLowerCase().includes(q)?'':'none');});} setInterval(enhanceCards,1500);}
  document.addEventListener('DOMContentLoaded',init);
})();
