import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from '../src/models/task.js';

test('Task: construction defaults', () => {
  const t = new Task({ title: 'Write docs', ownerId: 'u1' });
  assert.equal(t.title, 'Write docs');
  assert.equal(t.description, '');
  assert.equal(t.status, 'todo');
  assert.equal(t.priority, 'medium');
  assert.equal(t.ownerId, 'u1');
  assert.equal(t.assigneeId, null);
  assert.ok(t.createdAt instanceof Date);
  assert.ok(t.updatedAt instanceof Date);
});

test('Task: constants are frozen', () => {
  assert.ok(Object.isFrozen(TASK_STATUSES));
  assert.ok(Object.isFrozen(TASK_PRIORITIES));
});

test('Task: invalid inputs throw TypeError', () => {
  assert.throws(() => new Task({ title: '', ownerId: 'u1' }), TypeError);
  assert.throws(
    () => new Task({ title: 'x'.repeat(201), ownerId: 'u1' }),
    TypeError,
  );
  assert.throws(() => new Task({ title: 'ok', ownerId: '' }), TypeError);
  assert.throws(
    () => new Task({ title: 'ok', ownerId: 'u1', priority: 'bogus' }),
    TypeError,
  );
  assert.throws(
    () => new Task({ title: 'ok', ownerId: 'u1', description: 123 }),
    TypeError,
  );
  assert.throws(
    () => new Task({ title: 'ok', ownerId: 'u1', assigneeId: '' }),
    TypeError,
  );
});

test('Task: setStatus happy path updates status & updatedAt', async () => {
  const t = new Task({ title: 'ok', ownerId: 'u1' });
  const before = t.updatedAt;
  await new Promise((r) => setTimeout(r, 2));
  t.setStatus('in_progress');
  assert.equal(t.status, 'in_progress');
  assert.ok(t.updatedAt.getTime() > before.getTime());
});

test('Task: setStatus rejects unknown status', () => {
  const t = new Task({ title: 'ok', ownerId: 'u1' });
  assert.throws(() => t.setStatus('bogus'), TypeError);
});

test('Task: assign / unassign happy paths', async () => {
  const t = new Task({ title: 'ok', ownerId: 'u1' });
  t.assign('u2');
  assert.equal(t.assigneeId, 'u2');
  t.unassign();
  assert.equal(t.assigneeId, null);
  assert.throws(() => t.assign(''), TypeError);
});

test('Task: toJSON serializes dates as ISO strings', () => {
  const t = new Task({ title: 'ok', ownerId: 'u1' });
  const j = t.toJSON();
  assert.equal(j.createdAt, t.createdAt.toISOString());
  assert.equal(j.updatedAt, t.updatedAt.toISOString());
  assert.equal(j.status, 'todo');
});
