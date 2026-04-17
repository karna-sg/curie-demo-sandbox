/* eslint-disable */
(function () {
  'use strict';

  // --- Constants ---
  const GRID = 20;
  const CELL = 30; // CSS px per cell
  const SCALE = 2; // retina backing store multiplier
  const TICK_MS = 120;
  const COLORS = {
    bg: '#0e3b3b',
    head: '#7dd3fc',
    body: '#38bdf8',
    food: '#ef4444',
    overlay: 'rgba(3, 20, 20, 0.72)',
    text: '#e2f5f5',
  };
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  // --- Pure helpers (mirrored in snake-logic.mjs for tests) ---
  function nextHead(head, direction) {
    const delta = DIRECTIONS[direction];
    return { x: head.x + delta.x, y: head.y + delta.y };
  }

  function willCollideWithSelf(body, newHead) {
    return body.some((seg) => seg.x === newHead.x && seg.y === newHead.y);
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
    const occupied = new Set(body.map((s) => s.x + ',' + s.y));
    const free = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (!occupied.has(x + ',' + y)) free.push({ x, y });
      }
    }
    if (free.length === 0) return null;
    return free[Math.floor(rng() * free.length)];
  }

  function applyDirectionChange(current, requested) {
    const a = DIRECTIONS[current];
    const b = DIRECTIONS[requested];
    if (!b) return current;
    if (a.x + b.x === 0 && a.y + b.y === 0) return current;
    return requested;
  }

  function growSnake(body, newHead) {
    return [newHead, ...body];
  }

  function moveSnake(body, newHead) {
    return [newHead, ...body.slice(0, -1)];
  }

  // --- State ---
  let state;

  function initialState() {
    const mid = Math.floor(GRID / 2);
    const body = [
      { x: mid + 1, y: mid },
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
    ];
    return {
      body,
      direction: 'right',
      pendingDirection: 'right',
      food: spawnFood(body, GRID, Math.random),
      score: 0,
      highScore: state ? state.highScore : 0,
      paused: false,
      gameOver: false,
      accumulator: 0,
      lastTs: 0,
    };
  }

  // --- Update ---
  function tick() {
    if (state.paused || state.gameOver) return;
    state.direction = applyDirectionChange(
      state.direction,
      state.pendingDirection,
    );
    const head = nextHead(state.body[0], state.direction);
    if (
      willCollideWithWall(head, GRID) ||
      willCollideWithSelf(state.body, head)
    ) {
      state.gameOver = true;
      if (state.score > state.highScore) state.highScore = state.score;
      return;
    }
    const ate = state.food && head.x === state.food.x && head.y === state.food.y;
    state.body = ate ? growSnake(state.body, head) : moveSnake(state.body, head);
    if (ate) {
      state.score += 10;
      state.food = spawnFood(state.body, GRID, Math.random);
    }
  }

  // --- Render ---
  function render(ctx) {
    ctx.save();
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    if (state.food) {
      drawCell(ctx, state.food.x, state.food.y, COLORS.food);
    }
    state.body.forEach((seg, i) => {
      drawCell(ctx, seg.x, seg.y, i === 0 ? COLORS.head : COLORS.body);
    });

    if (state.paused && !state.gameOver) {
      drawOverlay(ctx, 'Paused', 'Press Space to resume');
    }
    if (state.gameOver) {
      drawOverlay(
        ctx,
        'Game Over — press R to restart',
        'Final score: ' + state.score,
      );
    }
    ctx.restore();
    document.getElementById('score').textContent = String(state.score);
    document.getElementById('high-score').textContent = String(state.highScore);
  }

  function drawCell(ctx, x, y, color) {
    ctx.fillStyle = color;
    const px = x * CELL;
    const py = y * CELL;
    ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
  }

  function drawOverlay(ctx, title, subtitle) {
    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText(title, (GRID * CELL) / 2, (GRID * CELL) / 2 - 16);
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillText(subtitle, (GRID * CELL) / 2, (GRID * CELL) / 2 + 20);
  }

  // --- Input ---
  const KEY_MAP = {
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

  function onKey(e) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!state.gameOver) state.paused = !state.paused;
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      state = initialState();
      return;
    }
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      state.pendingDirection = dir;
    }
  }

  // --- Boot ---
  function boot() {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    state = initialState();
    canvas.focus();
    canvas.addEventListener('keydown', onKey);
    window.addEventListener('keydown', onKey);

    function loop(ts) {
      if (!state.lastTs) state.lastTs = ts;
      const dt = ts - state.lastTs;
      state.lastTs = ts;
      state.accumulator += dt;
      while (state.accumulator >= TICK_MS) {
        tick();
        state.accumulator -= TICK_MS;
      }
      render(ctx);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  if (typeof window !== 'undefined') {
    window.__snakeInternals__ = {
      nextHead,
      willCollideWithSelf,
      willCollideWithWall,
      spawnFood,
      applyDirectionChange,
      growSnake,
      moveSnake,
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})();
