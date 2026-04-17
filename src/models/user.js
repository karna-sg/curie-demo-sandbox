import { generateId } from '../utils/ids.js';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validateName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('User.name must be a non-empty string');
  }
  if (name.length > 80) {
    throw new TypeError('User.name must be at most 80 characters');
  }
}

function validateEmail(email) {
  if (typeof email !== 'string' || email.length === 0) {
    throw new TypeError('User.email must be a non-empty string');
  }
  if (!EMAIL_RE.test(email)) {
    throw new TypeError('User.email must be a valid email address');
  }
}

export class User {
  constructor({ name, email } = {}) {
    validateName(name);
    validateEmail(email);
    Object.defineProperties(this, {
      id: { value: generateId(), enumerable: true },
      name: { value: name, enumerable: true },
      email: { value: email, enumerable: true },
      createdAt: { value: new Date(), enumerable: true },
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
