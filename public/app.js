async function get(u) {
  return (await fetch(u)).json();
}


// ======================================================
// VIDEO CARD
// ======================================================

function card(v) {

  return `
    <article
      class="card"
      onclick="location.href='https://www.youtube.com/watch?v=${v.youtube_id || ''}'"
    >

      <div class="thumb">

        ${
          v.thumbnail
            ? `<img
                src="${v.thumbnail}"
                style="width:100%;height:100%;object-fit:cover"
                loading="lazy"
              >`
            : '▶'
        }

      </div>

      <div class="body">

        <span class="meta">
          ${v.access === 'premium' ? '🔒 PREMIUM' : 'FREE'}
          ·
          ${v.channel || 'NIKHILVERSE'}
        </span>

        <h3>
          ${v.title}
        </h3>

        <div class="meta">
          ${v.category || 'Story'}
        </div>

      </div>

    </article>
  `;
}


// ======================================================
// VIDEO CAROUSEL
// ======================================================

function setupVideoCarousel() {

  const grid =
    document.getElementById('videoGrid');

  if (!grid) return;

  if (grid.dataset.carouselReady === '1') {
    return;
  }

  const cards =
    Array.from(grid.children);

  // No videos
  if (
    !cards.length ||
    cards[0].tagName === 'P'
  ) {
    return;
  }

  grid.dataset.carouselReady = '1';

  const section =
    grid.closest('section');

  if (!section) return;


  // Change grid into horizontal track
  grid.className =
    'carousel-track';


  // Create viewport
  const viewport =
    document.createElement('div');

  viewport.className =
    'carousel-viewport';


  // Previous button
  const prev =
    document.createElement('button');

  prev.className =
    'carousel-btn carousel-prev';

  prev.type = 'button';

  prev.setAttribute(
    'aria-label',
    'Previous videos'
  );

  prev.innerHTML =
    '&#10094;';


  // Next button
  const next =
    document.createElement('button');

  next.className =
    'carousel-btn carousel-next';

  next.type = 'button';

  next.setAttribute(
    'aria-label',
    'Next videos'
  );

  next.innerHTML =
    '&#10095;';


  // Dots
  const dots =
    document.createElement('div');

  dots.className =
    'carousel-dots';


  // Add cards to carousel
  cards.forEach(
    (card, index) => {

      card.classList.add(
        'carousel-card'
      );


      const dot =
        document.createElement('button');

      dot.type = 'button';

      dot.className =
        'carousel-dot' +
        (index === 0
          ? ' active'
          : '');

      dot.setAttribute(
        'aria-label',
        'Go to video ' +
        (index + 1)
      );


      dot.addEventListener(
        'click',
        () => {

          card.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
          });

        }
      );


      dots.appendChild(dot);

    }
  );


  // Insert carousel wrapper
  const parent =
    grid.parentNode;

  parent.insertBefore(
    viewport,
    grid
  );

  viewport.appendChild(grid);

  viewport.appendChild(prev);

  viewport.appendChild(next);


  // Current slide
  let current = 0;

  let timer = null;


  // Number of visible cards
  function visibleCount() {

    if (window.innerWidth <= 600) {
      return 1;
    }

    if (window.innerWidth <= 1000) {
      return 2;
    }

    if (window.innerWidth <= 1250) {
      return 3;
    }

    return 4;
  }


  // Maximum starting position
  function maxIndex() {

    return Math.max(
      0,
      cards.length -
      visibleCount()
    );

  }


  // Go to slide
  function goTo(index) {

    const max =
      maxIndex();

    current =
      Math.max(
        0,
        Math.min(index, max)
      );


    const target =
      cards[current];

    if (target) {

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });

    }


    Array.from(
      dots.children
    ).forEach(
      (dot, i) => {

        dot.classList.toggle(
          'active',
          i === current
        );

      }
    );

  }


  // Next
  function nextSlide() {

    const max =
      maxIndex();

    if (current >= max) {

      goTo(0);

    } else {

      goTo(current + 1);

    }

  }


  // Previous
  function prevSlide() {

    const max =
      maxIndex();

    if (current <= 0) {

      goTo(max);

    } else {

      goTo(current - 1);

    }

  }


  // Previous button
  prev.addEventListener(
    'click',
    () => {

      prevSlide();

      restart();

    }
  );


  // Next button
  next.addEventListener(
    'click',
    () => {

      nextSlide();

      restart();

    }
  );


  // Start autoplay
  function start() {

    clearInterval(timer);

    timer =
      setInterval(
        nextSlide,
        4500
      );

  }


  // Stop autoplay
  function stop() {

    clearInterval(timer);

  }


  // Restart autoplay
  function restart() {

    stop();

    start();

  }


  // Pause when mouse is over
  viewport.addEventListener(
    'mouseenter',
    stop
  );


  viewport.addEventListener(
    'mouseleave',
    start
  );


  // Mobile touch
  viewport.addEventListener(
    'touchstart',
    stop,
    {
      passive: true
    }
  );


  viewport.addEventListener(
    'touchend',
    start,
    {
      passive: true
    }
  );


  // Add dots below carousel
  section.appendChild(
    dots
  );


  // Resize handling
  window.addEventListener(
    'resize',
    () => {

      current =
        Math.min(
          current,
          maxIndex()
        );

    }
  );


  // Start
  start();

}


