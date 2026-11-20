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

const PROJECT_DETAILS = {
  bloom: {
    title: ["SYNTHETIC", "BLOOM"],
    year: "2026",
    kicker: "AI CAMPAIGN / BRAND WORLD",
    discipline: "AI CAMPAIGN",
    lede: "以人工培育的发光花体为核心，建立一套介于自然物与合成材料之间的品牌视觉世界。",
    concept: "不是把花做成图像，而是为它建立一套生长规则。",
    paragraphs: [
      "项目从一个简单的问题开始：如果花朵可以由模型培育，它的形态、光泽与开放方式会遵循什么逻辑？我以「合成花体」为核心，把有机曲线、工业金属和生物发光放进同一个视觉系统里。",
      "在艺术指导层面，我用统一的低饱和背景、局部高光和严格的三段式构图控制画面；在生成层面，则通过提示词与局部重绘反复校准花瓣密度、透明度和光源方向，让每一张图都像来自同一个实验室。",
    ],
    quote: "不是复制一朵花，而是设计它生长的规则。",
    role: "ART DIRECTION / GENERATIVE IMAGE / RETOUCH",
    client: "SELF-INITIATED / CONCEPT CAMPAIGN",
    tools: "MIDJOURNEY / PHOTOSHOP / AFTER EFFECTS",
    tags: ["AI CAMPAIGN", "ART DIRECTION", "IMAGE SYSTEM", "RETOUCH", "BRAND WORLD"],
    frames: [
      ["FRAME 01", "PETAL STUDY"],
      ["FRAME 02", "LIGHT TEST"],
      ["FRAME 03", "SYSTEM DETAIL"],
    ],
  },
  memory: {
    title: ["MEMORY", "FLUID"],
    year: "2025",
    kicker: "AI FILM / MOTION STUDY",
    discipline: "AI FILM",
    lede: "将记忆转译为持续变形的流体结构，用缓慢运动与失焦画面制造一种近在眼前却无法抓住的情绪。",
    concept: "把记忆做成一种无法握住的流体。",
    paragraphs: [
      "记忆并不稳定，它会在反复回想中被改写。项目以流体、烟雾和失焦光斑作为主要语言，把这种「越靠近越模糊」的体验转译成一段影像。",
      "视觉上刻意保留大量暗部与噪点，让红色光带像神经信号一样穿过画面。运动节奏从缓慢呼吸逐渐加速，再在结尾重新沉入静止。",
    ],
    quote: "越靠近，越模糊；越模糊，越真实。",
    role: "CONCEPT / IMAGE / MOTION / SOUND",
    client: "SELF-INITIATED / SHORT FILM",
    tools: "MIDJOURNEY / RUNWAY / AFTER EFFECTS / ABLETON",
    tags: ["AI FILM", "MOTION", "SOUND", "COLOR SCRIPT", "CONCEPT"],
    frames: [
      ["FRAME 01", "DRIFT"],
      ["FRAME 02", "BLEED"],
      ["FRAME 03", "RESIDUE"],
    ],
  },
  relic: {
    title: ["NEW", "RELIC"],
    year: "2025",
    kicker: "PRODUCT VISION / CGI",
    discipline: "PRODUCT VISION",
    lede: "把未来器物设计成某种考古遗存，以半透明层片、金属微光和冷静构图探索数字物质性的美学。",
    concept: "为未来造物，留下可以被考古的证据。",
    paragraphs: [
      "如果今天的数字产品在一百年后被发掘，它会以什么形态存在？我把这个问题推向极端：用半透明层片、金属微光和近乎冷静的构图，把未来器物做成某种「遗存」。",
      "项目建立了一套器物摄影式的视觉规范——固定视角、单一光源、克制的材质对比。每一件物体都只露出部分结构，让观看者自行补全它的用途与年代。",
    ],
    quote: "让物件看起来像被未来遗落，而不是被现在制造。",
    role: "ART DIRECTION / 3D DIRECTION / TYPE",
    client: "CONCEPT / PRODUCT VISION",
    tools: "MIDJOURNEY / BLENDER / PHOTOSHOP",
    tags: ["PRODUCT VISION", "CGI", "VISUAL SYSTEM", "TYPE", "ART DIRECTION"],
    frames: [
      ["FRAME 01", "ARTIFACT A"],
      ["FRAME 02", "MATERIAL TEST"],
      ["FRAME 03", "TYPE LOCKUP"],
    ],
  },
  nature: {
    title: ["AFTER", "NATURE"],
    year: "2024",
    kicker: "SPECULATIVE SERIES / WORLD BUILDING",
    discipline: "SPECULATIVE SERIES",
    lede: "一个发生在自然之后的生态想象：有机体、光与热在未知环境中重新组合，形成新的物种秩序。",
    concept: "在自然结束之后，重新设计自然的语法。",
    paragraphs: [
      "这是一个发生在「自然之后」的生态想象。有机体、矿物、热与光在未知环境中重新组合，形成一套不属于现有分类的物种秩序。",
      "我先把色彩和材质拆成基础元素，再让它们在不同场景中重新配对：海藻一样的结构生长在金属表面，花粉像数据一样悬浮。最终输出既像科学记录，也像一段无法验证的传说。",
    ],
    quote: "我们不是在记录自然，而是在为它写下一个版本。",
    role: "ART DIRECTION / WORLD BUILDING / IMAGE",
    client: "SPECULATIVE / SELF-INITIATED",
    tools: "MIDJOURNEY / PHOTOSHOP / TOUCHDESIGNER",
    tags: ["SPECULATIVE", "WORLD BUILDING", "IMAGE", "EXPERIENCE", "SERIES"],
    frames: [
      ["FRAME 01", "SPECIMEN 01"],
      ["FRAME 02", "HABITAT"],
      ["FRAME 03", "ORGANISM"],
    ],
  },
};

