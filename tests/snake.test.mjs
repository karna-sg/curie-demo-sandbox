import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  nextHead,
  willCollideWithSelf,
  willCollideWithWall,
  spawnFood,
  applyDirectionChange,
  growSnake,
} from '../snake-logic.mjs';

describe('nextHead', () => {
  it('moves right by +x', () => {
    assert.deepEqual(nextHead({ x: 5, y: 5 }, 'right'), { x: 6, y: 5 });
  });
  it('moves left by -x', () => {
    assert.deepEqual(nextHead({ x: 5, y: 5 }, 'left'), { x: 4, y: 5 });
  });
  it('moves up by -y', () => {
    assert.deepEqual(nextHead({ x: 5, y: 5 }, 'up'), { x: 5, y: 4 });
  });
  it('moves down by +y', () => {
    assert.deepEqual(nextHead({ x: 5, y: 5 }, 'down'), { x: 5, y: 6 });
  });
  it('throws on unknown direction', () => {
    assert.throws(() => nextHead({ x: 0, y: 0 }, 'diagonal'));
  });
});

describe('willCollideWithSelf', () => {
  const body = [
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 1, y: 3 },
  ];
  it('returns true when newHead overlaps body', () => {
    assert.equal(willCollideWithSelf(body, { x: 2, y: 3 }), true);
  });
  it('returns false when newHead is free', () => {
    assert.equal(willCollideWithSelf(body, { x: 4, y: 3 }), false);
  });
  it('returns false for empty body', () => {
    assert.equal(willCollideWithSelf([], { x: 0, y: 0 }), false);
  });
});

describe('willCollideWithWall', () => {
  it('returns true when x < 0', () => {
    assert.equal(willCollideWithWall({ x: -1, y: 5 }, 20), true);
  });
  it('returns true when y < 0', () => {
    assert.equal(willCollideWithWall({ x: 5, y: -1 }, 20), true);
  });
  it('returns true when x >= gridSize', () => {
    assert.equal(willCollideWithWall({ x: 20, y: 5 }, 20), true);
  });
  it('returns true when y >= gridSize', () => {
    assert.equal(willCollideWithWall({ x: 5, y: 20 }, 20), true);
  });
  it('returns false when inside bounds', () => {
    assert.equal(willCollideWithWall({ x: 0, y: 0 }, 20), false);
    assert.equal(willCollideWithWall({ x: 19, y: 19 }, 20), false);
  });
});

describe('spawnFood', () => {
  it('spawns on a free cell determined by the injected rng', () => {
    const body = [{ x: 0, y: 0 }];
    const rng = () => 0;
    const food = spawnFood(body, 2, rng);
    assert.deepEqual(food, { x: 1, y: 0 });
  });
  it('never picks a cell occupied by the snake', () => {
    const body = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    for (let i = 0; i < 20; i += 1) {
      const rng = () => i / 20;
      const food = spawnFood(body, 2, rng);
      assert.ok(food);
      assert.equal(
        body.some((s) => s.x === food.x && s.y === food.y),
        false,
      );
    }
  });
  it('returns null when the grid is fully occupied', () => {
    const body = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
    assert.equal(spawnFood(body, 2, () => 0), null);
  });
});

describe('applyDirectionChange', () => {
  it('rejects 180° reversals', () => {
    assert.equal(applyDirectionChange('right', 'left'), 'right');
    assert.equal(applyDirectionChange('left', 'right'), 'left');
    assert.equal(applyDirectionChange('up', 'down'), 'up');
    assert.equal(applyDirectionChange('down', 'up'), 'down');
  });
  it('accepts perpendicular turns', () => {
    assert.equal(applyDirectionChange('right', 'up'), 'up');
    assert.equal(applyDirectionChange('right', 'down'), 'down');
  });
  it('ignores unknown requests', () => {
    assert.equal(applyDirectionChange('right', 'diagonal'), 'right');
  });
  it('returns the same direction when requested equals current', () => {
    assert.equal(applyDirectionChange('right', 'right'), 'right');
  });
});

describe('growSnake', () => {
  it('prepends the new head and keeps every existing segment', () => {
    const body = [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ];
    const grown = growSnake(body, { x: 2, y: 0 });
    assert.deepEqual(grown, [
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ]);
    assert.equal(grown.length, body.length + 1);
  });
  it('does not mutate the input body', () => {
    const body = [{ x: 0, y: 0 }];
    growSnake(body, { x: 1, y: 0 });
    assert.deepEqual(body, [{ x: 0, y: 0 }]);
  });
});
