async function get(url){
  const response = await fetch(url);

  if(!response.ok){
    throw new Error("Request failed: " + url);
  }

  return response.json();
}


/* ================= VIDEO CARD ================= */

function card(v){

  const id = v.youtube_id || "";

  return `
    <article
      class="card"
      onclick="openVideo('${encodeURIComponent(id)}')"
    >

      <div class="thumb">

        ${
          v.thumbnail
          ? `
            <img
              src="${v.thumbnail}"
              alt="${escapeHTML(v.title || "")}"
              loading="lazy"
            >
          `
          : "▶"
        }

      </div>

      <div class="body">

        <span class="meta">
          ${
            v.access === "premium"
            ? "🔒 PREMIUM"
            : "FREE"
          }
          ·
          ${escapeHTML(v.channel || "NIKHILVERSE")}
        </span>

        <h3>
          ${escapeHTML(v.title || "Untitled Video")}
        </h3>

        <div class="meta">
          ${escapeHTML(v.category || "Story")}
        </div>

      </div>

    </article>
  `;
}


/* ================= OPEN VIDEO ================= */

function openVideo(id){

  if(!id) return;

  const decoded =
    decodeURIComponent(id);

  window.location.href =
    "/watch.html?id=" +
    encodeURIComponent(decoded);

}


/* ================= HTML SAFETY ================= */

function escapeHTML(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* ================= LOAD SITE ================= */

async function load(){

  try{

    const [
      videos,
      blogs,
      plans
    ] = await Promise.all([
      get("/api/videos"),
      get("/api/blogs"),
      get("/api/plans")
    ]);


    /* Latest Videos */

    videoGrid.innerHTML =
      videos
        .map(card)
        .join("")
      ||
      `
        <p class="meta">
          No videos available.
        </p>
      `;


    /* Documentaries */

    const documentaries =
      videos.filter(v =>
        String(v.category || "")
          .toLowerCase()
          .includes("doc")
      );

    docGrid.innerHTML =
      documentaries
        .map(card)
        .join("")
      ||
      `
        <p class="meta">
          No documentaries available.
        </p>
      `;


    /* Sci-Fi */

    const scifi =
      videos.filter(v =>
        String(v.category || "")
          .toLowerCase()
          .includes("sci")
      );

    scifiGrid.innerHTML =
      scifi
        .map(card)
        .join("")
      ||
      `
        <p class="meta">
          No Sci-Fi videos available.
        </p>
      `;


    /* TV Shows */

    const shows =
      videos.filter(v =>
        String(v.category || "")
          .toLowerCase()
          .includes("show")
      );

    showGrid.innerHTML =
      shows
        .map(card)
        .join("")
      ||
      `
        <p class="meta">
          No episodes available.
        </p>
      `;


    /* Blog */

    blogGrid.innerHTML =
      blogs.map(b => `

        <article class="blog">

          <div class="img">

            ${
              b.featured_image
              ? `
                <img
                  src="${b.featured_image}"
                  alt="${escapeHTML(b.title || "")}"
                >
              `
              : ""
            }

          </div>

          <div class="body">

            <span class="meta">
              ${escapeHTML(b.author || "Nikhil")}
            </span>

            <h3>
              ${escapeHTML(b.title || "")}
            </h3>

            <p class="meta">
              ${escapeHTML(b.excerpt || "")}
            </p>

          </div>

        </article>

      `).join("")
      ||
      `
        <p class="meta">
          No articles yet.
        </p>
      `;


    /* Premium Plans */

    plans.innerHTML =
      plansData(plans);

  }catch(error){

    console.error(
      "NIKHILVERSE load error:",
      error
    );

  }

}


/* ================= PLANS ================= */

function plansData(items){

  return items.map(p => `

    <div class="plan">

      <span>
        ${escapeHTML(p.name || "Premium")}
      </span>

      <h3>
        ₹<strong>
          ${escapeHTML(p.price || "0")}
        </strong>
        /
        ${escapeHTML(p.period || "month")}
      </h3>

      <p>
        ${escapeHTML(p.features || "")}
      </p>

      <button
        onclick="alert('Razorpay checkout requires live credentials in .env')"
      >
        Join Premium
      </button>

    </div>

  `).join("");

}


/* ================= AI ================= */

function openAI(){

  const box =
    document.getElementById("ai");

  if(!box) return;

  box.hidden =
    !box.hidden;

}


async function askAI(){

  const input =
    document.getElementById("msg");

  const chat =
    document.getElementById("chat");

  if(!input || !chat) return;

  const question =
    input.value.trim();

  if(!question) return;

  chat.innerHTML =
    "<b>You:</b> " +
    escapeHTML(question) +
    "<br><br>Thinking…";

  input.value = "";

  try{

    const response =
      await fetch(
        "/api/ai",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            message:question
          })
        }
      );

    const result =
      await response.json();

    chat.innerHTML =
      "<b>You:</b> " +
      escapeHTML(question) +
      "<br><br>" +
      escapeHTML(
        result.answer ||
        "Sorry, I could not answer."
      );

    if(
      result.results &&
      result.results.length
    ){

      chat.innerHTML +=
        "<br><br><b>Related:</b><br>" +
        result.results
          .map(
            x =>
              "• " +
              escapeHTML(x.title || "")
          )
          .join("<br>");

    }

  }catch(error){

    chat.innerHTML =
      "<b>Error:</b> AI service unavailable.";

    console.error(error);

  }

}


/* ================= SEARCH ================= */

const searchInput =
  document.getElementById("siteSearch");

if(searchInput){

  searchInput.addEventListener(
    "keydown",
    function(event){

      if(
        event.key === "Enter" &&
        this.value.trim()
      ){

        window.location.href =
          "/?q=" +
          encodeURIComponent(
            this.value.trim()
          );

      }

    }
  );

}


/* ================= START ================= */

load();
