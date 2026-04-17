import { test } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../src/models/user.js';
import { Task } from '../src/models/task.js';
import { TaskStore } from '../src/store/task-store.js';

function mkUser(name = 'Ada') {
  return new User({ name, email: `${name.toLowerCase()}@ex.com` });
}

test('TaskStore: addUser / getUser happy path', () => {
  const s = new TaskStore();
  const u = mkUser();
  s.addUser(u);
  assert.equal(s.getUser(u.id), u);
  assert.throws(() => s.addUser(u), /already exists/);
});

test('TaskStore: addTask happy path', () => {
  const s = new TaskStore();
  const u = mkUser();
  s.addUser(u);
  const t = new Task({ title: 'A', ownerId: u.id });
  s.addTask(t);
  assert.equal(s.getTask(t.id), t);
});

test('TaskStore: addTask rejects unknown owner', () => {
  const s = new TaskStore();
  const t = new Task({ title: 'A', ownerId: 'nope' });
  assert.throws(() => s.addTask(t), /unknown owner/);
});

test('TaskStore: addTask rejects unknown assignee', () => {
  const s = new TaskStore();
  const u = mkUser();
  s.addUser(u);
  const t = new Task({ title: 'A', ownerId: u.id, assigneeId: 'ghost' });
  assert.throws(() => s.addTask(t), /unknown assignee/);
});

test('TaskStore: updateTask validates atomically', () => {
  const s = new TaskStore();
  const u = mkUser();
  s.addUser(u);
  const t = new Task({ title: 'A', ownerId: u.id, priority: 'low' });
  s.addTask(t);
  const beforePriority = t.priority;
  assert.throws(
    () => s.updateTask(t.id, { priority: 'high', status: 'bogus' }),
    TypeError,
  );
  // priority must NOT have been applied since status validation failed
  assert.equal(t.priority, beforePriority);
  assert.equal(t.status, 'todo');
});

test('TaskStore: updateTask throws on unknown id', () => {
  const s = new TaskStore();
  assert.throws(() => s.updateTask('nope', { status: 'done' }), /task not found/);
});

test('TaskStore: listTasks filter combinations', () => {
  const s = new TaskStore();
  const u1 = mkUser('Ada');
  const u2 = mkUser('Bo');
  s.addUser(u1);
  s.addUser(u2);
  const t1 = new Task({ title: 'a', ownerId: u1.id, priority: 'low' });
  const t2 = new Task({
    title: 'b',
    ownerId: u1.id,
    priority: 'high',
    assigneeId: u2.id,
  });
  const t3 = new Task({ title: 'c', ownerId: u2.id, priority: 'medium' });
  s.addTask(t1);
  s.addTask(t2);
  s.addTask(t3);

  assert.equal(s.listTasks({ ownerId: u1.id }).length, 2);
  assert.equal(s.listTasks({ assigneeId: u2.id }).length, 1);
  assert.equal(s.listTasks({ priority: 'high' }).length, 1);
  assert.equal(s.listTasks({ status: 'todo' }).length, 3);
  assert.equal(s.listTasks({ ownerId: u1.id, priority: 'low' }).length, 1);
});

test('TaskStore: listTasks priority ordering, then createdAt desc', async () => {
  const s = new TaskStore();
  const u = mkUser();
  s.addUser(u);
  const low = new Task({ title: 'l', ownerId: u.id, priority: 'low' });
  s.addTask(low);
  await new Promise((r) => setTimeout(r, 2));
  const mediumA = new Task({ title: 'ma', ownerId: u.id, priority: 'medium' });
  s.addTask(mediumA);
  await new Promise((r) => setTimeout(r, 2));
  const mediumB = new Task({ title: 'mb', ownerId: u.id, priority: 'medium' });
  s.addTask(mediumB);
  await new Promise((r) => setTimeout(r, 2));
  const urgent = new Task({ title: 'u', ownerId: u.id, priority: 'urgent' });
  s.addTask(urgent);

  const ordered = s.listTasks();
  assert.deepEqual(
    ordered.map((t) => t.title),
    ['u', 'mb', 'ma', 'l'],
  );
});

test('TaskStore: removeTask returns boolean', () => {
  const s = new TaskStore();
  const u = mkUser();
  s.addUser(u);
  const t = new Task({ title: 'a', ownerId: u.id });
  s.addTask(t);
  assert.equal(s.removeTask(t.id), true);
  assert.equal(s.removeTask(t.id), false);
});
