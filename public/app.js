const videoGrid = document.getElementById('videoGrid');
const docGrid = document.getElementById('docGrid');
const blogGrid = document.getElementById('blogGrid');
const plans = document.getElementById('plans');
const ai = document.getElementById('ai');
const chat = document.getElementById('chat');
const msg = document.getElementById('msg');

async function get(u){
  const response = await fetch(u);
  if(!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function escapeHTML(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function card(v){
  const youtubeId = v.youtube_id || '';

  return `<article class="card" onclick="location.href='https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}'">
    <div class="thumb">
      ${v.thumbnail
        ? `<img src="${escapeHTML(v.thumbnail)}" style="width:100%;height:100%;object-fit:cover">`
        : '▶'}
    </div>
    <div class="body">
      <span class="meta">${v.access==='premium'?'🔒 PREMIUM':'FREE'} · ${escapeHTML(v.channel||'NIKHILVERSE')}</span>
      <h3>${escapeHTML(v.title||'')}</h3>
      <div class="meta">${escapeHTML(v.category||'Story')}</div>
    </div>
  </article>`;
}

async function load(){
  try{
    const [vs,bs,ps] = await Promise.all([
      get('/api/videos'),
      get('/api/blogs'),
      get('/api/plans')
    ]);

    const videos = Array.isArray(vs) ? vs : [];
    const blogs = Array.isArray(bs) ? bs : [];
    const premiumPlans = Array.isArray(ps) ? ps : [];

    videoGrid.innerHTML = videos.map(card).join('') ||
      '<p class="meta">No videos yet.</p>';

    const documentaries = videos.filter(x =>
      (x.category || '').toLowerCase().includes('doc')
    );

    docGrid.innerHTML = documentaries.map(card).join('') ||
      videoGrid.innerHTML;

    blogGrid.innerHTML = blogs.map(b => `
      <article class="blog">
        <div class="img">
          ${b.featured_image
            ? `<img src="${escapeHTML(b.featured_image)}" style="width:100%;height:100%;object-fit:cover">`
            : ''}
        </div>
        <div class="body">
          <span class="meta">${escapeHTML(b.author||'Nikhil')}</span>
          <h3>${escapeHTML(b.title||'')}</h3>
          <p class="meta">${escapeHTML(b.excerpt||'')}</p>
        </div>
      </article>
    `).join('') || '<p class="meta">No articles yet.</p>';

    plans.innerHTML = premiumPlans.map(p => `
      <div class="plan">
        <span>${escapeHTML(p.name)}</span>
        <h3>₹<strong>${escapeHTML(p.price)}</strong> / ${escapeHTML(p.period)}</h3>
        <p>${escapeHTML(p.features)}</p>
        <button onclick="payPremium(${Number(p.id)})">Join Premium</button>
      </div>
    `).join('');

  }catch(error){
    console.error('Website data loading error:', error);
  }
}


async function loadRazorpayCheckout(){
  if(window.Razorpay) return true;

  return new Promise(resolve => {
    const script=document.createElement('script');
    script.src='https://checkout.razorpay.com/v1/checkout.js';
    script.onload=()=>resolve(true);
    script.onerror=()=>resolve(false);
    document.head.appendChild(script);
  });
}

async function payPremium(planId){
  try{
    const buttonEvent = window.event;
    if(buttonEvent?.target) buttonEvent.target.disabled=true;

    const checkoutReady=await loadRazorpayCheckout();
    if(!checkoutReady){
      alert('Razorpay Checkout load nahi ho paya. Internet connection check karein.');
      return;
    }

    const token=localStorage.getItem('token') || '';
    const headers={'Content-Type':'application/json'};
    if(token) headers.Authorization='Bearer '+token;

    const orderResponse=await fetch('/api/payment/create',{
      method:'POST',
      headers,
      body:JSON.stringify({planId})
    });

    const order=await orderResponse.json();

    if(!orderResponse.ok || !order.order_id){
      alert(order.error || 'Razorpay order create nahi hua.');
      return;
    }

    const options={
      key:order.key_id,
      amount:order.amount,
      currency:order.currency || 'INR',
      name:'NIKHILVERSE',
      description:`${order.plan?.name || 'Premium'} Membership`,
      order_id:order.order_id,
      theme:{color:'#6ea8ff'},
      handler:async function(response){
        try{
          const verifyHeaders={'Content-Type':'application/json'};
          if(token) verifyHeaders.Authorization='Bearer '+token;

          const verifyResponse=await fetch('/api/payment/verify',{
            method:'POST',
            headers:verifyHeaders,
            body:JSON.stringify({
              planId,
              razorpay_order_id:response.razorpay_order_id,
              razorpay_payment_id:response.razorpay_payment_id,
              razorpay_signature:response.razorpay_signature
            })
          });

          const result=await verifyResponse.json();

          if(!verifyResponse.ok || !result.success){
            alert(result.error || 'Payment verification failed.');
            return;
          }

          alert('🎉 Payment successful! '+(result.plan?.name || 'Premium')+' membership activate ho gayi.');
        }catch(error){
          console.error('Payment verification error:',error);
          alert('Payment ho gaya ho sakta hai, lekin verification complete nahi hua. Support se contact karein.');
        }
      },
      modal:{
        ondismiss:function(){
          console.log('Razorpay checkout closed.');
        }
      }
    };

    const rzp=new Razorpay(options);
    rzp.open();

  }catch(error){
    console.error('Razorpay error:',error);
    alert('Payment start nahi ho paya. Please try again.');
  }finally{
    if(window.event?.target) window.event.target.disabled=false;
  }
}

function openAI(){
  ai.hidden = !ai.hidden;
  if(!ai.hidden && msg){
    setTimeout(() => msg.focus(), 50);
  }
}

let aiBusy = false;

async function askAI(){
  if(aiBusy || !msg) return;

  const q = msg.value.trim();
  if(!q) return;

  aiBusy = true;

  // Clear the input immediately after sending.
  msg.value = '';
  msg.blur();

  chat.innerHTML =
    '<b>You:</b> ' + escapeHTML(q) +
    '<br><br>Thinking…';

  try{
    const response = await fetch('/api/ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:q})
    });

    let r = {};
    try{
      r = await response.json();
    }catch(e){}

    if(!response.ok || !r.answer){
      chat.innerHTML =
        '<b>You:</b> ' + escapeHTML(q) +
        '<br><br><span style="color:#ff8a8a">' +
        escapeHTML(r.error || 'Nikhil AI unavailable') +
        '</span>';
      return;
    }

    const related = r.results?.length
      ? '<br><br><b>Related:</b><br>' +
        r.results.map(x => '• ' + escapeHTML(x.title || '')).join('<br>')
      : '';

    chat.innerHTML =
      '<b>You:</b> ' + escapeHTML(q) +
      '<br><br>' + formatAIAnswer(r.answer) +
      related;

  }catch(error){
    console.error('Nikhil AI error:', error);

    chat.innerHTML =
      '<b>You:</b> ' + escapeHTML(q) +
      '<br><br><span style="color:#ff8a8a">' +
      'Nikhil AI se connection nahi ho paya.' +
      '</span>';
  }finally{
    aiBusy = false;
    setTimeout(() => {
      if(msg) msg.focus();
    }, 50);
  }
}

function formatAIAnswer(text){
  return escapeHTML(text)
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n/g,'<br>');
}

if(msg){
  msg.addEventListener('keydown', event => {
    if(event.key === 'Enter' && !event.shiftKey){
      event.preventDefault();
      askAI();
    }
  });
}

load();
