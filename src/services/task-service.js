import { User } from '../models/user.js';
import { Task } from '../models/task.js';
import { TaskStore } from '../store/task-store.js';

function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

function requireTaskId(taskId) {
  if (!isNonEmptyString(taskId)) {
    throw new TypeError('taskId must be a non-empty string');
  }
}

export class TaskService {
  constructor(store = new TaskStore()) {
    if (!(store instanceof TaskStore)) {
      throw new TypeError('store must be a TaskStore instance');
    }
    this.store = store;
  }

  registerUser({ name, email } = {}) {
    const user = new User({ name, email });
    this.store.addUser(user);
    return user;
  }

  createTask({ title, description, ownerId, priority, assigneeId } = {}) {
    const task = new Task({ title, description, ownerId, priority, assigneeId });
    this.store.addTask(task);
    return task;
  }

  assignTask(taskId, assigneeId) {
    requireTaskId(taskId);
    if (!isNonEmptyString(assigneeId)) {
      throw new TypeError('assigneeId must be a non-empty string');
    }
    return this.store.updateTask(taskId, { assigneeId });
  }

  startTask(taskId) {
    requireTaskId(taskId);
    return this.store.updateTask(taskId, { status: 'in_progress' });
  }

  completeTask(taskId) {
    requireTaskId(taskId);
    return this.store.updateTask(taskId, { status: 'done' });
  }

  cancelTask(taskId) {
    requireTaskId(taskId);
    return this.store.updateTask(taskId, { status: 'cancelled' });
  }

  listOpenTasksForUser(userId) {
    if (!isNonEmptyString(userId)) {
      throw new TypeError('userId must be a non-empty string');
    }
    const open = new Set(['todo', 'in_progress']);
    return this.store
      .listTasks({ assigneeId: userId })
      .filter((t) => open.has(t.status));
  }
}
