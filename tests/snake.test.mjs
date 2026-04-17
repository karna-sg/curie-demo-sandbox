import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextHead,
  willCollideWithSelf,
  willCollideWithWall,
  spawnFood,
  applyDirectionChange,
  growSnake,
  moveSnake,
} from '../snake-logic.mjs';

test('nextHead returns new coordinate for each direction', () => {
  const head = { x: 5, y: 5 };
  assert.deepEqual(nextHead(head, 'right'), { x: 6, y: 5 });
  assert.deepEqual(nextHead(head, 'left'), { x: 4, y: 5 });
  assert.deepEqual(nextHead(head, 'up'), { x: 5, y: 4 });
  assert.deepEqual(nextHead(head, 'down'), { x: 5, y: 6 });
});

test('willCollideWithSelf detects overlap with any body segment', () => {
  const body = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ];
  assert.equal(willCollideWithSelf(body, { x: 2, y: 1 }), true);
  assert.equal(willCollideWithSelf(body, { x: 4, y: 1 }), false);
  assert.equal(willCollideWithSelf([], { x: 0, y: 0 }), false);
});

test('willCollideWithWall detects out-of-bounds positions', () => {
  assert.equal(willCollideWithWall({ x: -1, y: 0 }, 20), true);
  assert.equal(willCollideWithWall({ x: 0, y: -1 }, 20), true);
  assert.equal(willCollideWithWall({ x: 20, y: 5 }, 20), true);
  assert.equal(willCollideWithWall({ x: 5, y: 20 }, 20), true);
  assert.equal(willCollideWithWall({ x: 0, y: 0 }, 20), false);
  assert.equal(willCollideWithWall({ x: 19, y: 19 }, 20), false);
});

test('spawnFood returns a cell not occupied by body (deterministic via rng)', () => {
  const body = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ];
  const food = spawnFood(body, 3, () => 0);
  assert.deepEqual(food, { x: 2, y: 0 });
  // rng returning 0.999 picks the last empty cell
  const last = spawnFood(body, 3, () => 0.999);
  assert.deepEqual(last, { x: 2, y: 2 });
  // no empty cells -> null
  const all = [];
  for (let y = 0; y < 2; y += 1) {
    for (let x = 0; x < 2; x += 1) all.push({ x, y });
  }
  assert.equal(spawnFood(all, 2, () => 0), null);
});

test('applyDirectionChange rejects 180° reversals, accepts perpendiculars', () => {
  assert.equal(applyDirectionChange('right', 'left'), 'right');
  assert.equal(applyDirectionChange('up', 'down'), 'up');
  assert.equal(applyDirectionChange('right', 'up'), 'up');
  assert.equal(applyDirectionChange('right', 'down'), 'down');
  assert.equal(applyDirectionChange('right', 'right'), 'right');
});

test('growSnake prepends newHead (length grows by 1)', () => {
  const body = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];
  const grown = growSnake(body, { x: 3, y: 0 });
  assert.equal(grown.length, body.length + 1);
  assert.deepEqual(grown[0], { x: 3, y: 0 });
  assert.deepEqual(grown.slice(1), body);
});

test('moveSnake shifts forward without changing length', () => {
  const body = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];
  const moved = moveSnake(body, { x: 3, y: 0 });
  assert.equal(moved.length, body.length);
  assert.deepEqual(moved[0], { x: 3, y: 0 });
  assert.deepEqual(moved[moved.length - 1], { x: 1, y: 0 });
});
