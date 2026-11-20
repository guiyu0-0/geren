const data = window.CATEGORY_PAGE;

if (data) {
  document.documentElement.style.setProperty("--accent", data.accent);
  document.title = `${data.title} — ${data.english} / IMGUIYU`;

  const app = document.querySelector("#category-app");
  const items = data.items || [];
  const cover = items[0] || { src: "", title: data.title };
  const secondary = items[1] || cover;

  app.innerHTML = `
    <div class="category-page">
      <div class="category-progress" data-progress aria-hidden="true"></div>
      <header class="category-header">
        <a class="category-brand" href="index.html" aria-label="返回 IMGUIYU 首页">
          <strong>IM/</strong>
          <span>VISUAL DESIGN<br />PORTFOLIO 2026</span>
        </a>
        <span class="category-header-center"><i></i>CATEGORY ${data.index} / ${data.total}</span>
        <nav class="category-header-actions" aria-label="分类页导航">
          <a href="index.html#signal">ALL CATEGORIES</a>
          <a href="mailto:2218778864@qq.com">CONTACT ↗</a>
        </nav>
      </header>

      <main>
        <section class="category-hero">
          <div class="category-hero-copy">
            <div>
              <p class="category-kicker">${data.tag}</p>
              <h1 class="category-title">
                ${data.title}
                <span class="category-title-en">${data.english}</span>
              </h1>
              <p class="category-lede">${data.lede}</p>
              <p class="category-description">${data.description}</p>
            </div>

            <div class="category-meta">
              <div><span>DISCIPLINE</span><strong>${data.discipline}</strong></div>
              <div><span>PERIOD</span><strong>${data.period}</strong></div>
              <div><span>FORMAT</span><strong>${data.format}</strong></div>
            </div>
          </div>

          <div class="category-hero-visual" data-hero-visual>
            <div class="category-orbit" aria-hidden="true"></div>
            <figure class="category-cover">
              <img src="${cover.src}" alt="${cover.title}" loading="eager" decoding="async" />
            </figure>
            <figure class="category-cover-secondary">
              <img src="${secondary.src}" alt="${secondary.title}" loading="eager" decoding="async" />
            </figure>
            <span class="category-count">${String(items.length).padStart(2, "0")}</span>
          </div>
        </section>

        <section class="category-work-section" aria-labelledby="category-work-title">
          <div class="category-section-head">
            <h2 id="category-work-title">SELECTED<br />WORKS</h2>
            <p>${data.galleryNote}</p>
          </div>

          <div class="category-work-grid">
            ${items
              .map(
                (item, index) => `
                  <button class="category-work reveal" type="button" data-work-index="${index}">
                    <span class="category-work-media">
                      <img
                        src="${item.src}"
                        alt="${item.title}"
                        loading="lazy"
                        decoding="async"
                        width="346"
                        height="487"
                      />
                    </span>
                    <span class="category-work-info">
                      <span>${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}</span>
                      <h3>${item.title}</h3>
                      <p>${item.meta}</p>
                    </span>
                  </button>`,
              )
              .join("")}
          </div>
        </section>

        <a class="category-next" href="${data.next.href}">
          <span>NEXT CATEGORY / 下一分类</span>
          <strong>${data.next.title}<br /><em>${data.next.english}</em></strong>
        </a>
      </main>

      <footer class="category-footer">
        <span>© 2026 IMGUIYU / ${data.english.toUpperCase()}</span>
        <a href="index.html#signal">← BACK TO ALL CATEGORIES</a>
        <a href="index.html#contact">CONTACT ↗</a>
      </footer>

      <div class="category-lightbox" role="dialog" aria-modal="true" aria-label="作品大图预览">
        <button class="category-lightbox-backdrop" type="button" aria-label="关闭"></button>
        <div class="category-lightbox-panel">
          <div class="category-lightbox-media">
            <img src="" alt="" />
          </div>
          <div class="category-lightbox-copy">
            <button class="category-lightbox-close" type="button" aria-label="关闭">×</button>
            <span class="category-lightbox-index"></span>
            <h2></h2>
            <p></p>
            <div class="category-lightbox-nav">
              <button type="button" data-direction="-1">← PREV</button>
              <button type="button" data-direction="1">NEXT →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const works = [...app.querySelectorAll(".category-work")];
  const lightbox = app.querySelector(".category-lightbox");
  const lightboxImage = lightbox.querySelector(".category-lightbox-media img");
  const lightboxIndex = lightbox.querySelector(".category-lightbox-index");
  const lightboxTitle = lightbox.querySelector("h2");
  const lightboxMeta = lightbox.querySelector("p");
  const closeButton = lightbox.querySelector(".category-lightbox-close");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let returnFocus = null;

  works.forEach((work) => {
    const image = work.querySelector("img");
    const markLoaded = () => work.classList.add("is-loaded");
    if (image.complete) markLoaded();
    else image.addEventListener("load", markLoaded, { once: true });
    image.addEventListener("error", markLoaded, { once: true });
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    works.forEach((work) => observer.observe(work));
  } else {
    works.forEach((work) => work.classList.add("is-visible"));
  }

  const paintLightbox = (index) => {
    activeIndex = (index + items.length) % items.length;
    const item = items[activeIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;
    lightboxIndex.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    lightboxTitle.textContent = item.title;
    lightboxMeta.textContent = item.meta;
  };

  const openLightbox = (index, trigger) => {
    returnFocus = trigger;
    paintLightbox(index);
    lightbox.classList.add("is-open");
    document.body.classList.add("is-locked");
    closeButton.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    returnFocus?.focus({ preventScroll: true });
  };

  works.forEach((work, index) => {
    work.addEventListener("click", () => openLightbox(index, work));
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.querySelector(".category-lightbox-backdrop").addEventListener("click", closeLightbox);
  lightbox.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      paintLightbox(activeIndex + Number(button.dataset.direction));
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") paintLightbox(activeIndex - 1);
    if (event.key === "ArrowRight") paintLightbox(activeIndex + 1);
  });

  const heroVisual = app.querySelector("[data-hero-visual]");
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty("--cover-x", `${x * 14}px`);
      heroVisual.style.setProperty("--cover-y", `${y * 12}px`);
      heroVisual.style.setProperty("--secondary-x", `${x * -10}px`);
      heroVisual.style.setProperty("--secondary-y", `${y * -8}px`);
    });

    heroVisual.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--cover-x", "0px");
      heroVisual.style.setProperty("--cover-y", "0px");
      heroVisual.style.setProperty("--secondary-x", "0px");
      heroVisual.style.setProperty("--secondary-y", "0px");
    });
  }

  const progress = app.querySelector("[data-progress]");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}
