/* Snake — classic browser script (no modules). */
(function () {
  'use strict';

  // ---------- constants ----------
  var GRID = 20;
  var CELL = 30; // CSS pixels
  var DPR = 2; // retina: backing store is 2x CSS size
  var TICK_MS = 120;
  var COLORS = {
    bg: '#0e3b3b',
    grid: 'rgba(255,255,255,0.04)',
    head: '#7dd3fc',
    body: '#38bdf8',
    food: '#ef4444',
    overlay: 'rgba(0,0,0,0.55)',
    text: '#e6fffb',
  };
  var DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  var KEY_TO_DIR = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    W: 'up',
    s: 'down',
    S: 'down',
    a: 'left',
    A: 'left',
    d: 'right',
    D: 'right',
  };

  // ---------- pure helpers ----------
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
      newHead.x < 0 || newHead.y < 0 || newHead.x >= gridSize || newHead.y >= gridSize
    );
  }
  function spawnFood(body, gridSize, rng) {
    var occupied = {};
    for (var i = 0; i < body.length; i += 1) {
      occupied[body[i].x + ',' + body[i].y] = true;
    }
    var empty = [];
    for (var y = 0; y < gridSize; y += 1) {
      for (var x = 0; x < gridSize; x += 1) {
        if (!occupied[x + ',' + y]) empty.push({ x: x, y: y });
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor((rng || Math.random)() * empty.length)];
  }
  function applyDirectionChange(current, requested) {
    var a = DIRECTIONS[current];
    var b = DIRECTIONS[requested];
    if (!b) return current;
    if (a.x + b.x === 0 && a.y + b.y === 0) return current;
    return requested;
  }
  function growSnake(body, newHead) {
    return [newHead].concat(body);
  }
  function moveSnake(body, newHead) {
    var out = [newHead];
    for (var i = 0; i < body.length - 1; i += 1) out.push(body[i]);
    return out;
  }

  // ---------- state ----------
  var state;
  function initialState() {
    var mid = Math.floor(GRID / 2);
    return {
      snake: [
        { x: mid + 1, y: mid },
        { x: mid, y: mid },
        { x: mid - 1, y: mid },
      ],
      direction: 'right',
      pendingDirection: 'right',
      food: { x: mid + 5, y: mid },
      score: 0,
      highScore: state ? state.highScore : 0,
      paused: false,
      gameOver: false,
      accumulator: 0,
      lastTs: 0,
    };
  }

  // ---------- update ----------
  function tick() {
    if (state.paused || state.gameOver) return;
    state.direction = applyDirectionChange(state.direction, state.pendingDirection);
    var head = nextHead(state.snake[0], state.direction);
    if (
      willCollideWithWall(head, GRID) ||
      willCollideWithSelf(state.snake, head)
    ) {
      state.gameOver = true;
      if (state.score > state.highScore) state.highScore = state.score;
      return;
    }
    var ate = head.x === state.food.x && head.y === state.food.y;
    state.snake = ate ? growSnake(state.snake, head) : moveSnake(state.snake, head);
    if (ate) {
      state.score += 10;
      if (state.score > state.highScore) state.highScore = state.score;
      state.food = spawnFood(state.snake, GRID) || state.food;
    }
  }

  // ---------- render ----------
  var canvas;
  var ctx;
  var scoreEl;
  var highEl;

  function drawCell(cx, cy, color) {
    ctx.fillStyle = color;
    var pad = 1;
    ctx.fillRect(cx * CELL + pad, cy * CELL + pad, CELL - pad * 2, CELL - pad * 2);
  }

  function render() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (var i = 1; i < GRID; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    if (state.food) drawCell(state.food.x, state.food.y, COLORS.food);
    for (var s = state.snake.length - 1; s >= 0; s -= 1) {
      drawCell(state.snake[s].x, state.snake[s].y, s === 0 ? COLORS.head : COLORS.body);
    }

    scoreEl.textContent = String(state.score);
    highEl.textContent = String(state.highScore);

    if (state.gameOver) drawOverlay('Game Over — press R to restart', 'Score: ' + state.score);
    else if (state.paused) drawOverlay('Paused', 'press Space to resume');
  }

  function drawOverlay(title, subtitle) {
    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText(title, (GRID * CELL) / 2, (GRID * CELL) / 2 - 14);
    ctx.font = '400 16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText(subtitle, (GRID * CELL) / 2, (GRID * CELL) / 2 + 20);
  }

  // ---------- input ----------
  function onKeyDown(e) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!state.gameOver) state.paused = !state.paused;
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      state = initialState();
      return;
    }
    var dir = KEY_TO_DIR[e.key];
    if (dir) {
      e.preventDefault();
      state.pendingDirection = dir;
    }
  }

  // ---------- boot ----------
  function boot() {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    scoreEl = document.getElementById('score');
    highEl = document.getElementById('high-score');
    state = initialState();
    // put food in a cell not on the snake
    state.food = spawnFood(state.snake, GRID) || state.food;

    window.addEventListener('keydown', onKeyDown);
    canvas.focus();

    function frame(ts) {
      if (!state.lastTs) state.lastTs = ts;
      var dt = ts - state.lastTs;
      state.lastTs = ts;
      if (!state.paused && !state.gameOver) {
        state.accumulator += dt;
        while (state.accumulator >= TICK_MS) {
          tick();
          state.accumulator -= TICK_MS;
        }
      } else {
        state.accumulator = 0;
      }
      render();
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