const PROJECT_ORDER = Object.keys(PROJECT_DETAILS);

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

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest?.("[data-cursor]");
    if (!target) return;
    cursorLabel.textContent = target.dataset.cursor;
    cursor.classList.add("is-active");
  });

  document.addEventListener("pointerout", (event) => {
    const target = event.target.closest?.("[data-cursor]");
    if (!target || target.contains(event.relatedTarget)) return;
    cursor.classList.remove("is-active");
  });
}

function initHeroMotion() {
  const hero = document.querySelector(".hero");
  const heading = document.querySelector(".hero-copy");
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
}

function initSpinShutter() {
  const stage = document.querySelector(".showcase-stage");
  const deck = stage ? stage.querySelector(".fan-deck") : null;
  if (!stage || !deck) return;

  // 如果 fan-deck 是空的（动态模式），生成 15 张独立卡片
  if (!deck.children.length) {
    const CARD_DATA = [
      { num: "01 / 15", tag: "BRAND ID",       year: "2026", title: "KABULI\nHEADWEAR",         p: "BRAND · LOGO · LOOKBOOK",    src: "assets/Rectangle 197.png" },
      { num: "02 / 15", tag: "TRAVEL CAMPAIGN", year: "2026", title: "CITY\nSERIES",             p: "ART DIRECTION · IMAGE",      src: "assets/Rectangle 198.png" },
      { num: "03 / 15", tag: "PRODUCT SHOT",   year: "2025", title: "HEADWEAR\nSUPPLY",         p: "STILL · COMPOSITION",        src: "assets/Rectangle 199.png" },
      { num: "04 / 15", tag: "STATION × MS",   year: "2025", title: "POWER\nSTATION",           p: "POSTER · COLLAB",            src: "assets/Rectangle 200.png" },
      { num: "05 / 15", tag: "PACKAGING",      year: "2025", title: "WHITE CHOCO\nORANGE SLICE", p: "BOX · LABEL · RETOUCH",      src: "assets/Rectangle 201.png" },
      { num: "06 / 15", tag: "PRODUCT RENDER", year: "2025", title: "XBOX\nELITE",              p: "CGI · HARD SURFACE",         src: "assets/Rectangle 202.png" },
      { num: "07 / 15", tag: "BRAND FILM",     year: "2024", title: "CRAFTED\nWITH CARE",       p: "MOVIE · STORYBOARD",         src: "assets/Rectangle 203.png" },
      { num: "08 / 15", tag: "E-COMMERCE",     year: "2024", title: "BAG\nSTORY",               p: "MODEL · PROPS",              src: "assets/Rectangle 204.png" },
      { num: "09 / 15", tag: "STILL LIFE",     year: "2024", title: "CEREAL\nBOWL",             p: "TABLETOP · LIGHTING",        src: "assets/Rectangle 205.png" },
      { num: "10 / 15", tag: "3D CONCEPT",     year: "2024", title: "TOY\nWORLD",               p: "CGI · CHARACTER",            src: "assets/Rectangle 206.png" },
      { num: "11 / 15", tag: "LIFESTYLE",      year: "2023", title: "MORNING\nTABLE",           p: "STILL · COLOR",              src: "assets/Rectangle 207.png" },
      { num: "12 / 15", tag: "PRODUCT SET",    year: "2023", title: "DESSERT\nARRANGEMENT",     p: "PACK · RENDER",              src: "assets/Rectangle 208.png" },
      { num: "13 / 15", tag: "PRODUCT VIEW",   year: "2023", title: "SHOE\nDETAIL",             p: "MACRO · RETOUCH",            src: "assets/Rectangle 209.png" },
      { num: "14 / 15", tag: "INTERIOR SHOT",  year: "2023", title: "DESK\nSETUP",              p: "ENVIRONMENT · LIGHT",        src: "assets/Rectangle 210.png" },
      { num: "15 / 15", tag: "ARCHIVE",        year: "—",    title: "ALL\nWORKS",               p: "EXPLORE MORE →",             src: "assets/Rectangle 211.png", archive: true },
    ];
    CARD_DATA.forEach((d) => {
      const card = document.createElement("a");
      card.className = d.archive ? "fan-card fan-card-archive" : "fan-card";
      card.href = d.archive ? "#works" : "#works";
      card.setAttribute("draggable", "false");
      card.setAttribute("data-cursor", d.archive ? "ALL" : "VIEW");
      card.setAttribute("data-project-open", "");
      card.innerHTML = `
        <div class="fan-card-inner">
          ${d.archive
            ? '<div class="archive-lines" aria-hidden="true"></div>'
            : `<img class="fan-canvas" src="${d.src}" alt="" aria-hidden="true" draggable="false" />`}
          <div class="fan-card-top">
            <span>${d.num}</span>
            <span>${d.tag}</span>
          </div>
          <div class="${d.archive ? "archive-copy" : "fan-card-copy"}">
            ${d.archive ? `<span>EXPLORE</span><strong>${d.title.replace("\n", "<br />")}</strong><i>↗</i>` : `<span>${d.year}</span><h3>${d.title.replace("\n", "<br />")}</h3><p>${d.p}</p>`}
          </div>
        </div>`;
      deck.appendChild(card);
    });
  }

  // 先清理之前克隆留下的重复卡片
  deck.querySelectorAll('.fan-card[aria-hidden="true"]').forEach((n) => n.remove());

  const repeat = 1;
  if (repeat > 1) {
    const sources = [...deck.querySelectorAll(".fan-card")];
    for (let round = 1; round < repeat; round += 1) {
      sources.forEach((source) => {
        const clone = source.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("tabindex", "-1");
        deck.appendChild(clone);
      });
    }
    paintAllWorks();
  }

  const cards = [...deck.querySelectorAll(".fan-card")];
  if (!cards.length) return;

  if (!window.matchMedia("(pointer: coarse)").matches && !reducedMotion) {
    cards.forEach((card) => {
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

  const options = {
    tilt: (10 * Math.PI) / 180,
    roll: 0,
    distance: 3.2,
    speed: 1.2,
    haze: 0.34,
    aperture: 0.75,
    introDuration: 1600,
  };
  const offsets = cards.map((_, index) => (index / cards.length) * Math.PI * 2);
  const depthAtCos = (cos) => (options.distance - 1) / (options.distance - cos);
  const farDepth = depthAtCos(-Math.abs(Math.min(...offsets.map((offset) => Math.cos(offset)))));

  stage.classList.add("is-orbit");

  const state = {
    rotation: 0,
    fling: 0,
    speedFactor: 1,
    intro: reducedMotion ? 1 : 0,
    introStart: 0,
    raf: 0,
    last: 0,
    hovering: false,
    hovered: null,
    drag: null,
    suppressClick: false,
  };
  const layout = { offsetX: 0, offsetY: 0, radius: 0, cardWidth: 0, cardHeight: 0 };

  const measure = () => {
    const stageRect = stage.getBoundingClientRect();
    const deckRect = deck.getBoundingClientRect();
    const width = stageRect.width;
    const height = Math.max(deckRect.height, 320);
    const sinTilt = Math.sin(options.tilt);

    let cardWidth = clamp(width * 0.26, 120, 320);
    let radius = width * 0.58;
    let cardHeight = cardWidth / 0.71;

    let reachX = 0;
    let lowY = 0;
    let highY = 0;
    const samples = 96;
    for (let s = 0; s < samples; s += 1) {
      const spin = (s / samples) * Math.PI * 2;
      offsets.forEach((offset) => {
        const angle = spin + offset;
        const cos = Math.cos(angle);
        const depth = depthAtCos(cos);
        const x = Math.sin(angle) * radius * depth;
        const y = cos * radius * sinTilt * depth;
        reachX = Math.max(reachX, Math.abs(x) + (cardWidth / 2) * depth);
        lowY = Math.min(lowY, y - (cardHeight / 2) * depth);
        highY = Math.max(highY, y + (cardHeight / 2) * depth);
      });
    }

    const fit = Math.min(1, (width * 0.96) / (2 * reachX), (height * 0.94) / (highY - lowY));

    radius *= fit;
    cardWidth *= fit;
    cardHeight *= fit;

    layout.radius = radius;
    layout.cardWidth = cardWidth;
    layout.cardHeight = cardHeight;
    layout.offsetX = stageRect.left - deckRect.left + width / 2 - deckRect.width / 2;
    layout.offsetY = stageRect.top - deckRect.top + height / 2 - deckRect.height / 2 - ((lowY + highY) / 2) * fit;

    cards.forEach((card) => {
      card.style.width = `${cardWidth.toFixed(1)}px`;
    });
  };

  const render = () => {
    const opened = 1 - Math.pow(1 - state.intro, 3);
    const spread = 0.18 + 0.82 * opened;
    const radius = layout.radius * spread;
    const sinTilt = Math.sin(options.tilt);
    const cosRoll = Math.cos(options.roll);
    const sinRoll = Math.sin(options.roll);

    cards.forEach((card, index) => {
      const angle = state.rotation + offsets[index] * spread;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const depth = Math.max((options.distance - 1) / (options.distance - cos * spread), 0.2);
      const depthT = clamp((depth - farDepth) / (1 - farDepth), 0, 1);
      const hovered = card === state.hovered;

      const x = sin * radius * depth;
      const y = cos * radius * sinTilt * depth;
      const screenX = x * cosRoll - y * sinRoll;
      const screenY = x * sinRoll + y * cosRoll;

      const blur = options.aperture * 8 * Math.pow(1 - depthT, 1.7);
      const opacity = hovered ? 1 : 1 - options.haze * (1 - depthT);

      card.style.transform = `translate(calc(-50% + ${(screenX + layout.offsetX).toFixed(2)}px), calc(-50% + ${(screenY + layout.offsetY).toFixed(2)}px)) scale(${(depth * (hovered ? 1.05 : 1)).toFixed(4)})`;
      card.style.zIndex = String(Math.round(depth * 100) + (hovered ? 200 : 0));
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = blur > 0.2 && !hovered ? `blur(${blur.toFixed(2)}px)` : "none";
    });
  };

  const start = () => {
    if (state.raf || reducedMotion) return;
    state.last = 0;
    state.raf = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    window.cancelAnimationFrame(state.raf);
    state.raf = 0;
  };

  function tick(now) {
    if (!state.last) state.last = now;
    const dt = Math.min((now - state.last) / 1000, 0.05);
    state.last = now;

    if (state.intro < 1 && state.introStart) {
      state.intro = clamp((now - state.introStart) / options.introDuration, 0, 1);
    }

    const speedTarget = state.hovering || state.drag ? 0 : 1;
    state.speedFactor += (speedTarget - state.speedFactor) * Math.min(1, dt * 6);
    state.rotation += ((options.speed / 60) * Math.PI * 2 * state.speedFactor + state.fling) * dt;
    state.fling *= Math.pow(0.92, dt * 60);

    render();
    state.raf = window.requestAnimationFrame(tick);
  }

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      state.hovered = card;
    });
    card.addEventListener("pointerleave", () => {
      if (state.hovered === card) state.hovered = null;
    });
  });

  deck.addEventListener("pointerenter", () => {
    state.hovering = true;
  });
  deck.addEventListener("pointerleave", () => {
    state.hovering = false;
  });

  deck.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    state.suppressClick = false;
    state.drag = {
      startX: event.clientX,
      lastX: event.clientX,
      lastMove: performance.now(),
      moved: false,
      velocity: 0,
    };
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!state.drag) return;
      const dx = event.clientX - state.drag.lastX;
      state.drag.lastX = event.clientX;
      if (Math.abs(event.clientX - state.drag.startX) > 6) state.drag.moved = true;
      if (!state.drag.moved) return;

      const arm = Math.max(layout.radius, 120);
      state.rotation += dx / arm;
      const now = performance.now();
      const dt = Math.max(now - state.drag.lastMove, 8) / 1000;
      state.drag.velocity = dx / arm / dt;
      state.drag.lastMove = now;
    },
    { passive: true },
  );

  const endDrag = () => {
    if (!state.drag) return;
    if (state.drag.moved) {
      state.fling = clamp(state.drag.velocity, -5, 5);
      state.suppressClick = true;
    }
    state.drag = null;
  };

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  deck.addEventListener(
    "click",
    (event) => {
      if (!state.suppressClick) return;
      state.suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  document.addEventListener("dragstart", (event) => {
    if (event.target.closest?.(".fan-card, .project-link")) {
      event.preventDefault();
    }
  });

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      measure();
      render();
    });
  });

  measure();
  render();
  window.requestAnimationFrame(() => {
    measure();
    render();
  });

  if (reducedMotion) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!state.introStart) state.introStart = performance.now();
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(stage);
  } else {
    state.introStart = performance.now();
    start();
  }
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

