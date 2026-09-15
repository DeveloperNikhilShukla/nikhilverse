(function(){
  const APK='https://github.com/DeveloperNikhilShukla/Repository-name-nikhilverse-android/releases/latest/download/NIKHILVERSE.apk';
  const socials=[
    {name:'SIFI By Nikhil',href:'https://www.youtube.com/@SIFIByNikhil',icon:'▶',cls:'yt'},
    {name:'TAH By Nikhil',href:'https://www.youtube.com/@TAHBYNikhil2',icon:'▶',cls:'yt'}
  ];
  const css=`
    :root{--nv-bg:#050912;--nv-panel:#07111e;--nv-card:#091525;--nv-text:#eef6ff;--nv-muted:#8fa5bc;--nv-line:#1b3651}
    body.nv-light{--nv-bg:#f4f7fb;--nv-panel:#fff;--nv-card:#fff;--nv-text:#0c1827;--nv-muted:#52677d;--nv-line:#c9d7e5;background:var(--nv-bg)!important;color:var(--nv-text)!important}
    body.nv-light header,.nv-light .head{background:rgba(255,255,255,.94)!important;border-color:var(--nv-line)!important}
    body.nv-light .card,body.nv-light .mainbox,body.nv-light .side,body.nv-light .info,body.nv-light .comments,body.nv-light .appbox,body.nv-light .feature,body.nv-light .price{background:var(--nv-card)!important;border-color:var(--nv-line)!important}
    body.nv-light .meta,body.nv-light .copy,body.nv-light .footer{color:var(--nv-muted)!important}
    .nv-theme-btn{border:1px solid #36506d;background:#0a1727;color:#fff;border-radius:999px;min-width:42px;height:38px;padding:0 12px;font-weight:800;cursor:pointer;box-shadow:0 0 18px rgba(54,151,255,.12)}
    .nv-light .nv-theme-btn{background:#edf4fb;color:#122338;border-color:#afc4d8}
    .nv-app-hero{width:min(1400px,94%);margin:14px auto 0;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #2b5c87;border-radius:15px;background:linear-gradient(100deg,#07182a,#102640 55%,#07182a);box-shadow:0 0 28px rgba(28,139,255,.14)}
    .nv-app-hero b{font-size:13px}.nv-app-hero small{display:block;color:#8fa7c0;margin-top:2px}.nv-app-download{display:inline-flex;align-items:center;gap:7px;padding:10px 15px;border-radius:999px;text-decoration:none;background:linear-gradient(135deg,#1695ff,#65c7ff);color:#00111e!important;font-weight:900;box-shadow:0 0 22px rgba(38,157,255,.38);white-space:nowrap}
    .nv-social{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.nv-social a{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;border:1px solid #28435f;background:#091827;color:#dcecff;text-decoration:none;font-size:11px;font-weight:800;transition:.2s}.nv-social a:hover{transform:translateY(-2px);border-color:#63baff;box-shadow:0 8px 22px rgba(0,0,0,.28)}.nv-social .yt{border-color:#5e2730;background:#241016}.nv-social .yt i{display:grid;place-items:center;width:19px;height:14px;border-radius:5px;background:#ff1744;color:#fff;font-style:normal;font-size:9px}
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
    const footer=document.querySelector('footer'); if(!footer||footer.querySelector('.nv-social'))return;
    const wrap=document.createElement('div');wrap.className='nv-social nv-footer-social';
    socials.forEach(x=>{const a=document.createElement('a');a.href=x.href;a.target='_blank';a.rel='noopener';a.className=x.cls;a.innerHTML='<i>'+x.icon+'</i>'+x.name;wrap.appendChild(a)});
    footer.appendChild(wrap);
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
