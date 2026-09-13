async function get(u){
  return (await fetch(u)).json();
}

function escapeHTML(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function formatNumber(value){
  const n = Number(value || 0);
  if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString('en-IN');
}

function card(v){
  const youtubeId = v.youtube_id || '';
  const stats = window.youtubeVideoStats?.[youtubeId] || {};
  const views = Number(stats.views || 0);
  const likes = Number(stats.likes || 0);

  return `<article class="card" data-video-id="${escapeHTML(youtubeId)}" role="button" tabindex="0"><div class="thumb">${v.thumbnail ? `<img src="${escapeHTML(v.thumbnail)}" alt="${escapeHTML(v.title || '')}" style="width:100%;height:100%;object-fit:cover" loading="lazy">` : '▶'}</div><div class="body"><span class="meta">${v.access==='premium'?'🔒 PREMIUM':'FREE'} · ${escapeHTML(v.channel||'NIKHILVERSE')}</span><h3>${escapeHTML(v.title||'')}</h3><div class="meta">${escapeHTML(v.category||'Story')}</div><div class="youtube-stats"><span>👁 ${formatNumber(views)} views</span><span>👍 ${formatNumber(likes)} likes</span></div></div></article>`;
}

function openVideo(youtubeId){
  const id = String(youtubeId || '').trim();
  if(!id) return;
  location.href = '/watch.html?id=' + encodeURIComponent(id);
}

document.addEventListener('click', event => {
  const cardElement = event.target.closest('.card');
  if(!cardElement) return;
  const id = cardElement.dataset.videoId;
  if(id) openVideo(id);
});

document.addEventListener('keydown', event => {
  if(event.key !== 'Enter' && event.key !== ' ') return;
  const cardElement = event.target.closest('.card');
  if(!cardElement) return;
  event.preventDefault();
  const id = cardElement.dataset.videoId;
  if(id) openVideo(id);
});

async function load(){
  try{
    const [vs,bs,ps,youtubeStats]=await Promise.all([
      get('/api/videos'),
      get('/api/blogs'),
      get('/api/plans'),
      get('/api/youtube/stats').catch(()=>({channels:{},videos:{}}))
    ]);

    window.youtubeVideoStats = youtubeStats?.videos || {};
    window.youtubeChannelStats = youtubeStats?.channels || {};

    videoGrid.innerHTML=vs.map(card).join('')||'<p class="meta">No videos yet. Connect YouTube API in .env.</p>';

    const documentaries=vs.filter(x=>(x.category||'').toLowerCase().includes('doc'));
    docGrid.innerHTML=documentaries.map(card).join('')||videoGrid.innerHTML;

    blogGrid.innerHTML=bs.map(b=>`<article class="blog"><div class="img">${b.featured_image?`<img src="${escapeHTML(b.featured_image)}" style="width:100%;height:100%;object-fit:cover">`:''}</div><div class="body"><span class="meta">${escapeHTML(b.author||'Nikhil')}</span><h3>${escapeHTML(b.title||'')}</h3><p class="meta">${escapeHTML(b.excerpt||'')}</p></div></article>`).join('')||'<p class="meta">No articles yet.</p>';

    plans.innerHTML=ps.map(p=>`<div class="plan"><span>${escapeHTML(p.name)}</span><h3>₹<strong>${escapeHTML(p.price)}</strong> / ${escapeHTML(p.period)}</h3><p>${escapeHTML(p.features)}</p><button onclick="alert('Razorpay checkout requires live credentials in .env')">Join Premium</button></div>`).join('');
  }catch(error){
    console.error('Load error:',error);
  }
}

function openAI(){
  ai.hidden=!ai.hidden;
  if(!ai.hidden)setTimeout(()=>msg.focus(),50);
}

let aiBusy=false;

async function askAI(){
  if(aiBusy)return;

  const q=msg.value.trim();
  if(!q)return;

  aiBusy=true;

  // Send hote hi input box clear
  msg.value='';
  msg.blur();

  chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br>Thinking…';

  try{
    const response=await fetch('/api/ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:q})
    });

    let r={};
    try{
      r=await response.json();
    }catch(e){}

    if(!response.ok||!r.answer){
      chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br><span style="color:#ff8a8a">'+escapeHTML(r.error||'Nikhil AI unavailable')+'</span>';
      return;
    }

    const related=r.results?.length
      ? '<br><br><b>Related:</b><br>'+r.results.map(x=>'• '+escapeHTML(x.title||'')).join('<br>')
      : '';

    chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br>'+formatAIAnswer(r.answer)+related;
  }catch(error){
    console.error('Nikhil AI error:',error);
    chat.innerHTML='<b>You:</b> '+escapeHTML(q)+'<br><br><span style="color:#ff8a8a">Nikhil AI se connection nahi ho paya.</span>';
  }finally{
    aiBusy=false;
    setTimeout(()=>msg.focus(),50);
  }
}

function formatAIAnswer(text){
  return escapeHTML(text)
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n/g,'<br>');
}

// Enter key se AI question send
document.addEventListener('DOMContentLoaded',()=>{
  if(typeof msg!=='undefined'){
    msg.addEventListener('keydown',event=>{
      if(event.key==='Enter'&&!event.shiftKey){
        event.preventDefault();
        askAI();
      }
    });
  }
});

load();