function initSignalCards() {
  const grid = document.querySelector(".signal-grid");
  if (!grid) return;
  if (window.matchMedia("(pointer: coarse)").matches || reducedMotion) return;

  const cards = [...grid.querySelectorAll(".signal-card")];
  const STRENGTH = 12;
  const ROTATE = 3.2;

  cards.forEach((card) => {
    const state = {
      tx: 0,
      ty: 0,
      rx: 0,
      ry: 0,
      targetTx: 0,
      targetTy: 0,
      targetRx: 0,
      targetRy: 0,
      raf: 0,
    };

    const step = () => {
      state.tx += (state.targetTx - state.tx) * 0.16;
      state.ty += (state.targetTy - state.ty) * 0.16;
      state.rx += (state.targetRx - state.rx) * 0.16;
      state.ry += (state.targetRy - state.ry) * 0.16;

      card.style.setProperty("--tx", `${state.tx.toFixed(2)}px`);
      card.style.setProperty("--ty", `${state.ty.toFixed(2)}px`);
      card.style.setProperty("--rx", `${state.rx.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${state.ry.toFixed(2)}deg`);

      const settled =
        Math.abs(state.targetTx - state.tx) < 0.05 &&
        Math.abs(state.targetTy - state.ty) < 0.05 &&
        Math.abs(state.targetRx - state.rx) < 0.05 &&
        Math.abs(state.targetRy - state.ry) < 0.05;

      state.raf = settled ? 0 : requestAnimationFrame(step);
    };

    const start = () => {
      if (!state.raf) state.raf = requestAnimationFrame(step);
    };

    const reset = () => {
      grid.classList.remove("has-active");
      card.classList.remove("is-active");
      state.targetTx = 0;
      state.targetTy = 0;
      state.targetRx = 0;
      state.targetRy = 0;
      start();
    };

    card.addEventListener("pointerenter", () => {
      grid.classList.add("has-active");
      card.classList.add("is-active");
    });

    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        state.targetTx = nx * STRENGTH;
        state.targetTy = ny * STRENGTH;
        state.targetRx = -ny * ROTATE;
        state.targetRy = nx * ROTATE;
        start();
      },
      { passive: true },
    );

    card.addEventListener("pointerleave", reset);
    card.addEventListener("blur", reset);
  });
}

