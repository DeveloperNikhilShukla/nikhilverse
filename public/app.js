async function get(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Request failed: " + url);
  }

  return response.json();
}


/* ================= HTML ESCAPE ================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ================= VIDEO CARD ================= */

function card(v) {

  const id = String(v.youtube_id || "").trim();

  if (!id) return "";

  return `
    <article
      class="card"
      data-video-id="${escapeHTML(id)}"
      role="button"
      tabindex="0"
    >

      <div class="thumb">

        ${
          v.thumbnail
            ? `
              <img
                src="${escapeHTML(v.thumbnail)}"
                alt="${escapeHTML(v.title || "")}"
                loading="lazy"
              >
            `
            : `
              <span>▶</span>
            `
        }

      </div>

      <div class="body">

        <span class="meta">
          ${
            String(v.access || "").toLowerCase() === "premium"
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
          ${escapeHTML(v.category || "Videos")}
        </div>

      </div>

    </article>
  `;
}


/* ================= OPEN NIKHILVERSE WATCH PAGE ================= */

function openVideo(id) {

  if (!id) return;

  id = decodeURIComponent(String(id).trim());

  /*
    IMPORTANT:
    Never send the user directly to YouTube.

    Always open our own watch.html page.
  */

  const watchURL =
    "/watch.html?id=" +
    encodeURIComponent(id);

  window.location.assign(watchURL);
}


/* ================= CARD CLICK HANDLER ================= */

document.addEventListener("click", function (event) {

  /*
    Find clicked video card
  */

  const cardElement =
    event.target.closest(".card");

  if (!cardElement) return;

  const id =
    cardElement.dataset.videoId;

  if (!id) return;

  event.preventDefault();
  event.stopPropagation();

  openVideo(id);

});


/* ================= CARD KEYBOARD ================= */

document.addEventListener("keydown", function (event) {

  if (
    event.key !== "Enter" &&
    event.key !== " "
  ) {
    return;
  }

  const cardElement =
    event.target.closest(".card");

  if (!cardElement) return;

  const id =
    cardElement.dataset.videoId;

  if (!id) return;

  event.preventDefault();

  openVideo(id);

});


/* ================= LOAD WEBSITE ================= */

async function load() {

  try {

    const [
      videos,
      blogs,
      planList
    ] = await Promise.all([
      get("/api/videos"),
      get("/api/blogs"),
      get("/api/plans")
    ]);


    /* ================= ALL VIDEOS ================= */

    const videoGridElement =
      document.getElementById("videoGrid");

    if (videoGridElement) {

      videoGridElement.innerHTML =
        videos
          .map(card)
          .join("")
        ||
        `
          <p class="meta">
            No videos available.
          </p>
        `;

    }


    /* ================= DOCUMENTARIES ================= */

    const docGridElement =
      document.getElementById("docGrid");

    if (docGridElement) {

      const documentaries =
        videos.filter(v => {

          const category =
            String(v.category || "")
              .toLowerCase();

          return (
            category.includes("doc") ||
            category.includes("document")
          );

        });

      docGridElement.innerHTML =
        documentaries
          .map(card)
          .join("")
        ||
        `
          <p class="meta">
            No documentaries available.
          </p>
        `;

    }


    /* ================= SCI-FI ================= */

    const scifiGridElement =
      document.getElementById("scifiGrid");

    if (scifiGridElement) {

      const scifi =
        videos.filter(v => {

          const category =
            String(v.category || "")
              .toLowerCase();

          return (
            category.includes("sci") ||
            category.includes("science fiction")
          );

        });

      scifiGridElement.innerHTML =
        scifi
          .map(card)
          .join("")
        ||
        `
          <p class="meta">
            No Sci-Fi videos available.
          </p>
        `;

    }


    /* ================= SHOWS ================= */

    const showGridElement =
      document.getElementById("showGrid");

    if (showGridElement) {

      const shows =
        videos.filter(v => {

          const category =
            String(v.category || "")
              .toLowerCase();

          return (
            category.includes("show") ||
            category.includes("episode") ||
            category.includes("tv")
          );

        });

      showGridElement.innerHTML =
        shows
          .map(card)
          .join("")
        ||
        `
          <p class="meta">
            No TV episodes available.
          </p>
        `;

    }


    /* ================= BLOG ================= */

    const blogGridElement =
      document.getElementById("blogGrid");

    if (blogGridElement) {

      blogGridElement.innerHTML =
        (blogList || [])
          .map(blog => `

            <article class="blog">

              <div class="img">

                ${
                  blog.featured_image
                    ? `
                      <img
                        src="${escapeHTML(blog.featured_image)}"
                        alt="${escapeHTML(blog.title || "")}"
                        loading="lazy"
                      >
                    `
                    : ""
                }

              </div>

              <div class="body">

                <span class="meta">
                  ${escapeHTML(
                    blog.author || "Nikhil"
                  )}
                </span>

                <h3>
                  ${escapeHTML(
                    blog.title || ""
                  )}
                </h3>

                <p class="meta">
                  ${escapeHTML(
                    blog.excerpt || ""
                  )}
                </p>

              </div>

            </article>

          `)
          .join("");

    }


    /* ================= PREMIUM PLANS ================= */

    const plansElement =
      document.getElementById("plans");

    if (plansElement) {

      plansElement.innerHTML =
        (planList || [])
          .map(plan => `

            <div class="plan">

              <span>
                ${escapeHTML(
                  plan.name || "Premium"
                )}
              </span>

              <h3>

                ₹
                <strong>
                  ${escapeHTML(
                    plan.price || "0"
                  )}
                </strong>

                /
                ${escapeHTML(
                  plan.period || "month"
                )}

              </h3>

              <p>
                ${escapeHTML(
                  plan.features || ""
                )}
              </p>

              <button
                type="button"
                onclick="alert('Premium checkout is coming soon.')"
              >
                Join Premium
              </button>

            </div>

          `)
          .join("");

    }


  } catch (error) {

    console.error(
      "NIKHILVERSE loading error:",
      error
    );

  }

}


/* ================= SEARCH ================= */

const searchInput =
  document.getElementById("siteSearch");

if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        this.value.trim()
      ) {

        window.location.href =
          "/?q=" +
          encodeURIComponent(
            this.value.trim()
          );

      }

    }
  );

}


/* ================= AI ================= */

function openAI() {

  const ai =
    document.getElementById("ai");

  if (!ai) return;

  ai.hidden =
    !ai.hidden;

}


async function askAI() {

  const input =
    document.getElementById("msg");

  const chat =
    document.getElementById("chat");

  if (!input || !chat) return;

  const message =
    input.value.trim();

  if (!message) return;

  chat.innerHTML =
    "<b>You:</b> " +
    escapeHTML(message) +
    "<br><br>Thinking...";

  input.value = "";

  try {

    const response =
      await fetch(
        "/api/ai",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message
          })
        }
      );

    const result =
      await response.json();

    chat.innerHTML =
      "<b>You:</b> " +
      escapeHTML(message) +
      "<br><br>" +
      escapeHTML(
        result.answer ||
        "Sorry, I could not answer."
      );

  } catch (error) {

    console.error(error);

    chat.innerHTML =
      "<b>Error:</b> AI service unavailable.";

  }

}


/* ================= START ================= */

load();
