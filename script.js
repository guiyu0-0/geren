const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fitCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return { width, height, ratio };
}

function seededNoise(x, y, seed = 1) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function paintGrain(ctx, width, height, amount = 0.08) {
  const count = Math.round((width * height) / 900);
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  for (let i = 0; i < count; i += 1) {
    const alpha = seededNoise(i, 3.2, 8) * amount;
    const size = seededNoise(i, 7.8, 2) * 1.6 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(
      seededNoise(i, 1.4, 4) * width,
      seededNoise(i, 9.1, 7) * height,
      size,
      size,
    );
  }
  ctx.restore();
}

function drawBloom(canvas) {
  const { width, height } = fitCanvas(canvas);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  const support = Math.min(width, height);
  const centerX = width * 0.53;
  const centerY = height * 0.5;
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#d9d5ca");
  background.addColorStop(0.48, "#8b887e");
  background.addColorStop(1, "#1a1b1a");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const radius = support * (0.11 + (i % 3) * 0.035);
    const px = centerX + Math.cos(angle) * radius * 1.45;
    const py = centerY + Math.sin(angle) * radius;
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, support * 0.32);
    gradient.addColorStop(0, i % 2 ? "rgba(255,245,232,.92)" : "rgba(250,129,74,.82)");
    gradient.addColorStop(0.4, "rgba(171,169,160,.58)");
    gradient.addColorStop(1, "rgba(20,20,20,0)");
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + i * 0.16);
    ctx.scale(1.7, 0.58);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, support * (0.11 + ((i * 7) % 6) * 0.012), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const core = ctx.createRadialGradient(
    centerX - support * 0.08,
    centerY - support * 0.1,
    support * 0.01,
    centerX,
    centerY,
    support * 0.26,
  );
  core.addColorStop(0, "#fffaf0");
  core.addColorStop(0.17, "#e5d4bf");
  core.addColorStop(0.44, "#6f6c63");
  core.addColorStop(0.73, "#d3b09d");
  core.addColorStop(1, "#161616");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(centerX, centerY, support * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(255,255,255,.33)";
  ctx.lineWidth = Math.max(1, support * 0.002);
  for (let r = 0.08; r < 0.3; r += 0.06) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, support * r, -0.4, 4.5);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  paintGrain(ctx, width, height, 0.09);
}