// ======================================================
// LOAD ALL DATA
// ======================================================

async function load() {

  let vs =
    await get('/api/videos');

  let bs =
    await get('/api/blogs');

  let ps =
    await get('/api/plans');


  // Latest Videos
  videoGrid.innerHTML =
    vs.map(card).join('') ||
    '<p class="meta">No videos yet. Connect YouTube API in .env.</p>';


  // Documentaries
  docGrid.innerHTML =
    vs
      .filter(
        x =>
          (x.category || '')
            .toLowerCase()
            .includes('doc')
      )
      .map(card)
      .join('') ||
    videoGrid.innerHTML;


  // Blogs
  blogGrid.innerHTML =
    bs
      .map(
        b => `
          <article class="blog">

            <div class="img">

              ${
                b.featured_image
                  ? `<img
                      src="${b.featured_image}"
                      style="width:100%;height:100%;object-fit:cover"
                      loading="lazy"
                    >`
                  : ''
              }

            </div>

            <div class="body">

              <span class="meta">
                ${b.author || 'Nikhil'}
              </span>

              <h3>
                ${b.title}
              </h3>

              <p class="meta">
                ${b.excerpt || ''}
              </p>

            </div>

          </article>
        `
      )
      .join('') ||
    '<p class="meta">No articles yet.</p>';


  // Premium plans
  plans.innerHTML =
    ps
      .map(
        p => `
          <div class="plan">

            <span>
              ${p.name}
            </span>

            <h3>
              ₹
              <strong>
                ${p.price}
              </strong>
              /
              ${p.period}
            </h3>

            <p>
              ${p.features}
            </p>

            <button
              onclick="alert('Razorpay checkout requires live credentials in .env')"
            >
              Join Premium
            </button>

          </div>
        `
      )
      .join('');


  // Setup carousel
  setupVideoCarousel();

}


// ======================================================
// AI OPEN / CLOSE
// ======================================================

function openAI() {

  ai.hidden =
    !ai.hidden;

}


// ======================================================
// AI CHAT
// ======================================================

async function askAI() {

  let q =
    msg.value.trim();

  if (!q) return;


  chat.innerHTML =
    '<b>You:</b> ' +
    q +
    '<br><br>Thinking…';


  let r =
    await fetch(
      '/api/ai',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({
            message: q
          })
      }
    )
    .then(
      x => x.json()
    );


  chat.innerHTML =
    '<b>You:</b> ' +
    q +
    '<br><br>' +
    r.answer +
    (
      r.results?.length
        ? '<br><br><b>Related:</b><br>' +
          r.results
            .map(
              x =>
                '• ' +
                x.title
            )
            .join('<br>')
        : ''
    );

}


load();
