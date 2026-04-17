// Pure, side-effect-free helpers for the Snake game.
// Imported by tests/snake.test.mjs. The browser script (snake.js) inlines
// equivalent implementations so it can be loaded as a classic script via file://.

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function nextHead(head, direction) {
  const delta = DIRECTIONS[direction];
  if (!delta) throw new Error(`unknown direction: ${direction}`);
  return { x: head.x + delta.x, y: head.y + delta.y };
}

export function willCollideWithSelf(body, newHead) {
  return body.some((seg) => seg.x === newHead.x && seg.y === newHead.y);
}

export function willCollideWithWall(newHead, gridSize) {
  return (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= gridSize ||
    newHead.y >= gridSize
  );
}

export function spawnFood(body, gridSize, rng) {
  const occupied = new Set(body.map((c) => `${c.x},${c.y}`));
  const free = [];
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const index = Math.floor(rng() * free.length);
  return free[index];
}

export function applyDirectionChange(current, requested) {
  const c = DIRECTIONS[current];
  const r = DIRECTIONS[requested];
  if (!r) return current;
  if (c.x + r.x === 0 && c.y + r.y === 0) return current;
  return requested;
}

export function growSnake(body, newHead) {
  return [newHead, ...body];
}
