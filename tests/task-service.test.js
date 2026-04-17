import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TaskService } from '../src/services/task-service.js';

test('TaskService: registerUser adds a user', () => {
  const svc = new TaskService();
  const u = svc.registerUser({ name: 'Ada', email: 'ada@ex.com' });
  assert.equal(svc.store.getUser(u.id), u);
});

test('TaskService: full create → assign → start → complete flow', () => {
  const svc = new TaskService();
  const owner = svc.registerUser({ name: 'Ada', email: 'ada@ex.com' });
  const worker = svc.registerUser({ name: 'Bo', email: 'bo@ex.com' });
  const t = svc.createTask({ title: 'Ship it', ownerId: owner.id });
  assert.equal(t.status, 'todo');

  svc.assignTask(t.id, worker.id);
  assert.equal(t.assigneeId, worker.id);

  svc.startTask(t.id);
  assert.equal(t.status, 'in_progress');

  svc.completeTask(t.id);
  assert.equal(t.status, 'done');
});

test('TaskService: cancelTask sets status cancelled', () => {
  const svc = new TaskService();
  const u = svc.registerUser({ name: 'Ada', email: 'ada@ex.com' });
  const t = svc.createTask({ title: 'X', ownerId: u.id });
  svc.cancelTask(t.id);
  assert.equal(t.status, 'cancelled');
});

test('TaskService: listOpenTasksForUser returns only open, correctly ordered', async () => {
  const svc = new TaskService();
  const owner = svc.registerUser({ name: 'Ada', email: 'ada@ex.com' });
  const worker = svc.registerUser({ name: 'Bo', email: 'bo@ex.com' });

  const lowOpen = svc.createTask({
    title: 'low',
    ownerId: owner.id,
    priority: 'low',
    assigneeId: worker.id,
  });
  await new Promise((r) => setTimeout(r, 2));
  const urgentOpen = svc.createTask({
    title: 'urgent',
    ownerId: owner.id,
    priority: 'urgent',
    assigneeId: worker.id,
  });
  const doneTask = svc.createTask({
    title: 'done',
    ownerId: owner.id,
    assigneeId: worker.id,
  });
  svc.completeTask(doneTask.id);
  svc.createTask({ title: 'unassigned', ownerId: owner.id });

  const open = svc.listOpenTasksForUser(worker.id);
  assert.deepEqual(
    open.map((t) => t.title),
    ['urgent', 'low'],
  );
  assert.ok(!open.some((t) => t.id === lowOpen.id && t.status === 'done'));
});

test('TaskService: assignTask on unknown task throws "task not found"', () => {
  const svc = new TaskService();
  svc.registerUser({ name: 'Ada', email: 'ada@ex.com' });
  assert.throws(
    () => svc.assignTask('nope', 'anyone'),
    /task not found/,
  );
});

test('TaskService: startTask/completeTask on unknown id throws', () => {
  const svc = new TaskService();
  assert.throws(() => svc.startTask('nope'), /task not found/);
  assert.throws(() => svc.completeTask('nope'), /task not found/);
  assert.throws(() => svc.cancelTask('nope'), /task not found/);
});

test('TaskService: input validation on every method', () => {
  const svc = new TaskService();
  assert.throws(
    () => svc.registerUser({ name: '', email: 'a@b.co' }),
    TypeError,
  );
  assert.throws(
    () => svc.createTask({ title: '', ownerId: 'u' }),
    TypeError,
  );
  assert.throws(() => svc.assignTask('', 'u'), TypeError);
  assert.throws(() => svc.listOpenTasksForUser(''), TypeError);
});
