// Demo for SCRUM-9: browser-based Snake game.
// The feature is a static HTML page, so this script narrates what the
// page does rather than running the game headlessly.
import {
  nextHead,
  applyDirectionChange,
  growSnake,
  spawnFood,
} from './snake-logic.mjs';

console.log('[snake] Game lives at ./index.html — open it in any modern browser.');
console.log('[snake] Board: 20x20 grid on a 600x600 canvas (2x retina backing store).');
console.log('[snake] Controls: Arrow keys / WASD to turn, Space to pause, R to restart.');
console.log('[snake] Tick rate: 120ms. Scoring: +10 per food pellet. High score kept in-memory.');
console.log('[snake] No build, no deps, no network — three static files + ESM logic module.');

// Quick sanity check against the extracted pure helpers (also tested in tests/snake.test.mjs).
const start = { x: 10, y: 10 };
const afterRight = nextHead(start, 'right');
const rejected = applyDirectionChange('right', 'left');
const grown = growSnake([start], afterRight);
const food = spawnFood(grown, 20, () => 0.5);
console.log('[snake] head after moving right:', afterRight);
console.log('[snake] 180° reversal rejected, direction stays:', rejected);
console.log('[snake] snake after eating once, length:', grown.length);
console.log('[snake] deterministic food spawn (rng=0.5):', food);
