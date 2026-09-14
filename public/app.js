async function get(u){
  const r=await fetch(u,{cache:'no-store'});
  if(!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json();
}
function escapeHTML(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function formatCount(value){
  const n=Number(value||0);
  if(!Number.isFinite(n)) return '0';
  if(n>=1000000) return (n/1000000).toFixed(n>=10000000?0:1).replace(/\.0$/,'')+'M';
  if(n>=1000) return (n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,'')+'K';
  return n.toLocaleString('en-IN');
}
function card(v){
  const id=v.youtube_id||'';
  const thumb=v.thumbnail||`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  const stats=`👁 ${formatCount(v.view_count)} · 👍 ${formatCount(v.like_count)}`;
  return `<article class="card" data-video-id="${escapeHTML(id)}" tabindex="0" role="button" aria-label="Watch ${escapeHTML(v.title||'video')}">
    <div class="thumb"><img src="${escapeHTML(thumb)}" alt="${escapeHTML(v.title||'')}" loading="lazy"><span class="play-overlay">▶</span></div>
    <div class="body"><span class="meta">${v.access==='premium'?'🔒 PREMIUM':'FREE'} · ${escapeHTML(v.channel||'NIKHILVERSE')}</span><h3>${escapeHTML(v.title||'')}</h3><div class="meta">${escapeHTML(v.category||'Story')} · ${stats}</div></div>
  </article>`;
}

async function refreshLiveVideoStats(videos){
  const ids=[...new Set(videos.map(v=>v.youtube_id).filter(Boolean))];
  if(!ids.length)return;
  const merged={};
  for(let i=0;i<ids.length;i+=50){
    const batch=ids.slice(i,i+50);
    try{
      const data=await get('/api/youtube/video-stats?ids='+encodeURIComponent(batch.join(',')));
      Object.assign(merged,data||{});
    }catch(e){
      console.warn('Live YouTube video stats unavailable:',e.message);
    }
  }
  if(!Object.keys(merged).length)return;
  videos.forEach(v=>{
    const s=merged[v.youtube_id];
    if(!s)return;
    v.view_count=s.viewCount;
    v.like_count=s.likeCount;
  });
  document.querySelectorAll('[data-video-id]').forEach(cardEl=>{
    const s=merged[cardEl.dataset.videoId];
    if(!s)return;
    const metaEls=cardEl.querySelectorAll('.meta');
    const statsEl=metaEls[metaEls.length-1];
    if(statsEl){
      const category=cardEl.querySelector('h3')?.nextElementSibling?.textContent?.split(' · ')[0]||'Story';
      statsEl.textContent=category+' · 👁 '+formatCount(s.viewCount)+' · 👍 '+formatCount(s.likeCount);
    }
  });
  window.dispatchEvent(new CustomEvent('nv:live-stats',{detail:{videos,stats:merged}}));
}

async function refreshChannelStats(){
  try{
    const data=await get('/api/youtube/channel-stats');
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
    set('nvTotalViews',formatCount(data.totalViews));
    set('nvSubscribers',formatCount(data.totalSubscribers));
    set('nvVideoCount',formatCount(data.totalVideos));
    set('nv24hViews',data.last24hAvailable?formatCount(data.last24hViews):'Collecting…');
    const stamp=document.getElementById('nvStatsUpdated');
    if(stamp)stamp.textContent=data.last24hAvailable?'Live YouTube data · 24h figure is snapshot-based':'Live YouTube data · collecting 24h baseline';
  }catch(e){
    console.warn('Channel stats unavailable:',e.message);
  }
}
function classify(v){
  const t=`${v.title||''} ${v.description||''} ${v.category||''}`.toLowerCase();
  if(/documentary|documentary|full episode/.test(t)) return 'doc';
  if(/sci[- ]?fi|alien|ufo|space|cosmos|nasa|universe|planet|extraterrestrial/.test(t)) return 'scifi';
  if(/episode|series|show|part \d|season/.test(t) || /TAH By Nikhil/i.test(v.channel||'')) return 'show';
  return 'video';
}
async function load(){
  try{
    const [vs,bs,ps]=await Promise.all([get('/api/videos'),get('/api/blogs'),get('/api/plans')]);
    const videos=Array.isArray(vs)?vs:[];
    const docs=videos.filter(v=>classify(v)==='doc');
    const scifi=videos.filter(v=>classify(v)==='scifi');
    const shows=videos.filter(v=>classify(v)==='show');
    const grid=document.getElementById('videoGrid'); if(grid) grid.innerHTML=videos.map(card).join('')||'<p class="meta">No videos available right now.</p>';
    const dg=document.getElementById('docGrid'); if(dg) dg.innerHTML=docs.map(card).join('')||'<p class="meta">No documentaries yet.</p>';
    const sg=document.getElementById('scifiGrid'); if(sg) sg.innerHTML=scifi.map(card).join('')||'<p class="meta">No Sci-Fi videos yet.</p>';
    const sh=document.getElementById('showGrid'); if(sh) sh.innerHTML=shows.map(card).join('')||'<p class="meta">No episodes yet.</p>';
    const bg=document.getElementById('blogGrid'); if(bg) bg.innerHTML=(Array.isArray(bs)?bs:[]).map(b=>`<article class="blog"><div class="img">${b.featured_image?`<img src="${escapeHTML(b.featured_image)}" alt="" loading="lazy">`:''}</div><div class="body"><span class="meta">${escapeHTML(b.author||'Nikhil')}</span><h3>${escapeHTML(b.title||'')}</h3><p class="meta">${escapeHTML(b.excerpt||'')}</p></div></article>`).join('')||'<p class="meta">No articles yet.</p>';
    const plans=document.getElementById('plans'); if(plans) plans.innerHTML=(Array.isArray(ps)?ps:[]).filter(p=>p.active!==0).map(p=>`<div class="plan"><span>${escapeHTML(p.name)}</span><h3>₹<strong>${escapeHTML(p.price)}</strong> / ${escapeHTML(p.period)}</h3><p>${escapeHTML(p.features)}</p><button onclick="alert('Premium checkout can be enabled from the admin payment settings.')">Join Premium</button></div>`).join('');
    window.dispatchEvent(new CustomEvent('nv:content-loaded',{detail:{videos}}));
    refreshLiveVideoStats(videos);
    refreshChannelStats();
    clearInterval(window.nvStatsTimer);
    window.nvStatsTimer=setInterval(()=>{refreshLiveVideoStats(videos);refreshChannelStats();},60000);
  }catch(error){
    console.error('Load error:',error);
    ['videoGrid','docGrid','scifiGrid','showGrid','blogGrid'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.children.length)el.innerHTML='<p class="meta">Content is temporarily unavailable. Please refresh in a moment.</p>';});
  }
}
function openAI(){const el=document.getElementById('ai');if(!el)return;el.hidden=!el.hidden;if(!el.hidden)setTimeout(()=>document.getElementById('msg')?.focus(),50);}
let aiBusy=false;
async function askAI(){if(aiBusy)return;const input=document.getElementById('msg'),chat=document.getElementById('chat');if(!input||!chat)return;const q=input.value.trim();if(!q)return;aiBusy=true;input.value='';input.blur();chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br>Thinking…';try{const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})});let r={};try{r=await response.json()}catch{}if(!response.ok||!r.answer){chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br><span style="color:#ff8a8a">'+escapeHTML(r.error||'Nikhil AI unavailable')+'</span>';return;}const related=r.results?.length?'<br><br><b>Related:</b><br>'+r.results.map(x=>'• '+escapeHTML(x.title||'')).join('<br>'):'';chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br>'+formatAIAnswer(r.answer)+related;}catch(e){chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br><span style="color:#ff8a8a">Nikhil AI se connection nahi ho paya.</span>';}finally{aiBusy=false;setTimeout(()=>input.focus(),50);}}
function formatAIAnswer(text){return escapeHTML(text).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');}
document.addEventListener('DOMContentLoaded',()=>{const msg=document.getElementById('msg');if(msg)msg.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();askAI();}});});
window.addEventListener('load',load);
