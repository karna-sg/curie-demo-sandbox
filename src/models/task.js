import { generateId } from '../utils/ids.js';

export const TASK_STATUSES = Object.freeze(['todo', 'in_progress', 'done', 'cancelled']);
export const TASK_PRIORITIES = Object.freeze(['low', 'medium', 'high', 'urgent']);

function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

function validateTitle(title) {
  if (!isNonEmptyString(title)) {
    throw new TypeError('Task.title must be a non-empty string');
  }
  if (title.length > 200) {
    throw new TypeError('Task.title must be at most 200 characters');
  }
}

function validateDescription(description) {
  if (typeof description !== 'string') {
    throw new TypeError('Task.description must be a string');
  }
  if (description.length > 2000) {
    throw new TypeError('Task.description must be at most 2000 characters');
  }
}

function validateOwnerId(ownerId) {
  if (!isNonEmptyString(ownerId)) {
    throw new TypeError('Task.ownerId must be a non-empty string');
  }
}

function validatePriority(priority) {
  if (!TASK_PRIORITIES.includes(priority)) {
    throw new TypeError(
      `Task.priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
    );
  }
}

function validateAssigneeId(assigneeId) {
  if (assigneeId === null) return;
  if (!isNonEmptyString(assigneeId)) {
    throw new TypeError('Task.assigneeId must be a non-empty string or null');
  }
}

function validateStatus(status) {
  if (!TASK_STATUSES.includes(status)) {
    throw new TypeError(
      `Task.status must be one of: ${TASK_STATUSES.join(', ')}`,
    );
  }
}

export class Task {
  constructor({
    title,
    description = '',
    ownerId,
    priority = 'medium',
    assigneeId = null,
  } = {}) {
    validateTitle(title);
    validateDescription(description);
    validateOwnerId(ownerId);
    validatePriority(priority);
    validateAssigneeId(assigneeId);

    const now = new Date();
    this.id = generateId();
    this.title = title;
    this.description = description;
    this.status = 'todo';
    this.priority = priority;
    this.ownerId = ownerId;
    this.assigneeId = assigneeId;
    this.createdAt = now;
    this.updatedAt = now;
  }

  setStatus(newStatus) {
    validateStatus(newStatus);
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  setPriority(newPriority) {
    validatePriority(newPriority);
    this.priority = newPriority;
    this.updatedAt = new Date();
  }

  assign(assigneeId) {
    if (!isNonEmptyString(assigneeId)) {
      throw new TypeError('assigneeId must be a non-empty string');
    }
    this.assigneeId = assigneeId;
    this.updatedAt = new Date();
  }

  unassign() {
    this.assigneeId = null;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      ownerId: this.ownerId,
      assigneeId: this.assigneeId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
