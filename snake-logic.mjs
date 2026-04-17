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
  const occupied = new Set(body.map((s) => `${s.x},${s.y}`));
  const free = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const idx = Math.floor(rng() * free.length);
  return free[idx];
}

export function applyDirectionChange(current, requested) {
  const a = DIRECTIONS[current];
  const b = DIRECTIONS[requested];
  if (!b) return current;
  if (a.x + b.x === 0 && a.y + b.y === 0) return current;
  return requested;
}

export function growSnake(body, newHead) {
  return [newHead, ...body];
}

export function moveSnake(body, newHead) {
  return [newHead, ...body.slice(0, -1)];
}
