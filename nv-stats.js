(function(){
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=v=>{const n=Number(v||0);if(!Number.isFinite(n))return '0';if(n>=1e9)return (n/1e9).toFixed(n>=1e10?0:1).replace(/\.0$/,'')+'B';if(n>=1e6)return (n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'M';if(n>=1e3)return (n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,'')+'K';return n.toLocaleString('en-IN');};
  window.NVStats={esc,fmt,merge:async function(videos){try{const r=await fetch('/api/youtube/stats',{cache:'no-store'});if(!r.ok)return videos;const d=await r.json();const m=new Map((d.stats||[]).map(x=>[String(x.youtube_id),x]));return videos.map(v=>Object.assign(v,m.get(String(v.youtube_id))||{}));}catch(_){return videos;}}};
})();