function drawMemory(canvas) {
  const { width, height } = fitCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#100607");
  background.addColorStop(0.52, "#4d090e");
  background.addColorStop(1, "#120304");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.25,
    height * 0.3,
    0,
    width * 0.25,
    height * 0.3,
    width * 0.75,
  );
  glow.addColorStop(0, "rgba(250,92,53,.48)");
  glow.addColorStop(1, "rgba(70,0,4,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.lineCap = "round";
  for (let i = 0; i < 9; i += 1) {
    const y = height * (0.15 + i * 0.085);
    const points = [
      [-0.1, y],
      [0.22, y - height * (0.22 + i * 0.007)],
      [0.46, y + height * (0.16 - i * 0.012)],
      [0.7, y - height * (0.12 + i * 0.009)],
      [1.1, y + height * (0.11 - i * 0.006)],
    ];
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255,81,33,.06)");
    gradient.addColorStop(0.35, `rgba(255,${85 + i * 2},35,${0.3 + i * 0.045})`);
    gradient.addColorStop(0.7, `rgba(255,${137 + i * 3},75,${0.2 + i * 0.035})`);
    gradient.addColorStop(1, "rgba(80,0,0,.02)");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(2, width * (0.018 + i * 0.002));
    ctx.beginPath();
    ctx.moveTo(points[0][0] * width, points[0][1]);
    ctx.bezierCurveTo(
      points[1][0] * width,
      points[1][1],
      points[2][0] * width,
      points[2][1],
      points[3][0] * width,
      points[3][1],
    );
    ctx.bezierCurveTo(
      points[3][0] * width,
      points[3][1],
      points[4][0] * width,
      points[4][1],
      points[4][0] * width,
      points[4][1],
    );
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "screen";
  const haze = ctx.createRadialGradient(
    width * 0.62,
    height * 0.55,
    0,
    width * 0.62,
    height * 0.55,
    width * 0.3,
  );
  haze.addColorStop(0, "rgba(255,209,180,.24)");
  haze.addColorStop(1, "rgba(255,130,56,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  paintGrain(ctx, width, height, 0.07);
}

function drawRelic(canvas) {
  const { width, height } = fitCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#d7e2df");
  background.addColorStop(0.5, "#819a99");
  background.addColorStop(1, "#1b2c31");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const count = 24;
  const centerX = width * 0.51;
  const centerY = height * 0.49;
  for (let i = count; i > 0; i -= 1) {
    const scale = i / count;
    ctx.save();
    ctx.translate(centerX + (1 - scale) * width * 0.12, centerY);
    ctx.rotate((i / count) * 0.85);
    const fill = ctx.createLinearGradient(-width * 0.2, 0, width * 0.2, 0);
    fill.addColorStop(0, `rgba(227,242,236,${0.12 + scale * 0.26})`);
    fill.addColorStop(0.42, `rgba(102,138,142,${0.2 + scale * 0.3})`);
    fill.addColorStop(0.56, `rgba(245,238,216,${0.24 + scale * 0.24})`);
    fill.addColorStop(1, `rgba(20,39,46,${0.18 + scale * 0.2})`);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(
      -width * (0.06 + scale * 0.13),
      -height * (0.2 + scale * 0.23),
      width * (0.12 + scale * 0.26),
      height * (0.4 + scale * 0.46),
      width * 0.06,
    );
    ctx.fill();
    ctx.strokeStyle = `rgba(230,244,238,${0.2 + scale * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  const core = ctx.createRadialGradient(
    centerX - width * 0.02,
    centerY - height * 0.04,
    0,
    centerX,
    centerY,
    width * 0.09,
  );
  core.addColorStop(0, "#fffef1");
  core.addColorStop(0.4, "#dbe2cf");
  core.addColorStop(1, "rgba(215,230,220,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(centerX, centerY, width * 0.09, 0, Math.PI * 2);
  ctx.fill();
  paintGrain(ctx, width, height, 0.055);
}

function drawNature(canvas) {
  const { width, height } = fitCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#f15d2e");
  background.addColorStop(0.5, "#b82f20");
  background.addColorStop(1, "#3a0c08");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 16; i += 1) {
    const x = width * seededNoise(i, 2.1, 4);
    const y = height * seededNoise(i, 3.7, 7);
    const radius = Math.min(width, height) * (0.08 + seededNoise(i, 4.9, 9) * 0.23);
    const gradient = ctx.createRadialGradient(
      x - radius * 0.25,
      y - radius * 0.3,
      radius * 0.02,
      x,
      y,
      radius,
    );
    gradient.addColorStop(0, "rgba(255,238,218,.94)");
    gradient.addColorStop(0.25, "rgba(236,126,87,.78)");
    gradient.addColorStop(0.7, "rgba(122,21,17,.72)");
    gradient.addColorStop(1, "rgba(53,4,4,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(255,222,184,.25)";
  for (let i = 0; i < 8; i += 1) {
    ctx.lineWidth = Math.max(1, width * 0.0025);
    ctx.beginPath();
    ctx.moveTo(-width * 0.05, height * (0.16 + i * 0.1));
    ctx.bezierCurveTo(
      width * 0.27,
      height * (0.04 + i * 0.08),
      width * 0.67,
      height * (0.34 - i * 0.02),
      width * 1.05,
      height * (0.1 + i * 0.09),
    );
    ctx.stroke();
  }
  ctx.restore();
  paintGrain(ctx, width, height, 0.08);
}

const workPainters = {
  bloom: drawBloom,
  memory: drawMemory,
  relic: drawRelic,
  nature: drawNature,
};

function paintAllWorks() {
  document.querySelectorAll(".project-canvas, .fan-canvas").forEach((canvas) => {
    workPainters[canvas.dataset.art]?.(canvas);
  });
}

function initHeroCanvas() {
  const canvas = document.querySelector("#hero-canvas");
  if (!canvas) return;

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let frame = 0;

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  function resize() {
    fitCanvas(canvas);
  }

  function render(time = 0) {
    const { width, height } = fitCanvas(canvas);
    const ctx = canvas.getContext("2d");
    pointerX += (targetX - pointerX) * 0.035;
    pointerY += (targetY - pointerY) * 0.035;

    const background = ctx.createRadialGradient(
      width * (0.42 + pointerX * 0.04),
      height * (0.35 + pointerY * 0.04),
      width * 0.02,
      width * 0.5,
      height * 0.5,
      width * 0.7,
    );
    background.addColorStop(0, "#f2eee5");
    background.addColorStop(0.3, "#b9b4a9");
    background.addColorStop(0.66, "#5d5b56");
    background.addColorStop(1, "#0b0b0b");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-0.36 + Math.sin(time * 0.00015) * 0.11);
    for (let ring = 0; ring < 9; ring += 1) {
      const ringScale = 1 - ring * 0.085;
      const gradient = ctx.createLinearGradient(
        -width * 0.3,
        -height * 0.3,
        width * 0.3,
        height * 0.3,
      );
      gradient.addColorStop(0, `rgba(255,248,231,${0.11 + ring * 0.025})`);
      gradient.addColorStop(0.28, `rgba(139,137,132,${0.2 + ring * 0.04})`);
      gradient.addColorStop(0.49, `rgba(35,35,35,${0.3 + ring * 0.05})`);
      gradient.addColorStop(0.67, `rgba(211,211,199,${0.14 + ring * 0.035})`);
      gradient.addColorStop(1, `rgba(255,92,44,${0.04 + ring * 0.015})`);
      ctx.fillStyle = gradient;
      ctx.strokeStyle = "rgba(255,255,255,.17)";
      ctx.lineWidth = Math.max(1, width * 0.002);
      ctx.beginPath();
      ctx.ellipse(
        pointerX * width * 0.018,
        pointerY * height * 0.018,
        width * (0.34 - ring * 0.023),
        height * (0.41 - ring * 0.03),
        ring * 0.19 + time * 0.000035,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const sheen = ctx.createRadialGradient(
      width * (0.33 + pointerX * 0.05),
      height * (0.23 + pointerY * 0.05),
      0,
      width * 0.4,
      height * 0.3,
      width * 0.33,
    );
    sheen.addColorStop(0, "rgba(255,255,252,.9)");
    sheen.addColorStop(0.22, "rgba(255,160,118,.35)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.13)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i += 1) {
      const y = height * (0.1 + i * 0.075);
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(time * 0.0008 + i) * 4);
      ctx.lineTo(width, y - Math.sin(time * 0.0007 + i) * 4);
      ctx.stroke();
    }
    ctx.restore();
    paintGrain(ctx, width, height, 0.07);

    if (!reducedMotion) frame = requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);
  if (reducedMotion) {
    render(0);
  } else {
    frame = requestAnimationFrame(render);
  }

  return () => cancelAnimationFrame(frame);
}

function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".menu-panel");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.querySelector(".menu-toggle-label").textContent = open ? "CLOSE" : "MENU";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function initPageLoader() {
  const loader = document.querySelector(".page-loader");
  const count = loader?.querySelector(".loader-count");
  const bar = loader?.querySelector(".loader-progress i");
  if (!loader || !count || !bar) return;

  let finished = false;
  const start = performance.now();
  const duration = 1350;

  const finish = () => {
    if (finished) return;
    finished = true;
    count.textContent = "100";
    bar.style.transform = "scaleX(1)";
    loader.classList.add("is-complete");
    document.documentElement.classList.add("is-ready");
    window.setTimeout(() => loader.remove(), 1000);
  };

  if (reducedMotion) {
    finish();
    return;
  }

  const update = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    count.textContent = String(Math.round(eased * 100)).padStart(2, "0");
    bar.style.transform = `scaleX(${eased})`;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      finish();
    }
  };

  requestAnimationFrame(update);
  window.setTimeout(finish, 2400);
}

function initCursor() {
  const cursor = document.querySelector(".cursor");
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

  const cursorLabel = cursor.querySelector("span");
  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    },
    { passive: true },
  );

  function move() {
    currentX += (targetX - currentX) * 0.17;
    currentY += (targetY - currentY) * 0.17;
    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;
    requestAnimationFrame(move);
  }
  move();

  document.querySelectorAll("[data-cursor]").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursorLabel.textContent = element.dataset.cursor;
      cursor.classList.add("is-active");
    });
    element.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
  });
}

function initHeroMotion() {
  const hero = document.querySelector(".hero");
  const heading = document.querySelector(".hero-heading");
  if (!hero || !heading) return;

  let frame;
  const updateScroll = () => {
    const progress = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
    heading.style.transform = `translate3d(0, ${progress * 42}px, 0)`;
    heading.style.opacity = String(1 - progress * 0.16);
    frame = undefined;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (frame || reducedMotion) return;
      frame = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );

  if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty("--hero-px", `${x * 22}px`);
        hero.style.setProperty("--hero-py", `${y * 18}px`);
      },
      { passive: true },
    );

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hero-px", "0px");
      hero.style.setProperty("--hero-py", "0px");
    });
  }
}

function initMagneticElements() {
  if (window.matchMedia("(pointer: coarse)").matches || reducedMotion) return;

  document.querySelectorAll("[data-magnetic]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.setProperty("--mag-x", `${x * 0.18}px`);
      element.style.setProperty("--mag-y", `${y * 0.22}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mag-x", "0px");
      element.style.setProperty("--mag-y", "0px");
    });
  });
}

