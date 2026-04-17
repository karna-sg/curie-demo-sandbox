import { User } from '../models/user.js';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from '../models/task.js';

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

export class TaskStore {
  constructor() {
    this.users = new Map();
    this.tasks = new Map();
  }

  addUser(user) {
    if (!(user instanceof User)) {
      throw new TypeError('addUser expects a User instance');
    }
    if (this.users.has(user.id)) {
      throw new Error(`user already exists: ${user.id}`);
    }
    this.users.set(user.id, user);
  }

  getUser(id) {
    return this.users.get(id);
  }

  addTask(task) {
    if (!(task instanceof Task)) {
      throw new TypeError('addTask expects a Task instance');
    }
    if (!this.users.has(task.ownerId)) {
      throw new Error(`unknown owner: ${task.ownerId}`);
    }
    if (task.assigneeId !== null && !this.users.has(task.assigneeId)) {
      throw new Error(`unknown assignee: ${task.assigneeId}`);
    }
    if (this.tasks.has(task.id)) {
      throw new Error(`task already exists: ${task.id}`);
    }
    this.tasks.set(task.id, task);
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  updateTask(id, patch = {}) {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error('task not found');
    }
    const { status, priority, assigneeId } = patch;

    if (status !== undefined && !TASK_STATUSES.includes(status)) {
      throw new TypeError(
        `invalid status: must be one of ${TASK_STATUSES.join(', ')}`,
      );
    }
    if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
      throw new TypeError(
        `invalid priority: must be one of ${TASK_PRIORITIES.join(', ')}`,
      );
    }
    if (assigneeId !== undefined) {
      if (assigneeId !== null && !isNonEmptyString(assigneeId)) {
        throw new TypeError('assigneeId must be a non-empty string or null');
      }
      if (assigneeId !== null && !this.users.has(assigneeId)) {
        throw new Error(`unknown assignee: ${assigneeId}`);
      }
    }

    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    task.updatedAt = new Date();
    return task;
  }

  listTasks(filters = {}) {
    const { ownerId, assigneeId, status, priority } = filters;
    const results = [];
    for (const task of this.tasks.values()) {
      if (ownerId !== undefined && task.ownerId !== ownerId) continue;
      if (assigneeId !== undefined && task.assigneeId !== assigneeId) continue;
      if (status !== undefined && task.status !== status) continue;
      if (priority !== undefined && task.priority !== priority) continue;
      results.push(task);
    }
    results.sort((a, b) => {
      const r = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (r !== 0) return r;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return results;
  }

  removeTask(id) {
    return this.tasks.delete(id);
  }
}
