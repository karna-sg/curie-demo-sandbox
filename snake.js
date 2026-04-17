// Classic-script browser entry point for the Snake game.
// Pure helpers are duplicated here so the page loads via file:// without
// requiring ESM imports (CORS-free). The ESM twin in ./snake-logic.mjs is
// consumed by tests/snake.test.mjs — keep the two in sync.
(function () {
  'use strict';

  // --- constants ---------------------------------------------------------
  var GRID_SIZE = 20;
  var CELL = 30; // CSS pixels per cell
  var SCALE = 2; // retina backing-store multiplier
  var TICK_MS = 120;
  var COLORS = {
    background: '#0e3b3b',
    grid: 'rgba(255, 255, 255, 0.04)',
    head: '#7dd3fc',
    body: '#38bdf8',
    food: '#ef4444',
    overlay: 'rgba(5, 20, 20, 0.72)',
    overlayText: '#e2f5f5',
  };
  var DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  // --- pure helpers (mirrors snake-logic.mjs) ----------------------------
  function nextHead(head, direction) {
    var d = DIRECTIONS[direction];
    return { x: head.x + d.x, y: head.y + d.y };
  }
  function willCollideWithSelf(body, newHead) {
    for (var i = 0; i < body.length; i += 1) {
      if (body[i].x === newHead.x && body[i].y === newHead.y) return true;
    }
    return false;
  }
  function willCollideWithWall(newHead, gridSize) {
    return (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= gridSize ||
      newHead.y >= gridSize
    );
  }
  function spawnFood(body, gridSize, rng) {
    var occupied = {};
    for (var i = 0; i < body.length; i += 1) {
      occupied[body[i].x + ',' + body[i].y] = true;
    }
    var free = [];
    for (var y = 0; y < gridSize; y += 1) {
      for (var x = 0; x < gridSize; x += 1) {
        if (!occupied[x + ',' + y]) free.push({ x: x, y: y });
      }
    }
    if (free.length === 0) return null;
    return free[Math.floor(rng() * free.length)];
  }
  function applyDirectionChange(current, requested) {
    var c = DIRECTIONS[current];
    var r = DIRECTIONS[requested];
    if (!r) return current;
    if (c.x + r.x === 0 && c.y + r.y === 0) return current;
    return requested;
  }
  function growSnake(body, newHead) {
    return [newHead].concat(body);
  }

  // --- state -------------------------------------------------------------
  var state = null;
  var highScore = 0;

  function initialState() {
    var mid = Math.floor(GRID_SIZE / 2);
    var body = [
      { x: mid + 1, y: mid },
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
    ];
    return {
      body: body,
      direction: 'right',
      pendingDirection: 'right',
      food: spawnFood(body, GRID_SIZE, Math.random),
      score: 0,
      paused: false,
      gameOver: false,
    };
  }

  // --- update ------------------------------------------------------------
  function tick() {
    if (state.paused || state.gameOver) return;
    state.direction = applyDirectionChange(state.direction, state.pendingDirection);
    var head = nextHead(state.body[0], state.direction);
    if (willCollideWithWall(head, GRID_SIZE)) {
      state.gameOver = true;
      return;
    }
    // Eating extends the snake; otherwise we drop the tail.
    var eating = state.food && head.x === state.food.x && head.y === state.food.y;
    var nextBody = eating ? growSnake(state.body, head) : [head].concat(state.body.slice(0, -1));
    if (willCollideWithSelf(nextBody.slice(1), head)) {
      state.gameOver = true;
      return;
    }
    state.body = nextBody;
    if (eating) {
      state.score += 10;
      if (state.score > highScore) highScore = state.score;
      state.food = spawnFood(state.body, GRID_SIZE, Math.random);
    }
  }

  // --- render ------------------------------------------------------------
  function render(ctx) {
    ctx.save();
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, GRID_SIZE * CELL, GRID_SIZE * CELL);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (var i = 1; i < GRID_SIZE; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID_SIZE * CELL);
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID_SIZE * CELL, i * CELL);
      ctx.stroke();
    }

    if (state.food) drawCell(ctx, state.food, COLORS.food);
    for (var j = 0; j < state.body.length; j += 1) {
      drawCell(ctx, state.body[j], j === 0 ? COLORS.head : COLORS.body);
    }

    if (state.paused && !state.gameOver) drawOverlay(ctx, 'Paused', 'Press space to resume');
    if (state.gameOver) drawOverlay(ctx, 'Game Over — press R to restart', 'Final score: ' + state.score);
    ctx.restore();

    var scoreEl = document.getElementById('score');
    var highEl = document.getElementById('highscore');
    if (scoreEl) scoreEl.textContent = String(state.score);
    if (highEl) highEl.textContent = String(highScore);
  }

  function drawCell(ctx, cell, color) {
    var pad = 2;
    ctx.fillStyle = color;
    ctx.fillRect(cell.x * CELL + pad, cell.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
  }

  function drawOverlay(ctx, title, subtitle) {
    var w = GRID_SIZE * CELL;
    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, w, w);
    ctx.fillStyle = COLORS.overlayText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText(title, w / 2, w / 2 - 14);
    ctx.font = '400 18px system-ui, sans-serif';
    ctx.fillText(subtitle, w / 2, w / 2 + 22);
  }

  // --- input -------------------------------------------------------------
  var KEY_DIRS = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
  };

  function onKeyDown(e) {
    if (KEY_DIRS[e.code]) {
      state.pendingDirection = KEY_DIRS[e.code];
      e.preventDefault();
      return;
    }
    if (e.code === 'Space') {
      if (!state.gameOver) state.paused = !state.paused;
      e.preventDefault();
      return;
    }
    if (e.code === 'KeyR') {
      state = initialState();
      e.preventDefault();
    }
  }

  // --- boot --------------------------------------------------------------
  function boot() {
    var canvas = document.getElementById('board');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    state = initialState();

    var last = performance.now();
    var acc = 0;
    function frame(now) {
      var dt = now - last;
      last = now;
      acc += dt;
      while (acc >= TICK_MS) {
        tick();
        acc -= TICK_MS;
      }
      render(ctx);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    window.addEventListener('keydown', onKeyDown);
    canvas.focus();

    // Expose pure helpers for curious testers/devtools.
    window.__snakeInternals__ = {
      nextHead: nextHead,
      willCollideWithSelf: willCollideWithSelf,
      willCollideWithWall: willCollideWithWall,
      spawnFood: spawnFood,
      applyDirectionChange: applyDirectionChange,
      growSnake: growSnake,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
