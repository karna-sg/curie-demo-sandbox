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

```js
import { greet } from "./src/greet.js";

greet("jane doe"); // => "Hello, Jane Doe!"
```

```js
import { isValidName } from "./src/validators.js";

isValidName("Anne-Marie"); // => true
isValidName("Jane1");      // => false
```

## Enviornment

The agent runs in a git worktree under `/tmp/curie-worktrees/`,
isolated from the main checkout. See `../curiescious/automation-gateway/docs/DEMO_RUNBOOK.md`
for the full operational runbook.
