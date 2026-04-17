# Curie Demo Sandbox

A disposable sandbox repo used to demo the Curiescious IMPLEMENT
workflow. When a Jira ticket is assigned to `@curie-agent`, the gateway
creates a worktree here, runs an implementor agent, and opens a PR.

## Intentionally-trivial seed content

This repo has a few rough edges on purpose so that the agent has
something to do during a demo:

- A misspelling in this README (see "enviornment" below).
- A placeholder function in `src/greet.js` that returns the wrong string.
- No tests yet — a great first ticket.

## Usage

The repo ships an in-memory task management library. Import it from
`./index.js`:

### Hello world

```javascript
import { TaskService } from './index.js';

const svc = new TaskService();
const ada = svc.registerUser({ name: 'Ada', email: 'ada@example.com' });
const task = svc.createTask({
  title: 'Write the docs',
  ownerId: ada.id,
  priority: 'high',
});

svc.startTask(task.id);
svc.completeTask(task.id);

console.log(task.toJSON());
```

### Filtering

```javascript
import { TaskService } from './index.js';

const svc = new TaskService();
const owner = svc.registerUser({ name: 'Ada', email: 'ada@example.com' });
const worker = svc.registerUser({ name: 'Bo', email: 'bo@example.com' });

svc.createTask({
  title: 'Urgent bug',
  ownerId: owner.id,
  priority: 'urgent',
  assigneeId: worker.id,
});
svc.createTask({
  title: 'Nice-to-have',
  ownerId: owner.id,
  priority: 'low',
  assigneeId: worker.id,
});

const open = svc.listOpenTasksForUser(worker.id);
console.log(open.map((t) => `${t.priority}: ${t.title}`));
// → ['urgent: Urgent bug', 'low: Nice-to-have']
```

## Enviornment

The agent runs in a git worktree under `/tmp/curie-worktrees/`,
isolated from the main checkout. See `../curiescious/automation-gateway/docs/DEMO_RUNBOOK.md`
for the full operational runbook.
