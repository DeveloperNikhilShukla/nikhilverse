(function(){
  const APK='https://github.com/DeveloperNikhilShukla/Repository-name-nikhilverse-android/releases/latest/download/NIKHILVERSE.apk';
  const socials=[
    {name:'YouTube · SIFI',href:'https://www.youtube.com/@SIFIByNikhil',cls:'youtube',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z"/></svg>'},
    {name:'YouTube · TAH',href:'https://www.youtube.com/@TAHBYNikhil2',cls:'youtube',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z"/></svg>'},
    {name:'Instagram',href:'https://www.instagram.com/',cls:'instagram',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>'},
    {name:'Facebook',href:'https://www.facebook.com/',cls:'facebook',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4.5c-.5-.1-2-.2-3.6-.2-3.5 0-5.9 2.1-5.9 6v3.4H4v3.9h3.5V22H12v-4.4h3.6l.6-3.9H12v-3c0-1.1.3-1.8 2-1.8Z"/></svg>'},
    {name:'X',href:'https://x.com/',cls:'x',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.2-8.3L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.7h1.7L8.4 4.2H6.6l11.2 15.5Z"/></svg>'},
    {name:'Telegram',href:'https://t.me/',cls:'telegram',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.7 3.6-3.1 16.1c-.2 1.1-.8 1.4-1.7.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.4-.1-.6-.6-.2L6.5 13.9l-4.7-1.5c-1-.3-1-1 .2-1.5L20.4 2.8c.9-.3 1.7.2 1.3.8Z"/></svg>'},
    {name:'WhatsApp',href:'https://wa.me/',cls:'whatsapp',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.4-1.7a11.8 11.8 0 0 0 5.5 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.3-6.2-3.5-8.4Zm-8.4 18.2h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.5-.8-2.5-1.4-3.5-3.1-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.9 5.2.8.3 1.4.5 1.9.6.8.3 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4Z"/></svg>'},
    {name:'Threads',href:'https://www.threads.net/',cls:'threads',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 22C6.2 22 3 18.2 3 12.2 3 6.3 6.2 2 12.3 2c4.7 0 7.6 2.2 8.5 6.3l-3.2.8c-.6-2.7-2.4-4-5.2-4-3.5 0-5.9 2.6-5.9 7.1 0 4.3 2.1 6.8 5.7 6.8 2.7 0 4.5-1.3 4.7-3.5.1-1.3-.6-2.1-2-2.5-.2 2.1-1.5 3.2-3.4 3.2-2 0-3.4-1.2-3.4-3.1 0-2 1.6-3.3 4-3.3 1.1 0 2.1.2 3 .5-.5-2.4-1.9-3.6-4.2-3.6-1.8 0-3.3.7-4.2 2.1l-2.2-1.9C7.8 4.8 9.7 4 12.2 4c4.5 0 7.1 2.8 7.4 7.8 2.1 1 3.1 2.5 3 4.5-.1 3.6-3.1 5.7-7.8 5.7h-2.7Z"/></svg>'},
    {name:'LinkedIn',href:'https://www.linkedin.com/',cls:'linkedin',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.3A2.2 2.2 0 1 1 .8 3.3a2.2 2.2 0 0 1 4.4 0ZM1 8h4.3v13H1V8Zm6.9 0h4.1v1.8h.1c.6-1.1 2-2.3 4.2-2.3 4.5 0 5.3 3 5.3 6.9V21h-4.3v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H7.9V8Z"/></svg>'},
    {name:'Discord',href:'https://discord.com/',cls:'discord',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 4.4A16.4 16.4 0 0 0 15.4 3l-.5 1a15 15 0 0 0-5.8 0l-.5-1a16.4 16.4 0 0 0-4.1 1.4C1.9 8.3 1.2 12.2 1.5 16.1A16.5 16.5 0 0 0 6.6 19l1.2-1.7c-.7-.3-1.3-.7-1.9-1.1l.5-.4c3.6 1.7 7.5 1.7 11 0l.5.4c-.6.4-1.2.8-1.9 1.1l1.2 1.7a16.5 16.5 0 0 0 5.1-2.9c.4-4.6-.8-8.5-2.8-11.7ZM8.7 14.1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm6.6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z"/></svg>'}
  ];
  const css=`
    :root{--nv-bg:#050912;--nv-panel:#07111e;--nv-card:#091525;--nv-text:#eef6ff;--nv-muted:#8fa5bc;--nv-line:#1b3651}
    body.nv-light{--nv-bg:#eef1f5;--nv-panel:#ffffff;--nv-card:#ffffff;--nv-text:#111820;--nv-muted:#536273;--nv-line:#cbd3dc;background:var(--nv-bg)!important;color:var(--nv-text)!important;position:relative;isolation:isolate}
    body.nv-light::before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(900px 520px at 8% 0%,rgba(229,9,20,.14),transparent 58%),radial-gradient(760px 500px at 92% 12%,rgba(20,80,160,.10),transparent 58%),linear-gradient(180deg,#f7f8fa 0%,#eef1f5 38%,#e6e9ee 100%)}
    body.nv-light::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.45;background-image:linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,black,transparent 80%)}
    body.nv-light main,body.nv-light .page,body.nv-light .content{background:transparent!important}
    body.nv-light .hero{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(238,241,245,.76))!important}
    body.nv-light .card,body.nv-light .mainbox,body.nv-light .side,body.nv-light .info,body.nv-light .comments,body.nv-light .appbox,body.nv-light .feature,body.nv-light .price{box-shadow:0 10px 30px rgba(22,35,50,.10)!important}
    body.nv-light .section-title h2,body.nv-light h1,body.nv-light h2,body.nv-light h3{color:#111820!important}
    body.nv-light .nv-app-hero{background:linear-gradient(105deg,#171b22,#2a3039 55%,#15181e)!important;border-color:#3d4652!important;color:#fff!important;box-shadow:0 14px 35px rgba(0,0,0,.18),0 0 26px rgba(229,9,20,.12)!important}
    body.nv-light .nv-social a{box-shadow:0 7px 20px rgba(20,30,40,.12)}
    body.nv-light .nv-blog-wrap{background:rgba(255,255,255,.92)!important;box-shadow:0 15px 40px rgba(20,30,40,.10)}
    body.nv-light .nv-player-shell{background:radial-gradient(circle at 50% 0%,#303844 0,#0e1218 55%,#050609 100%)!important}
    body.nv-light .nv-theme-btn{box-shadow:0 5px 16px rgba(20,30,40,.12)}
    body.nv-light header,.nv-light .head{background:rgba(255,255,255,.94)!important;border-color:var(--nv-line)!important}
    body.nv-light .card,body.nv-light .mainbox,body.nv-light .side,body.nv-light .info,body.nv-light .comments,body.nv-light .appbox,body.nv-light .feature,body.nv-light .price{background:var(--nv-card)!important;border-color:var(--nv-line)!important}
    body.nv-light .meta,body.nv-light .copy,body.nv-light .footer{color:var(--nv-muted)!important}
    .nv-theme-btn{border:1px solid #36506d;background:#0a1727;color:#fff;border-radius:999px;min-width:42px;height:38px;padding:0 12px;font-weight:800;cursor:pointer;box-shadow:0 0 18px rgba(54,151,255,.12)}
    .nv-light .nv-theme-btn{background:#edf4fb;color:#122338;border-color:#afc4d8}
    .nv-app-hero{width:min(1400px,94%);margin:14px auto 0;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #2b5c87;border-radius:15px;background:linear-gradient(100deg,#07182a,#102640 55%,#07182a);box-shadow:0 0 28px rgba(28,139,255,.14)}
    .nv-app-hero b{font-size:13px}.nv-app-hero small{display:block;color:#8fa7c0;margin-top:2px}.nv-app-download{display:inline-flex;align-items:center;gap:7px;padding:10px 15px;border-radius:999px;text-decoration:none;background:linear-gradient(135deg,#1695ff,#65c7ff);color:#00111e!important;font-weight:900;box-shadow:0 0 22px rgba(38,157,255,.38);white-space:nowrap}
    .nv-social{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.nv-social a{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:999px;border:1px solid #28435f;background:#091827;color:#dcecff;text-decoration:none;font-size:11px;font-weight:800;transition:.2s;box-shadow:0 5px 16px rgba(0,0,0,.18)}.nv-social a:hover{transform:translateY(-2px);filter:brightness(1.15);box-shadow:0 8px 24px rgba(0,0,0,.3)}.nv-social a svg{width:17px;height:17px;fill:currentColor;stroke:currentColor;stroke-width:0;flex:none}.nv-social .youtube{color:#fff;border-color:#ff3b55;background:linear-gradient(135deg,#b90022,#ff1744)}.nv-social .instagram{color:#fff;border-color:#ff63aa;background:linear-gradient(135deg,#5b18d1,#ff1d75,#ff9a1f)}.nv-social .facebook{color:#fff;border-color:#4d8cff;background:#1877f2}.nv-social .x{color:#fff;border-color:#555;background:#050505}.nv-social .telegram{color:#fff;border-color:#55c9ff;background:#168dcc}.nv-social .whatsapp{color:#fff;border-color:#4fe58b;background:#159447}.nv-social .threads{color:#fff;border-color:#777;background:#171717}.nv-social .linkedin{color:#fff;border-color:#54aaff;background:#0a66c2}.nv-social .discord{color:#fff;border-color:#9c8cff;background:#5865f2}.nv-social-label{display:block;color:var(--nv-muted);font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin:18px 0 0}
    .nv-blog-wrap{margin-top:26px;padding:22px;border:1px solid var(--nv-line);border-radius:18px;background:linear-gradient(135deg,rgba(7,17,30,.98),rgba(9,24,40,.98));box-shadow:0 18px 50px rgba(0,0,0,.18)}.nv-light .nv-blog-wrap{background:#fff}.nv-blog-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:14px}.nv-blog-head h2{margin:0;font-size:24px}.nv-blog-head span{color:#6ea9d8;font-size:11px}.nv-blog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.nv-blog-card{overflow:hidden;border:1px solid var(--nv-line);border-radius:14px;background:var(--nv-card);text-decoration:none;color:inherit}.nv-blog-card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.nv-blog-card .b{padding:12px}.nv-blog-card h3{margin:5px 0;font-size:14px;line-height:1.4}.nv-blog-card p{margin:0;color:var(--nv-muted);font-size:11px;line-height:1.5}
    .nv-player-shell{border:1px solid #285274!important;box-shadow:0 0 0 1px rgba(73,171,255,.08),0 20px 55px rgba(0,0,0,.5),0 0 35px rgba(20,132,255,.08)!important;background:radial-gradient(circle at 50% 0%,#102945 0,#02060c 48%,#000 100%)!important}
    .nv-player-badge{position:absolute;top:10px;left:10px;z-index:5;padding:5px 9px;border-radius:999px;background:rgba(4,12,22,.78);border:1px solid #376687;color:#a9d6f8;font-size:9px;font-weight:900;letter-spacing:1.2px;pointer-events:none}
    .nv-player-toolbar button:nth-child(1){background:linear-gradient(135deg,#0c6fff,#19a7ff)!important;border-color:#4fbaff!important;color:#fff!important}.nv-player-toolbar button:nth-child(2){background:linear-gradient(135deg,#6b3fe8,#a56cff)!important;border-color:#b68aff!important;color:#fff!important}.nv-player-toolbar button:nth-child(3){background:linear-gradient(135deg,#008d70,#17c99e)!important;border-color:#4de0bd!important;color:#fff!important}.nv-player-toolbar button:nth-child(4){background:linear-gradient(135deg,#d16a00,#ff9c26)!important;border-color:#ffbd61!important;color:#fff!important}.nv-player-toolbar button:nth-child(5){background:linear-gradient(135deg,#d51f55,#ff4e83)!important;border-color:#ff83a9!important;color:#fff!important}
    .nv-category-pills{display:flex;flex-wrap:wrap;gap:10px}.nv-category-pills>*:nth-child(1){border-color:#2b9cff!important;background:#09213a!important}.nv-category-pills>*:nth-child(2){border-color:#bd62ff!important;background:#231239!important}.nv-category-pills>*:nth-child(3){border-color:#1dc9a1!important;background:#08251f!important}.nv-category-pills>*:nth-child(4){border-color:#ff8b2c!important;background:#2b1809!important}.nv-category-pills>*:nth-child(5){border-color:#ff4f78!important;background:#2a0e18!important}.nv-category-pills>*:nth-child(6){border-color:#ffd24d!important;background:#2a2207!important}
    .nv-footer-social{margin-top:13px}
    @media(max-width:700px){.nv-app-hero{width:94%;padding:10px}.nv-app-hero small{font-size:9px}.nv-app-download{padding:9px 11px;font-size:11px}.nv-blog-grid{grid-template-columns:1fr}.nv-theme-btn{height:36px;min-width:40px;padding:0 9px}.nv-social a{font-size:10px}.nv-player-badge{top:7px;left:7px}.nv-blog-wrap{padding:16px}}
  `;
  function addCSS(){if(document.getElementById('nv-site-ui-css'))return;const s=document.createElement('style');s.id='nv-site-ui-css';s.textContent=css;document.head.appendChild(s)}
  function theme(){
    const saved=localStorage.getItem('nv_theme')||'dark'; document.body.classList.toggle('nv-light',saved==='light');
    document.querySelectorAll('.nv-theme-btn').forEach(b=>{b.textContent=saved==='light'?'🌙':'☀️';b.title=saved==='light'?'Switch to dark mode':'Switch to light mode';});
  }
  function addThemeButtons(){
    const containers=[...document.querySelectorAll('.header-actions,.actions')];
    containers.forEach(c=>{if(c.querySelector('.nv-theme-btn'))return;const b=document.createElement('button');b.className='nv-theme-btn';b.type='button';b.textContent='☀️';b.onclick=()=>{const light=!document.body.classList.contains('nv-light');localStorage.setItem('nv_theme',light?'light':'dark');theme()};c.appendChild(b)});
  }
  function addAppButtons(){
    // Header: place App next to Nikhil AI where the user expects it.
    document.querySelectorAll('.header-actions,.actions').forEach(c=>{
      if(c.querySelector('.nv-header-app'))return;
      const a=document.createElement('a');a.className='nv-header-app nv-app-download';a.href=APK;a.target='_blank';a.rel='noopener';a.textContent='📱 App';c.insertBefore(a,c.querySelector('.nv-theme-btn')||null);
    });
    // Home: prominent app CTA directly above the hero carousel.
    const hero=document.getElementById('heroCarousel');
    const heroSection=hero?.closest('.hero');
    if(heroSection&&!document.getElementById('nvAppHero')){
      const box=document.createElement('div');box.id='nvAppHero';box.className='nv-app-hero';box.innerHTML='<div><b>📱 NIKHILVERSE Android App</b><small>Faster OTT-style experience on Android</small></div><a class="nv-app-download" href="'+APK+'" target="_blank" rel="noopener">Download App ↗</a>';
      heroSection.parentNode.insertBefore(box,heroSection);
    }
  }
  function addSocials(){
    const targets=[...document.querySelectorAll('footer')];
    if(!targets.length)return;
    targets.forEach(footer=>{
      if(footer.querySelector('.nv-social'))return;
      const label=document.createElement('span');label.className='nv-social-label';label.textContent='Follow NIKHILVERSE';
      const wrap=document.createElement('div');wrap.className='nv-social nv-footer-social';
      socials.forEach(x=>{const a=document.createElement('a');a.href=x.href;a.target='_blank';a.rel='noopener noreferrer';a.className=x.cls;a.title=x.name;a.setAttribute('aria-label',x.name);a.innerHTML=x.svg+'<span>'+x.name+'</span>';wrap.appendChild(a)});
      footer.appendChild(label);footer.appendChild(wrap);
    });
  }
  function stylePlayer(){
    const p=document.querySelector('.player'); if(!p)return; p.classList.add('nv-player-shell');
    const tb=document.querySelector('.toolbar'); if(tb)tb.classList.add('nv-player-toolbar');
    if(!p.querySelector('.nv-player-badge')){const b=document.createElement('div');b.className='nv-player-badge';b.textContent='NIKHILVERSE PLAYER';p.appendChild(b)}
  }
  function stylePills(){
    document.querySelectorAll('.toolbar,.filters,.filter-row,.category-pills').forEach(x=>x.classList.add('nv-category-pills'));
    const latest=[...document.querySelectorAll('#videos button,.filters button')]; latest.forEach(x=>x.classList.add('nv-pill-color'));
  }
  function enhanceBlog(){
    const grid=document.getElementById('blogGrid');
    const sec=document.getElementById('blog');
    if(!grid||!sec)return;
    sec.classList.add('nv-blog-wrap');
    const title=sec.querySelector('.section-title h2');if(title)title.textContent='From the NIKHILVERSE Blog';
    grid.classList.add('nv-blog-grid');
  }
  function init(){addCSS();theme();addThemeButtons();addAppButtons();addSocials();stylePlayer();stylePills();enhanceBlog();}
  document.addEventListener('DOMContentLoaded',init);window.addEventListener('load',init);window.addEventListener('nv:content-loaded',init);
})();

/* NIKHILVERSE cinematic initial loader */
(function(){
  if (window.__NV_INITIAL_LOADER__) return;
  window.__NV_INITIAL_LOADER__ = true;
  const style = document.createElement('style');
  style.textContent = `
    #nvInitialLoader{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#04070d;color:#f4f8ff;opacity:1;visibility:visible;transition:opacity .45s ease,visibility .45s ease}
    #nvInitialLoader.hide{opacity:0;visibility:hidden;pointer-events:none}
    #nvInitialLoader:before{content:"";position:absolute;inset:-30%;background:radial-gradient(circle at 50% 42%,rgba(26,133,255,.18),transparent 25%),radial-gradient(circle at 18% 20%,rgba(229,9,20,.12),transparent 24%),radial-gradient(circle at 82% 72%,rgba(93,63,255,.12),transparent 28%);animation:nvLoaderGlow 5s ease-in-out infinite alternate}
    .nv-loader-grid{position:absolute;inset:0;opacity:.18;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,#000,transparent 90%)}
    .nv-loader-box{position:relative;width:min(520px,88vw);padding:34px 28px 30px;text-align:center;border:1px solid rgba(74,150,224,.3);border-radius:28px;background:linear-gradient(145deg,rgba(8,18,32,.94),rgba(5,10,19,.9));box-shadow:0 30px 100px rgba(0,0,0,.55),0 0 70px rgba(21,128,255,.10);backdrop-filter:blur(18px)}
    .nv-loader-logo{width:78px;height:78px;border-radius:50%;object-fit:cover;border:1px solid rgba(125,190,255,.55);box-shadow:0 0 0 8px rgba(45,145,255,.05),0 0 35px rgba(45,145,255,.35);animation:nvLoaderPulse 2s ease-in-out infinite}
    .nv-loader-title{margin:18px 0 4px;font-size:26px;letter-spacing:.12em;font-weight:950}
    .nv-loader-sub{margin:0;color:#91a8c0;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
    .nv-loader-status{margin-top:22px;color:#dcecff;font-size:13px}
    .nv-loader-bar{height:5px;margin:14px auto 0;width:min(330px,80%);border-radius:99px;overflow:hidden;background:#122238}
    .nv-loader-bar span{display:block;width:35%;height:100%;border-radius:99px;background:linear-gradient(90deg,#148eff,#70d8ff,#e50914);box-shadow:0 0 18px rgba(49,157,255,.65);animation:nvLoaderSweep 1.25s linear infinite}
    .nv-loader-skeletons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:24px;opacity:.72}
    .nv-loader-skel{height:54px;border-radius:9px;background:linear-gradient(100deg,#0c1a2b 25%,#19314b 40%,#0c1a2b 55%);background-size:250% 100%;animation:nvShimmer 1.45s linear infinite}
    .nv-loader-skel:nth-child(2){animation-delay:.18s}.nv-loader-skel:nth-child(3){animation-delay:.36s}
    .nv-loader-note{margin-top:16px;color:#607b95;font-size:11px}
    @keyframes nvShimmer{to{background-position:-250% 0}}
    @keyframes nvLoaderSweep{0%{transform:translateX(-280%)}100%{transform:translateX(330%)}}
    @keyframes nvLoaderPulse{50%{transform:scale(1.035);box-shadow:0 0 0 10px rgba(45,145,255,.04),0 0 48px rgba(45,145,255,.5)}}
    @keyframes nvLoaderGlow{to{transform:scale(1.08) rotate(3deg);filter:hue-rotate(12deg)}}
    @media(max-width:560px){.nv-loader-box{padding:28px 20px 24px;border-radius:22px}.nv-loader-logo{width:68px;height:68px}.nv-loader-title{font-size:21px}.nv-loader-skeletons{gap:6px}.nv-loader-skel{height:44px}}
    @media(prefers-reduced-motion:reduce){#nvInitialLoader:before,.nv-loader-logo,.nv-loader-bar span,.nv-loader-skel{animation:none!important}.nv-loader-bar span{width:100%}}
  `;
  document.head.appendChild(style);
  const loader = document.createElement('div');
  loader.id='nvInitialLoader';
  loader.setAttribute('aria-busy','true');
  loader.innerHTML=`<div class="nv-loader-grid"></div><div class="nv-loader-box"><img class="nv-loader-logo" src="/nikhilverse-logo.png" onerror="this.style.display='none'" alt="NIKHILVERSE"><div class="nv-loader-title">NIKHILVERSE</div><p class="nv-loader-sub">Discover stories worth watching</p><div class="nv-loader-status" id="nvLoaderStatus">Connecting to NIKHILVERSE…</div><div class="nv-loader-bar"><span></span></div><div class="nv-loader-skeletons"><i class="nv-loader-skel"></i><i class="nv-loader-skel"></i><i class="nv-loader-skel"></i></div><div class="nv-loader-note">Fetching the latest videos & YouTube data</div></div>`;
  (document.body || document.documentElement).prepend(loader);
  const started=Date.now();
  let apiDone=false, pageLoaded=false;
  const status=()=>document.getElementById('nvLoaderStatus');
  const hide=()=>{if(Date.now()-started<700)return setTimeout(hide,700-(Date.now()-started));loader.classList.add('hide');loader.setAttribute('aria-busy','false');setTimeout(()=>loader.remove(),600)};
  const check=()=>{if(pageLoaded && apiDone) hide();};
  const observer=()=>{
    try{
      const entries=performance.getEntriesByType('resource').map(x=>x.name);
      apiDone=entries.some(x=>/\/api\/(videos|youtube|playlists|playlist|blogs|plans)/i.test(x));
    }catch(e){}
    if(apiDone && status()) status().textContent='Latest data loaded ✓';
    check();
  };
  window.addEventListener('load',()=>{pageLoaded=true;setTimeout(observer,180);setTimeout(observer,650);});
  const perfTimer=setInterval(observer,350);
  setTimeout(()=>{clearInterval(perfTimer);hide();},9000);
  setTimeout(()=>{if(status() && !apiDone)status().textContent='Loading your NIKHILVERSE experience…';},1800);
})();
