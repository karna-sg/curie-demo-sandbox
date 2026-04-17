import { test } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../src/models/user.js';

test('User: valid construction', () => {
  const u = new User({ name: 'Ada', email: 'ada@example.com' });
  assert.equal(u.name, 'Ada');
  assert.equal(u.email, 'ada@example.com');
  assert.ok(typeof u.id === 'string' && u.id.length > 0);
  assert.ok(u.createdAt instanceof Date);
});

test('User: id is read-only', () => {
  const u = new User({ name: 'Ada', email: 'ada@example.com' });
  assert.throws(() => {
    'use strict';
    u.id = 'new-id';
  });
});

test('User: invalid name throws TypeError', () => {
  assert.throws(
    () => new User({ name: '', email: 'a@b.co' }),
    TypeError,
  );
  assert.throws(
    () => new User({ name: 'x'.repeat(81), email: 'a@b.co' }),
    TypeError,
  );
  assert.throws(() => new User({ name: 123, email: 'a@b.co' }), TypeError);
});

test('User: invalid email throws TypeError', () => {
  assert.throws(() => new User({ name: 'Ada', email: '' }), TypeError);
  assert.throws(() => new User({ name: 'Ada', email: 'no-at' }), TypeError);
  assert.throws(
    () => new User({ name: 'Ada', email: 'missing@tld' }),
    TypeError,
  );
});

test('User: toJSON has expected shape', () => {
  const u = new User({ name: 'Ada', email: 'ada@example.com' });
  const j = u.toJSON();
  assert.deepEqual(Object.keys(j).sort(), [
    'createdAt',
    'email',
    'id',
    'name',
  ]);
  assert.equal(typeof j.createdAt, 'string');
  assert.equal(j.createdAt, u.createdAt.toISOString());
});
