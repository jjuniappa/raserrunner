(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const ui = {
    time: document.getElementById("time"),
    score: document.getElementById("score"),
    best: document.getElementById("best"),
    startPanel: document.getElementById("start-panel"),
    gameOverPanel: document.getElementById("game-over-panel"),
    pausePanel: document.getElementById("pause-panel"),
    finalTime: document.getElementById("final-time"),
    finalScore: document.getElementById("final-score"),
    start: document.getElementById("start"),
    restart: document.getElementById("restart"),
    pause: document.getElementById("pause"),
    resume: document.getElementById("resume"),
    jump: document.getElementById("jump"),
    slide: document.getElementById("slide")
  };

  const CONFIG = {
    startSpeed: 0.34,
    acceleration: 0.010,
    maxSpeed: 0.95,
    startSpawnInterval: 1.85,
    minimumSpawnInterval: 0.68,
    spawnIntervalDecrease: 0.014,
    jumpDuration: 0.72,
    jumpHeight: 0.20,
    slideDuration: 0.66,
    collisionWindow: 0.058,
    swipeThresholdRatio: 0.075,
    maxSwipeTime: 650
  };

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    elapsed: 0,
    score: 0,
    best: Number(localStorage.getItem("laserRunnerBest") || 0),
    spawnTimer: 0,
    lastTime: 0,
    roadOffset: 0,
    lasers: [],
    player: {
      mode: "run",
      actionTime: 0
    }
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let swipeStart = null;

  ui.best.textContent = state.best.toLocaleString("ko-KR");

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, window.innerWidth);
    height = Math.max(320, window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resetGame() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    state.elapsed = 0;
    state.score = 0;
    state.spawnTimer = 0.9;
    state.roadOffset = 0;
    state.lasers.length = 0;
    state.player.mode = "run";
    state.player.actionTime = 0;
    state.lastTime = performance.now();
    ui.gameOverPanel.classList.add("hidden");
    ui.pausePanel.classList.add("hidden");
    ui.startPanel.classList.add("hidden");
    ui.pause.textContent = "Ⅱ";
  }

  function startGame() {
    resetGame();
    requestAnimationFrame(loop);
  }

  function endGame() {
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

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 120]);
    }
  }

  function togglePause(force) {
    if (!state.running || state.gameOver) return;
    state.paused = typeof force === "boolean" ? force : !state.paused;
    ui.pausePanel.classList.toggle("hidden", !state.paused);
    ui.pause.textContent = state.paused ? "▶" : "Ⅱ";
    state.lastTime = performance.now();
  }

  function jump() {
    if (!state.running || state.paused || state.gameOver) return;
    if (state.player.mode !== "run") return;
    state.player.mode = "jump";
    state.player.actionTime = 0;
  }

  function slide() {
    if (!state.running || state.paused || state.gameOver) return;
    if (state.player.mode !== "run") return;
    state.player.mode = "slide";
    state.player.actionTime = 0;
  }

  function spawnLaser() {
    state.lasers.push({
      type: Math.random() < 0.5 ? "low" : "high",
      progress: 0,
      checked: false
    });
  }

  function update(dt) {
    state.elapsed += dt;
    state.score = Math.floor(state.elapsed * 100);

    const speed = Math.min(
      CONFIG.startSpeed + state.elapsed * CONFIG.acceleration,
      CONFIG.maxSpeed
    );

    state.roadOffset = (state.roadOffset + speed * dt) % 1;

    const spawnInterval = Math.max(
      CONFIG.startSpawnInterval - state.elapsed * CONFIG.spawnIntervalDecrease,
      CONFIG.minimumSpawnInterval
    );

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnLaser();
      state.spawnTimer += spawnInterval;
    }

    if (state.player.mode !== "run") {
      state.player.actionTime += dt;
      const duration = state.player.mode === "jump"
        ? CONFIG.jumpDuration
        : CONFIG.slideDuration;

      if (state.player.actionTime >= duration) {
        state.player.mode = "run";
        state.player.actionTime = 0;
      }
    }

    for (const laser of state.lasers) {
      laser.progress += speed * dt;

      const distance = Math.abs(laser.progress - 0.87);
      if (!laser.checked && distance <= CONFIG.collisionWindow) {
        laser.checked = true;
        const avoided =
          (laser.type === "low" && state.player.mode === "jump") ||
          (laser.type === "high" && state.player.mode === "slide");

        if (!avoided) {
          endGame();
          return;
        }
      }
    }

    state.lasers = state.lasers.filter(laser => laser.progress < 1.18);

    ui.time.textContent = state.elapsed.toFixed(2).padStart(5, "0");
    ui.score.textContent = state.score.toLocaleString("ko-KR");
  }

  function perspectivePoint(progress) {
    const horizonY = height * 0.25;
    const nearY = height * 0.95;
    const p = Math.max(0, Math.min(1.2, progress));
    const eased = p * p;
    return {
      y: horizonY + (nearY - horizonY) * eased,
      scale: 0.10 + eased * 1.15
    };
  }

  function drawRoad() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const horizonY = height * 0.25;
    const cx = width * 0.5;
    const farHalf = width * 0.10;
    const nearHalf = width * 0.47;

    ctx.fillStyle = "#f5f5f5";
    ctx.beginPath();
    ctx.moveTo(cx - farHalf, horizonY);
    ctx.lineTo(cx + farHalf, horizonY);
    ctx.lineTo(cx + nearHalf, height);
    ctx.lineTo(cx - nearHalf, height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;

    for (let i = 0; i < 16; i++) {
      const p = ((i / 16 + state.roadOffset) % 1);
      const a = perspectivePoint(p);
      const roadHalf = farHalf + (nearHalf - farHalf) * p * p;
      ctx.beginPath();
      ctx.moveTo(cx - roadHalf, a.y);
      ctx.lineTo(cx + roadHalf, a.y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * farHalf * 1.35, horizonY);
      ctx.lineTo(cx + side * nearHalf * 1.08, height);
      ctx.stroke();
    }

    for (let i = 0; i < 9; i++) {
      const p = i / 8;
      const a = perspectivePoint(p);
      const half = farHalf * 1.35 + (nearHalf * 1.08 - farHalf * 1.35) * p * p;
      const postHeight = 10 + 48 * p * p;
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 2;
      for (const side of [-1, 1]) {
        const x = cx + side * half;
        ctx.beginPath();
        ctx.moveTo(x, a.y);
        ctx.lineTo(x, a.y - postHeight);
        ctx.stroke();
      }
    }
  }

  function drawLasers() {
    const cx = width * 0.5;
    for (const laser of state.lasers) {
      const p = perspectivePoint(laser.progress);
      const roadWidth = width * (0.18 + 0.78 * Math.min(1, laser.progress) ** 2);
      // low: 발목/바닥 높이 → 점프
      // high: 가슴/머리 높이 → 슬라이딩
      const lowOffset = 6 + 9 * p.scale;
      const highOffset = 55 + 105 * p.scale;
      const laserY = p.y - (laser.type === "high" ? highOffset : lowOffset);

      ctx.save();
      ctx.shadowColor = "rgba(255,0,0,.75)";
      ctx.shadowBlur = Math.max(5, 17 * p.scale);
      ctx.strokeStyle = "#ff1010";
      ctx.lineWidth = Math.max(4, 9 * p.scale);
      ctx.beginPath();
      ctx.moveTo(cx + roadWidth * 0.5, laserY);
      ctx.lineTo(cx - roadWidth * 0.5, laserY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#111";
      const machineSize = Math.max(6, 15 * p.scale);
      ctx.fillRect(cx - roadWidth * 0.5 - machineSize, laserY - machineSize / 2, machineSize, machineSize);
      ctx.fillRect(cx + roadWidth * 0.5, laserY - machineSize / 2, machineSize, machineSize);

      if (laser.progress > 0.35 && laser.progress < 0.82) {
        ctx.save();
        ctx.font = `900 ${Math.max(11, 14 * p.scale)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#111";
        ctx.fillText(
          laser.type === "high" ? "SLIDE" : "JUMP",
          cx,
          laserY - Math.max(12, 20 * p.scale)
        );
        ctx.restore();
      }
    }
  }

  function drawPlayer() {
    const baseX = width * 0.5;
    const baseY = height * 0.79;
    let yOffset = 0;
    let bodyHeight = Math.min(120, height * 0.16);
    let bodyWidth = bodyHeight * 0.48;

    if (state.player.mode === "jump") {
      const t = state.player.actionTime / CONFIG.jumpDuration;
      yOffset = -Math.sin(Math.PI * t) * height * CONFIG.jumpHeight;
    } else if (state.player.mode === "slide") {
      bodyHeight *= 0.42;
      bodyWidth *= 1.55;
    }

    const x = baseX - bodyWidth / 2;
    const y = baseY - bodyHeight + yOffset;

    ctx.fillStyle = "rgba(0,0,0,.16)";
    ctx.beginPath();
    ctx.ellipse(baseX, baseY + 8, bodyWidth * 0.75, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, bodyWidth, bodyHeight);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, bodyWidth - 2, bodyHeight - 2);
  }

  function drawInstructions() {
    if (!state.running && !state.gameOver) return;
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.font = "700 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText("↑ JUMP     ↓ SLIDE", width * 0.5, height * 0.89);
  }

  function draw() {
    drawRoad();
    drawLasers();
    drawPlayer();
    drawInstructions();
  }

  function loop(now) {
    if (!state.running) {
      draw();
      return;
    }

    const dt = Math.min(0.033, Math.max(0, (now - state.lastTime) / 1000));
    state.lastTime = now;

    if (!state.paused) {
      update(dt);
      draw();
    }

    if (state.running) {
      requestAnimationFrame(loop);
    }
  }

  function onPointerDown(event) {
    if (event.target.closest("button")) return;
    swipeStart = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now()
    };
  }

  function onPointerUp(event) {
    if (!swipeStart || event.target.closest("button")) {
      swipeStart = null;
      return;
    }

    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    const elapsed = performance.now() - swipeStart.time;
    const threshold = height * CONFIG.swipeThresholdRatio;

    if (
      elapsed <= CONFIG.maxSwipeTime &&
      Math.abs(dy) >= threshold &&
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
    if (document.hidden && state.running && !state.gameOver) {
      togglePause(true);
    }
  });

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", () => { swipeStart = null; });

  ui.start.addEventListener("click", startGame);
  ui.restart.addEventListener("click", startGame);
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

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }

  resize();
  draw();
})();