function initIndexDesk() {
  const desk = document.querySelector(".index-desk");
  const folder = desk?.querySelector(".index-folder");
  const papers = desk?.querySelector("#index-papers");
  if (!desk || !folder || !papers) return;

  const setOpen = (open) => {
    desk.classList.toggle("is-open", open);
    folder.setAttribute("aria-expanded", String(open));
    folder.setAttribute("aria-label", open ? "收起作品目录" : "打开作品目录");
    papers.setAttribute("aria-hidden", String(!open));
    papers.inert = !open;
    folder.dataset.cursor = open ? "CLOSE" : "OPEN";
    const cursor = document.querySelector(".cursor");
    if (cursor?.classList.contains("is-active")) {
      cursor.querySelector("span").textContent = folder.dataset.cursor;
    }
  };

  setOpen(false);

  folder.addEventListener("click", () => {
    setOpen(folder.getAttribute("aria-expanded") !== "true");
  });

  papers.querySelector("[data-index-archive]")?.addEventListener("click", () => {
    setOpen(false);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !desk.classList.contains("is-open")) return;
    if (document.body.classList.contains("case-open")) return;
    setOpen(false);
    folder.focus({ preventScroll: true });
  });
}

function initCaseStudy() {
  const overlay = document.querySelector(".case-study");
  if (!overlay) return;

  const scroll = overlay.querySelector("[data-case-scroll]");
  const heroMedia = overlay.querySelector(".case-hero-media");
  const heroCanvas = overlay.querySelector("#case-canvas");
  const frameCanvases = [...overlay.querySelectorAll("[data-case-frame]")];
  const nextCanvas = overlay.querySelector("#case-next-canvas");
  const nextLink = overlay.querySelector("[data-case-next]");
  if (!scroll || !heroMedia || !heroCanvas || !nextCanvas || !nextLink) return;

  const els = {
    titleA: overlay.querySelector("#case-title-a"),
    titleB: overlay.querySelector("#case-title-b"),
    year: overlay.querySelector("#case-year"),
    heroYear: overlay.querySelector("#case-hero-year"),
    artLabel: overlay.querySelector("#case-art-label"),
    kicker: overlay.querySelector("#case-kicker"),
    lede: overlay.querySelector("#case-lede"),
    conceptTitle: overlay.querySelector("#case-concept-title"),
    para1: overlay.querySelector("#case-para-1"),
    para2: overlay.querySelector("#case-para-2"),
    quote: overlay.querySelector("#case-quote"),
    factYear: overlay.querySelector("#case-fact-year"),
    factRole: overlay.querySelector("#case-fact-role"),
    factClient: overlay.querySelector("#case-fact-client"),
    factScope: overlay.querySelector("#case-fact-scope"),
    factTools: overlay.querySelector("#case-fact-tools"),
    tags: overlay.querySelector("#case-tags"),
    progress: overlay.querySelector("#case-progress"),
    nextTitle: overlay.querySelector("#case-next-title"),
    nextMeta: overlay.querySelector("#case-next-meta"),
  };
  if (Object.values(els).some((element) => !element)) return;

  let activeId = null;
  let lastTrigger = null;
  let closeTimer = 0;
  let switchTimer = 0;
  let resizeFrame = 0;

  const pad = (value) => String(value).padStart(2, "0");
  const indexOf = (id) => PROJECT_ORDER.indexOf(id);
  const writeHistory = (mode, state, url) => {
    try {
      history[`${mode}State`](state, "", url);
    } catch {
      // file:// 预览等环境下不支持 history state，忽略即可
    }
  };

  const paint = () => {
    if (!PROJECT_DETAILS[activeId]) return;
    workPainters[activeId]?.(heroCanvas);
    frameCanvases.forEach((canvas) => workPainters[activeId]?.(canvas));
    const nextId = PROJECT_ORDER[(indexOf(activeId) + 1) % PROJECT_ORDER.length];
    nextCanvas.dataset.art = nextId;
    workPainters[nextId]?.(nextCanvas);
  };

  const render = (id) => {
    const detail = PROJECT_DETAILS[id];
    if (!detail) return;

    activeId = id;
    overlay.dataset.art = id;

    els.titleA.textContent = detail.title[0];
    els.titleB.textContent = detail.title[1];
    els.year.textContent = detail.year;
    els.heroYear.textContent = detail.year;
    els.artLabel.textContent = `${detail.discipline} / ${pad(indexOf(id) + 1)}`;
    els.kicker.textContent = detail.kicker;
    els.lede.textContent = detail.lede;
    els.conceptTitle.textContent = detail.concept;
    els.para1.textContent = detail.paragraphs[0];
    els.para2.textContent = detail.paragraphs[1];
    els.quote.textContent = `“${detail.quote}”`;
    els.factYear.textContent = detail.year;
    els.factRole.textContent = detail.role;
    els.factClient.textContent = detail.client;
    els.factScope.textContent = detail.tags.slice(0, 3).join(" / ");
    els.factTools.textContent = detail.tools;
    els.progress.textContent = `${pad(indexOf(id) + 1)} / ${pad(PROJECT_ORDER.length)}`;
    els.tags.replaceChildren(
      ...detail.tags.map((tag) => {
        const item = document.createElement("span");
        item.textContent = tag;
        return item;
      }),
    );

    frameCanvases.forEach((canvas, index) => {
      canvas.dataset.art = id;
      const figure = canvas.closest(".case-frame");
      figure.querySelector("[data-case-frame-caption]").textContent = detail.frames[index][0];
      figure.querySelector("[data-case-frame-note]").textContent = detail.frames[index][1];
    });

    const nextId = PROJECT_ORDER[(indexOf(id) + 1) % PROJECT_ORDER.length];
    const nextDetail = PROJECT_DETAILS[nextId];
    els.nextTitle.textContent = "";
    nextDetail.title.forEach((line, index) => {
      if (index) els.nextTitle.appendChild(document.createElement("br"));
      els.nextTitle.appendChild(document.createTextNode(line));
    });
    els.nextMeta.textContent = `${nextDetail.year} / ${nextDetail.discipline}`;
    nextCanvas.dataset.art = nextId;
    nextLink.setAttribute("aria-label", `查看下一个项目 ${nextDetail.title.join(" ")}`);
  };

  const clearFlip = () => {
    overlay.classList.remove("is-arriving");
    document.querySelectorAll(".case-flip").forEach((node) => node.remove());
  };

  const flipFrom = (trigger) => {
    const source = trigger.querySelector(".fan-canvas, .project-canvas");
    const media =
      trigger.querySelector(".fan-card-inner") ||
      trigger.querySelector(".project-media") ||
      trigger.querySelector(".index-paper-media");
    if (!source || !media || !source.width || !source.height) return;

    const from = media.getBoundingClientRect();
    const to = heroMedia.getBoundingClientRect();
    if (from.width < 8 || from.height < 8 || to.width < 8 || to.height < 8) return;

    const radius = getComputedStyle(media).borderRadius;
    const holder = document.createElement("div");
    holder.className = "case-flip";
    holder.style.left = `${to.left}px`;
    holder.style.top = `${to.top}px`;
    holder.style.width = `${to.width}px`;
    holder.style.height = `${to.height}px`;
    holder.style.borderRadius = radius;

    const snapshot = document.createElement("canvas");
    snapshot.width = source.width;
    snapshot.height = source.height;
    snapshot.getContext("2d").drawImage(source, 0, 0);
    holder.appendChild(snapshot);
    document.body.appendChild(holder);

    const scaleX = from.width / to.width;
    const scaleY = from.height / to.height;
    const offsetX = from.left - to.left;
    const offsetY = from.top - to.top;
    const duration = 820;
    const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

    overlay.classList.add("is-arriving");

    const flight = snapshot.animate(
      [
        {
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
        },
        { transform: "translate(0px, 0px) scale(1, 1)" },
      ],
      { duration, easing, fill: "both" },
    );

    holder.animate([{ borderRadius: radius }, { borderRadius: "0px" }], {
      duration,
      easing,
      fill: "both",
    });

    flight.onfinish = () => {
      overlay.classList.remove("is-arriving");
      const fade = holder.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        easing: "linear",
        fill: "both",
      });
      fade.onfinish = () => holder.remove();
    };
  };

  const open = (id, trigger, options = {}) => {
    if (!PROJECT_DETAILS[id]) return;
    const { push = true, focus = true } = options;
    window.clearTimeout(closeTimer);
    lastTrigger = trigger || lastTrigger;

    if (!overlay.classList.contains("is-open")) {
      document.body.classList.add("case-open");
      overlay.setAttribute("aria-hidden", "false");
      overlay.classList.remove("is-arriving");
      render(id);
      scroll.scrollTop = 0;
      overlay.classList.add("is-open");
      document.querySelector(".cursor")?.classList.remove("is-active");

      window.requestAnimationFrame(() => {
        paint();
        if (trigger && !reducedMotion) flipFrom(trigger);
      });

      if (push) writeHistory("push", { case: id }, `#work/${id}`);
    } else {
      render(id);
      paint();
    }

    if (focus) {
      window.setTimeout(() => overlay.focus({ preventScroll: true }), reducedMotion ? 0 : 140);
    }
  };

  const close = (options = {}) => {
    if (!overlay.classList.contains("is-open")) return;
    const { restore = true, updateHistory = true } = options;
    const closedId = activeId;

    overlay.classList.remove("is-open", "is-switching");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("case-open");
    if (overlay.contains(document.activeElement)) document.activeElement.blur();
    clearFlip();
    window.clearTimeout(switchTimer);
    window.clearTimeout(closeTimer);

    if (updateHistory) {
      writeHistory("replace", null, `${window.location.pathname}${window.location.search}`);
    }

    closeTimer = window.setTimeout(() => {
      if (!restore || overlay.classList.contains("is-open")) return;
      const fallback = `.fan-card[data-art="${closedId}"]:not([aria-hidden="true"]), .project[data-art="${closedId}"] .project-link`;
      const target =
        lastTrigger && !lastTrigger.closest('[aria-hidden="true"]')
          ? lastTrigger
          : document.querySelector(fallback);
      target?.focus({ preventScroll: true });
      lastTrigger = null;
    }, reducedMotion ? 0 : 900);
  };

  const switchTo = (id) => {
    if (!PROJECT_DETAILS[id] || id === activeId) return;
    if (overlay.classList.contains("is-switching")) return;
    lastTrigger = null;
    clearFlip();

    if (reducedMotion) {
      render(id);
      paint();
      scroll.scrollTop = 0;
      writeHistory("replace", { case: id }, `#work/${id}`);
      return;
    }

    overlay.classList.add("is-switching");
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => {
      render(id);
      paint();
      scroll.scrollTop = 0;
      writeHistory("replace", { case: id }, `#work/${id}`);
      window.requestAnimationFrame(() => overlay.classList.remove("is-switching"));
    }, 280);
  };

  const step = (delta) => {
    if (!activeId) return;
    const nextIndex = (indexOf(activeId) + delta + PROJECT_ORDER.length) % PROJECT_ORDER.length;
    switchTo(PROJECT_ORDER[nextIndex]);
  };

  document.querySelectorAll("[data-project-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const card = link.closest("[data-art]");
      if (card?.dataset.art) open(card.dataset.art, link);
    });
  });

  overlay.querySelectorAll("[data-case-close]").forEach((button) => {
    button.addEventListener("click", () => close());
  });

  nextLink.addEventListener("click", (event) => {
    event.preventDefault();
    step(1);
  });

  overlay.querySelector("[data-case-top]").addEventListener("click", () => {
    scroll.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  window.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "ArrowRight") {
      step(1);
      return;
    }

    if (event.key === "ArrowLeft") {
      step(-1);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [...overlay.querySelectorAll("button, a[href]")].filter(
      (element) => !element.hasAttribute("disabled") && element.getClientRects().length,
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (!overlay.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (!overlay.classList.contains("is-open")) return;
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(paint);
  });

  const idFromHash = () => {
    const match = window.location.hash.match(/^#work\/([\w-]+)$/);
    return match && PROJECT_DETAILS[match[1]] ? match[1] : null;
  };

  window.addEventListener("popstate", () => {
    const id = idFromHash();
    if (id) {
      if (overlay.classList.contains("is-open")) {
        lastTrigger = null;
        render(id);
        paint();
        scroll.scrollTop = 0;
      } else {
        open(id, null, { push: false });
      }
    } else if (overlay.classList.contains("is-open")) {
      close({ updateHistory: false });
    }
  });

  const deepLink = idFromHash();
  if (deepLink) open(deepLink, null, { push: false });
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

function initClickSpark() {
  if (reducedMotion) return;

  const canvas = document.querySelector(".click-spark");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const options = {
    sparkColor:
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff5b2e",
    sparkSize: 10,
    sparkRadius: 15,
    sparkCount: 8,
    duration: 400,
    extraScale: 1,
  };
  const sparks = [];
  let ratio = 1;
  let rafId = 0;

  const resize = () => {
    const { width, height, ratio: nextRatio } = fitCanvas(canvas);
    ratio = nextRatio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width / ratio, height / ratio);
  };

  const easeOut = (t) => t * (2 - t);

  const draw = (timestamp) => {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= options.duration) {
        sparks.splice(i, 1);
        continue;
      }

      const eased = easeOut(elapsed / options.duration);
      const distance = eased * options.sparkRadius * options.extraScale;
      const lineLength = options.sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      ctx.strokeStyle = options.sparkColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    rafId = sparks.length ? window.requestAnimationFrame(draw) : 0;
  };

  window.addEventListener("click", (event) => {
    const now = performance.now();
    for (let i = 0; i < options.sparkCount; i += 1) {
      sparks.push({
        x: event.clientX,
        y: event.clientY,
        angle: (2 * Math.PI * i) / options.sparkCount,
        startTime: now,
      });
    }
    if (!rafId) rafId = window.requestAnimationFrame(draw);
  });

  window.addEventListener("resize", resize);
  resize();
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
initClickSpark();
initHeroMotion();
initMagneticElements();
initFeaturedShowcase();
initSpinShutter();
initProjectTilt();
initSignalCards();
initIndexDesk();
initCaseStudy();
initReveals();
initScrollProgress();
initHeaderTheme();
initClock();
