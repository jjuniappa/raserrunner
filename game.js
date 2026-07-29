(() => {
  "use strict";

  const VIRTUAL_W = 1080;
  const VIRTUAL_H = 1920;

  const CONFIG = {
    walkwayFps: 9,
    runFps: 11,
    jumpFps: 8,
    slideFps: 9,

    playerGroundY: 1710,
    playerRunScale: 2.25,
    playerJumpScale: 2.05,
    playerSlideScale: 2.05,

    jumpDuration: 0.78,
    jumpHeight: 360,
    slideDuration: 0.72,

    obstacleStartSpeed: 0.20,
    obstacleAcceleration: 0.0065,
    obstacleMaxSpeed: 0.56,

    spawnStart: 2.05,
    spawnMin: 0.82,
    spawnDecrease: 0.012,

    collisionProgress: 0.91,
    collisionWindow: 0.055,

    swipeThreshold: 90,
    swipeMaxMs: 650
  };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const ui = {
    time: document.getElementById("time"),
    score: document.getElementById("score"),
    best: document.getElementById("best"),
    startPanel: document.getElementById("start-panel"),
    gameOverPanel: document.getElementById("game-over-panel"),
    pausePanel: document.getElementById("pause-panel"),
    loading: document.getElementById("loading"),
    finalTime: document.getElementById("final-time"),
    finalScore: document.getElementById("final-score"),
    start: document.getElementById("start"),
    restart: document.getElementById("restart"),
    pause: document.getElementById("pause"),
    resume: document.getElementById("resume"),
    jump: document.getElementById("jump"),
    slide: document.getElementById("slide")
  };

  const assetPaths = {
    bg: "assets/bg/bg.png",
    movingwalk: [
      "assets/movingwalk/movingwalk01.png",
      "assets/movingwalk/movingwalk02.png",
      "assets/movingwalk/movingwalk03.png"
    ],
    run: [
      "assets/character/run/run01.png",
      "assets/character/run/run02.png",
      "assets/character/run/run03.png",
      "assets/character/run/run04.png"
    ],
    jump: [
      "assets/character/jump/jump01.png",
      "assets/character/jump/jump02.png",
      "assets/character/jump/jump03.png",
      "assets/character/jump/jump04.png"
    ],
    slide: [
      "assets/character/sliding/sliding01.png",
      "assets/character/sliding/sliding02.png",
      "assets/character/sliding/sliding03.png",
      "assets/character/sliding/sliding04.png"
    ],
    gunLeft: "assets/lasergun/lasergunleft.png",
    gunRight: "assets/lasergun/lasergunright.png"
  };

  const assets = {};
  const state = {
    ready: false,
    running: false,
    paused: false,
    gameOver: false,
    elapsed: 0,
    score: 0,
    best: Number(localStorage.getItem("laserRunnerBest") || 0),
    lastTime: 0,
    spawnTimer: 0,
    walkwayTime: 0,
    player: {
      action: "run",
      actionTime: 0,
      animTime: 0
    },
    obstacles: []
  };

  let screenW = 0;
  let screenH = 0;
  let dpr = 1;
  let fitScale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let swipeStart = null;

  ui.best.textContent = state.best.toLocaleString("ko-KR");

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`이미지 로드 실패: ${path}`));
      image.src = path;
    });
  }

  async function loadAssets() {
    assets.bg = await loadImage(assetPaths.bg);
    assets.movingwalk = await Promise.all(assetPaths.movingwalk.map(loadImage));
    assets.run = await Promise.all(assetPaths.run.map(loadImage));
    assets.jump = await Promise.all(assetPaths.jump.map(loadImage));
    assets.slide = await Promise.all(assetPaths.slide.map(loadImage));
    assets.gunLeft = await loadImage(assetPaths.gunLeft);
    assets.gunRight = await loadImage(assetPaths.gunRight);
    state.ready = true;
    ui.loading.classList.add("hidden");
    draw();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    screenW = Math.max(320, window.innerWidth);
    screenH = Math.max(420, window.innerHeight);

    canvas.width = Math.floor(screenW * dpr);
    canvas.height = Math.floor(screenH * dpr);
    canvas.style.width = `${screenW}px`;
    canvas.style.height = `${screenH}px`;

    fitScale = Math.max(screenW / VIRTUAL_W, screenH / VIRTUAL_H);
    offsetX = (screenW - VIRTUAL_W * fitScale) * 0.5;
    offsetY = (screenH - VIRTUAL_H * fitScale) * 0.5;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function beginVirtualDraw() {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(fitScale, fitScale);
  }

  function endVirtualDraw() {
    ctx.restore();
  }

  function resetGame() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    state.elapsed = 0;
    state.score = 0;
    state.spawnTimer = 1.25;
    state.walkwayTime = 0;
    state.player.action = "run";
    state.player.actionTime = 0;
    state.player.animTime = 0;
    state.obstacles.length = 0;
    state.lastTime = performance.now();

    ui.startPanel.classList.add("hidden");
    ui.gameOverPanel.classList.add("hidden");
    ui.pausePanel.classList.add("hidden");
    ui.pause.textContent = "Ⅱ";

    requestAnimationFrame(loop);
  }

  function gameOver() {
    if (state.gameOver) return;

    state.running = false;
    state.gameOver = true;
    state.score = Math.floor(state.elapsed * 100);

    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem("laserRunnerBest", String(state.best));
      ui.best.textContent = state.best.toLocaleString("ko-KR");
    }

    ui.finalTime.textContent = state.elapsed.toFixed(2);
    ui.finalScore.textContent = state.score.toLocaleString("ko-KR");
    ui.gameOverPanel.classList.remove("hidden");

    if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
  }

  function togglePause(force) {
    if (!state.running || state.gameOver) return;
    state.paused = typeof force === "boolean" ? force : !state.paused;
    ui.pausePanel.classList.toggle("hidden", !state.paused);
    ui.pause.textContent = state.paused ? "▶" : "Ⅱ";
    state.lastTime = performance.now();
  }

  function jump() {
    if (!state.running || state.paused || state.player.action !== "run") return;
    state.player.action = "jump";
    state.player.actionTime = 0;
    state.player.animTime = 0;
  }

  function slide() {
    if (!state.running || state.paused || state.player.action !== "run") return;
    state.player.action = "slide";
    state.player.actionTime = 0;
    state.player.animTime = 0;
  }

  function spawnObstacle() {
    state.obstacles.push({
      type: Math.random() < 0.5 ? "low" : "high",
      progress: 0,
      checked: false
    });
  }

  function perspective(progress) {
    const p = Math.max(0, Math.min(1.12, progress));
    const eased = p * p;
    return {
      p,
      eased,
      y: 470 + eased * 1275,
      scale: 0.12 + eased * 1.02,
      leftX: 476 - eased * 410,
      rightX: 604 + eased * 410
    };
  }

  function getPlayerVisual() {
    let frames;
    let scale;
    let frameIndex;
    let yOffset = 0;

    if (state.player.action === "jump") {
      frames = assets.jump;
      scale = CONFIG.playerJumpScale;
      const t = Math.min(1, state.player.actionTime / CONFIG.jumpDuration);
      frameIndex = Math.min(3, Math.floor(t * 4));
      yOffset = -Math.sin(Math.PI * t) * CONFIG.jumpHeight;
    } else if (state.player.action === "slide") {
      frames = assets.slide;
      scale = CONFIG.playerSlideScale;
      const t = Math.min(1, state.player.actionTime / CONFIG.slideDuration);
      frameIndex = Math.min(3, Math.floor(t * 4));
    } else {
      frames = assets.run;
      scale = CONFIG.playerRunScale;
      frameIndex = Math.floor(state.player.animTime * CONFIG.runFps) % frames.length;
    }

    const image = frames[frameIndex];
    const width = image.width * scale;
    const height = image.height * scale;

    return {
      image,
      x: VIRTUAL_W * 0.5 - width * 0.5,
      y: CONFIG.playerGroundY - height + yOffset,
      width,
      height
    };
  }

  function getPlayerHitbox() {
    const r = getPlayerVisual();
    const padX = r.width * 0.18;
    const padTop = r.height * 0.08;
    const padBottom = r.height * 0.04;
    return {
      x: r.x + padX,
      y: r.y + padTop,
      width: r.width - padX * 2,
      height: r.height - padTop - padBottom
    };
  }

  function getObstacleGeometry(obstacle) {
    const g = perspective(obstacle.progress);
    const gunW = assets.gunLeft.width * g.scale;
    const gunH = assets.gunLeft.height * g.scale;

    // 낮은 빔은 다리 높이, 높은 빔은 상체 높이.
    const beamY = obstacle.type === "low"
      ? g.y - 28 * g.scale
      : g.y - 205 * g.scale;

    return {
      ...g,
      gunW,
      gunH,
      beamY,
      beamThickness: Math.max(5, 13 * g.scale)
    };
  }

  function getLaserHitbox(obstacle) {
    const g = getObstacleGeometry(obstacle);
    return {
      x: g.leftX + g.gunW * 0.36,
      y: g.beamY - g.beamThickness * 0.5,
      width: Math.max(1, g.rightX - g.leftX - g.gunW * 0.72),
      height: g.beamThickness
    };
  }

  function overlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function update(dt) {
    state.elapsed += dt;
    state.score = Math.floor(state.elapsed * 100);
    state.walkwayTime += dt;
    state.player.animTime += dt;

    if (state.player.action !== "run") {
      state.player.actionTime += dt;
      const duration = state.player.action === "jump"
        ? CONFIG.jumpDuration
        : CONFIG.slideDuration;

      if (state.player.actionTime >= duration) {
        state.player.action = "run";
        state.player.actionTime = 0;
        state.player.animTime = 0;
      }
    }

    const speed = Math.min(
      CONFIG.obstacleStartSpeed + state.elapsed * CONFIG.obstacleAcceleration,
      CONFIG.obstacleMaxSpeed
    );

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnObstacle();
      const interval = Math.max(
        CONFIG.spawnStart - state.elapsed * CONFIG.spawnDecrease,
        CONFIG.spawnMin
      );
      state.spawnTimer += interval;
    }

    const playerHitbox = getPlayerHitbox();

    for (const obstacle of state.obstacles) {
      obstacle.progress += speed * dt;

      const distance = Math.abs(obstacle.progress - CONFIG.collisionProgress);
      if (!obstacle.checked && distance <= CONFIG.collisionWindow) {
        if (overlap(playerHitbox, getLaserHitbox(obstacle))) {
          obstacle.checked = true;
          gameOver();
          return;
        }

        if (obstacle.progress > CONFIG.collisionProgress + CONFIG.collisionWindow * 0.7) {
          obstacle.checked = true;
        }
      }
    }

    state.obstacles = state.obstacles.filter(o => o.progress < 1.12);

    ui.time.textContent = state.elapsed.toFixed(2).padStart(5, "0");
    ui.score.textContent = state.score.toLocaleString("ko-KR");
  }

  function drawBackground() {
    ctx.drawImage(assets.bg, 0, 0, VIRTUAL_W, VIRTUAL_H);
  }

  function drawMovingWalkway() {
    const index = Math.floor(state.walkwayTime * CONFIG.walkwayFps) % assets.movingwalk.length;
    const image = assets.movingwalk[index];

    // 업로드 에셋의 원본 원근 구도를 유지해 중앙에 배치.
    const x = (VIRTUAL_W - image.width) * 0.5;
    const y = 0;
    ctx.drawImage(image, x, y);
  }

  function drawObstacle(obstacle) {
    const g = getObstacleGeometry(obstacle);

    const leftGunX = g.leftX - g.gunW * 0.52;
    const rightGunX = g.rightX - g.gunW * 0.48;
    const gunY = g.beamY - g.gunH * 0.5;

    ctx.drawImage(assets.gunLeft, leftGunX, gunY, g.gunW, g.gunH);
    ctx.drawImage(assets.gunRight, rightGunX, gunY, g.gunW, g.gunH);

    const beamStartX = g.leftX + g.gunW * 0.32;
    const beamEndX = g.rightX - g.gunW * 0.32;

    ctx.save();
    ctx.shadowColor = "rgba(255, 20, 20, .95)";
    ctx.shadowBlur = Math.max(10, 34 * g.scale);

    ctx.strokeStyle = "rgba(255, 40, 40, .38)";
    ctx.lineWidth = g.beamThickness * 2.4;
    ctx.beginPath();
    ctx.moveTo(beamStartX, g.beamY);
    ctx.lineTo(beamEndX, g.beamY);
    ctx.stroke();

    ctx.strokeStyle = "#ff1515";
    ctx.lineWidth = g.beamThickness;
    ctx.beginPath();
    ctx.moveTo(beamStartX, g.beamY);
    ctx.lineTo(beamEndX, g.beamY);
    ctx.stroke();

    ctx.strokeStyle = "#fff3f3";
    ctx.lineWidth = Math.max(1.5, g.beamThickness * 0.22);
    ctx.beginPath();
    ctx.moveTo(beamStartX, g.beamY);
    ctx.lineTo(beamEndX, g.beamY);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer() {
    const r = getPlayerVisual();

    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      VIRTUAL_W * 0.5,
      CONFIG.playerGroundY + 18,
      Math.max(72, r.width * 0.38),
      24,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    ctx.drawImage(r.image, r.x, r.y, r.width, r.height);
  }

  function draw() {
    if (!state.ready) {
      ctx.fillStyle = "#050b13";
      ctx.fillRect(0, 0, screenW, screenH);
      return;
    }

    ctx.fillStyle = "#050b13";
    ctx.fillRect(0, 0, screenW, screenH);

    beginVirtualDraw();
    drawBackground();
    drawMovingWalkway();

    // 먼 장애물부터 먼저 그려 원근 겹침 순서를 유지.
    const sorted = [...state.obstacles].sort((a, b) => a.progress - b.progress);
    for (const obstacle of sorted) drawObstacle(obstacle);

    drawPlayer();
    endVirtualDraw();
  }

  function loop(now) {
    if (!state.running) {
      draw();
      return;
    }

    const dt = Math.min(0.034, Math.max(0, (now - state.lastTime) / 1000));
    state.lastTime = now;

    if (!state.paused) update(dt);
    draw();

    if (state.running) requestAnimationFrame(loop);
  }

  function pointerDown(event) {
    if (event.target.closest("button")) return;
    swipeStart = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now()
    };
  }

  function pointerUp(event) {
    if (!swipeStart || event.target.closest("button")) {
      swipeStart = null;
      return;
    }

    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    const elapsed = performance.now() - swipeStart.time;

    if (
      elapsed <= CONFIG.swipeMaxMs &&
      Math.abs(dy) >= CONFIG.swipeThreshold * fitScale &&
      Math.abs(dy) > Math.abs(dx)
    ) {
      if (dy < 0) jump();
      else slide();
    }

    swipeStart = null;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.running && !state.gameOver) togglePause(true);
  });

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", () => { swipeStart = null; });

  ui.start.addEventListener("click", resetGame);
  ui.restart.addEventListener("click", resetGame);
  ui.pause.addEventListener("click", () => togglePause());
  ui.resume.addEventListener("click", () => togglePause(false));

  ui.jump.addEventListener("pointerdown", event => {
    event.preventDefault();
    jump();
  });
  ui.slide.addEventListener("pointerdown", event => {
    event.preventDefault();
    slide();
  });

  window.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") jump();
    if (event.code === "ArrowDown" || event.code === "KeyS") slide();
    if (event.code === "Escape") togglePause();
  });

  resize();
  loadAssets().catch(error => {
    console.error(error);
    ui.loading.querySelector("p").textContent = "에셋을 불러오지 못했습니다.";
  });
})();