function initFeaturedShowcase() {
  const stage = document.querySelector(".showcase-stage");
  if (!stage) return;

  const reveal = () => stage.classList.add("is-visible");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveal();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        reveal();
        observer.disconnect();
      },
      { threshold: 0.22 },
    );
    observer.observe(stage);
  }

  if (window.matchMedia("(pointer: coarse)").matches || reducedMotion) return;

  document.querySelectorAll(".fan-card").forEach((card) => {
    const inner = card.querySelector(".fan-card-inner");
    if (!inner) return;

    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        inner.style.setProperty("--fan-rx", `${(0.5 - y) * 5}deg`);
        inner.style.setProperty("--fan-ry", `${(x - 0.5) * 6}deg`);
        inner.style.setProperty("--fan-mx", `${x * 100}%`);
        inner.style.setProperty("--fan-my", `${y * 100}%`);
      },
      { passive: true },
    );

    card.addEventListener("pointerleave", () => {
      inner.style.setProperty("--fan-rx", "0deg");
      inner.style.setProperty("--fan-ry", "0deg");
    });
  });
}

function initProjectTilt() {
  if (window.matchMedia("(pointer: coarse)").matches || reducedMotion) return;

  document.querySelectorAll(".project").forEach((project) => {
    const media = project.querySelector(".project-media");
    if (!media) return;

    project.addEventListener(
      "pointermove",
      (event) => {
        const rect = media.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        media.style.setProperty("--tilt-x", `${(0.5 - y) * 3.2}deg`);
        media.style.setProperty("--tilt-y", `${(x - 0.5) * 3.2}deg`);
        media.style.setProperty("--spot-x", `${x * 100}%`);
        media.style.setProperty("--spot-y", `${y * 100}%`);
      },
      { passive: true },
    );

    project.addEventListener("pointerleave", () => {
      media.style.setProperty("--tilt-x", "0deg");
      media.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function initProjectModal() {
  const modal = document.querySelector(".project-modal");
  const canvas = document.querySelector("#modal-canvas");
  const closeButton = modal?.querySelector(".project-modal-close");
  const backdrop = modal?.querySelector(".project-modal-backdrop");
  const title = modal?.querySelector("#project-modal-title");
  const number = modal?.querySelector("#project-modal-number");
  const year = modal?.querySelector("#project-modal-year");
  const discipline = modal?.querySelector("#project-modal-discipline");
  const description = modal?.querySelector("#project-modal-description");
  if (!modal || !canvas || !closeButton) return;

  let returnFocus;

  const paintModal = () => {
    const painter = workPainters[canvas.dataset.art];
    if (painter) painter(canvas);
  };

  const open = (project, trigger) => {
    returnFocus = trigger;
    canvas.dataset.art = project.dataset.art;
    title.textContent = project.dataset.project;
    number.textContent = `${project.querySelector(".project-no").textContent} / 04`;
    year.textContent = project.dataset.year;
    discipline.textContent = project.dataset.discipline;
    description.textContent = project.dataset.description;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    requestAnimationFrame(paintModal);
    closeButton.focus({ preventScroll: true });
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    returnFocus?.focus({ preventScroll: true });
  };

  document.querySelectorAll("[data-project-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      open(link.closest(".project"), link);
    });
  });

  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  modal.querySelector(".project-modal-link").addEventListener("click", close);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
    if (event.key !== "Tab" || !modal.classList.contains("is-open")) return;

    const focusable = [...modal.querySelectorAll("button, a")].filter(
      (element) => !element.hasAttribute("disabled"),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (modal.classList.contains("is-open")) paintModal();
  });
}

function initReveals() {
  const items = [...document.querySelectorAll(".reveal")];
  items.forEach((item) => {
    const siblings = [...(item.parentElement?.children || [])].filter((child) =>
      child.classList.contains("reveal"),
    );
    const index = siblings.indexOf(item);
    item.style.transitionDelay = `${Math.min(index, 6) * 65}ms`;
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  items.forEach((item) => observer.observe(item));
}

function initScrollProgress() {
  const progress = document.querySelector(".scroll-progress");
  if (!progress) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initHeaderTheme() {
  const header = document.querySelector(".site-header");
  const darkSections = [...document.querySelectorAll(".works, .contact")];
  if (!header) return;

  const update = () => {
    const isOnDark = darkSections.some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 28 && rect.bottom > 28;
    });
    header.classList.toggle("is-light", isOnDark);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initClock() {
  const clock = document.querySelector("#local-time");
  if (!clock) return;

  const update = () => {
    clock.textContent = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(new Date());
  };

  update();
  window.setInterval(update, 30000);
}

let resizeFrame;
window.addEventListener("resize", () => {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(paintAllWorks);
});

initHeroCanvas();
paintAllWorks();
initPageLoader();
initMenu();
initCursor();
initHeroMotion();
initMagneticElements();
initFeaturedShowcase();
initProjectTilt();
initProjectModal();
initReveals();
initScrollProgress();
initHeaderTheme();
initClock();
