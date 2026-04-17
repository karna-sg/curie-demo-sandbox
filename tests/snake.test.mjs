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

test('nextHead moves one cell in each direction', () => {
  assert.deepEqual(nextHead({ x: 5, y: 5 }, 'up'), { x: 5, y: 4 });
  assert.deepEqual(nextHead({ x: 5, y: 5 }, 'down'), { x: 5, y: 6 });
  assert.deepEqual(nextHead({ x: 5, y: 5 }, 'left'), { x: 4, y: 5 });
  assert.deepEqual(nextHead({ x: 5, y: 5 }, 'right'), { x: 6, y: 5 });
});

test('willCollideWithSelf detects overlap', () => {
  const body = [
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 1, y: 3 },
  ];
  assert.equal(willCollideWithSelf(body, { x: 2, y: 3 }), true);
  assert.equal(willCollideWithSelf(body, { x: 4, y: 3 }), false);
});

test('willCollideWithWall detects out of bounds', () => {
  assert.equal(willCollideWithWall({ x: -1, y: 0 }, 20), true);
  assert.equal(willCollideWithWall({ x: 0, y: -1 }, 20), true);
  assert.equal(willCollideWithWall({ x: 20, y: 5 }, 20), true);
  assert.equal(willCollideWithWall({ x: 5, y: 20 }, 20), true);
  assert.equal(willCollideWithWall({ x: 0, y: 0 }, 20), false);
  assert.equal(willCollideWithWall({ x: 19, y: 19 }, 20), false);
});

test('spawnFood returns a free cell and uses injected rng', () => {
  const body = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ];
  // rng returns 0 -> first free cell in scan order
  const rngZero = () => 0;
  const food = spawnFood(body, 3, rngZero);
  assert.ok(food);
  assert.equal(
    body.some((s) => s.x === food.x && s.y === food.y),
    false,
  );
  // deterministic: first free cell is (0,1) given scan order x outer, y inner
  assert.deepEqual(food, { x: 0, y: 1 });

  // rng near 1 -> last free cell
  const rngMax = () => 0.9999999;
  const food2 = spawnFood(body, 3, rngMax);
  assert.deepEqual(food2, { x: 2, y: 2 });
});

test('spawnFood returns null when board is full', () => {
  const gridSize = 2;
  const body = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ];
  assert.equal(spawnFood(body, gridSize, () => 0), null);
});

test('applyDirectionChange rejects 180° reversals', () => {
  assert.equal(applyDirectionChange('right', 'left'), 'right');
  assert.equal(applyDirectionChange('left', 'right'), 'left');
  assert.equal(applyDirectionChange('up', 'down'), 'up');
  assert.equal(applyDirectionChange('down', 'up'), 'down');
  assert.equal(applyDirectionChange('right', 'up'), 'up');
  assert.equal(applyDirectionChange('right', 'right'), 'right');
  assert.equal(applyDirectionChange('up', 'bogus'), 'up');
});

test('growSnake prepends head and keeps tail (length +1)', () => {
  const body = [
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ];
  const grown = growSnake(body, { x: 3, y: 2 });
  assert.equal(grown.length, 3);
  assert.deepEqual(grown[0], { x: 3, y: 2 });
  assert.deepEqual(grown[grown.length - 1], { x: 1, y: 2 });
});

test('moveSnake prepends head and drops tail (length stable)', () => {
  const body = [
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ];
  const moved = moveSnake(body, { x: 3, y: 2 });
  assert.equal(moved.length, 3);
  assert.deepEqual(moved[0], { x: 3, y: 2 });
  assert.deepEqual(moved[moved.length - 1], { x: 1, y: 2 });
});
