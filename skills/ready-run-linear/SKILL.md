---
name: ready-run-linear
description: Use when the user wants to execute an already planned ready-for-agent wave on a shared PRD branch per repo, implement the issues incrementally, push the branch, and open or update draft PRs without ever working directly on main.
---

# Ready Run (Linear)

This skill is the execution half of a Sandcastle-style issue runner adapted to opencode, using Linear as the issue tracker.

Use it to execute a wave that has already been planned.

Its job is to implement issues on isolated branches for review, while preserving the distinction between:
- issue completion
- safe integration of a coherent wave

Assume the preferred workflow is:
- one shared branch per PRD in each repo
- same branch name across repos when applicable
- multiple issues implemented incrementally on that branch
- merge to `main` only after the branch is coherent and reviewed

Within that workflow, earlier issues already implemented on the active PRD branch count as satisfied prerequisites for later issues on the same branch.

## Core rules

- Never work directly on `main`.
- Never merge automatically.
- Work on the shared PRD branch for the target repo unless the user explicitly asks for a different structure.
- Every completed issue should end in a draft PR for human review.
- Only execute the issues the user asked for in the current wave.
- Do not assume a finished issue is ready to merge by itself.

## Issue dispatch state machine

Use these Linear labels as workflow states:
- `ready-for-agent`: eligible for pickup
- `agent-in-progress`: currently being executed by an agent
- `awaiting-review`: implementation finished and waiting for human review

These labels track implementation state, not final integration safety.

### Before starting an issue
Confirm all of these:
- issue is open (not Canceled or Done)
- issue has label `ready-for-agent`
- issue does **not** have label `agent-in-progress`
- issue does **not** have label `awaiting-review`
- there is no open PR or draft PR already linked to it
- it is not already being handled on the active PRD branch

If any of the above fails, do not execute the issue.

## Integration-wave rule

If the current wave was planned as a coherent integration batch, keep that assumption intact.

That means:
- it is valid to implement issues separately
- they may still land on the same PRD branch
- downstream work should not assume the batch is unblocked until human review decides the wave is safe to integrate

## PRD-branch baseline rule

If the active PRD branch already contains the root dependency work, continue from that branch state.

Do **not** stop and demand a merge to `main` just to keep executing the PRD sequence.

## Expected input

The user should provide one of:
- a wave description from `ready-plan-linear`
- a repo plus explicit Linear issue identifiers
- a concise instruction naming the runnable issues to execute now
- optionally, the PRD branch name to continue or create

If the runnable set is ambiguous, clarify before implementation.

## Process

### 1. Fetch issue details

Read the selected issue(s) fully using Linear tools:
- title
- description
- acceptance criteria
- comments when needed

Confirm that blockers are already satisfied before execution.

Blockers may be satisfied either by:
- `main`, or
- the active PRD branch baseline

If the blocker is already present on the active PRD branch, continue.

### 2. Create review branches

For the target repo:
- detect or confirm the PRD branch to use
- if it does not exist, create it from the default branch
- if it already exists, continue on it

If the branch already contains earlier prerequisite work, treat that as the baseline for the next issue in the same PRD sequence.

For each issue:
- add label `agent-in-progress` before implementation begins
- inspect the repo default branch
- ensure the working tree is safe
- work only within the shared PRD branch

Recommended naming pattern:
- `prd/<short-slug>`
- use the same branch name across repos when the PRD spans both repos

### 3. Implement safely

For each issue implemented on the PRD branch:
- implement only that issue's scope
- run focused verification
- do one review pass
- commit only intended changes
- push the PRD branch
- create or update the draft PR for that PRD branch if the user wants PR tracking before final integration

Use parallel subagents only when issues are independent and overlap risk is low.

### 4. Update Linear labels after draft PR

After updating branch state for the issue:
- remove label `agent-in-progress`
- add label `awaiting-review`
- optionally remove label `ready-for-agent` if it is still present

Do not mark downstream issues as unblocked just because this PR exists.

Treat draft PR creation as:
- implementation complete for this issue
- awaiting review for this issue
- not necessarily integration-complete for the broader wave

If execution fails before PR creation:
- remove label `agent-in-progress` before exiting unless there is a deliberate reason to keep the lock
- report the failure clearly

### 5. Draft PR handoff

Each draft PR should:
- reference the Linear issue
- summarize the implemented behavior
- include acceptance criteria checklist
- state that it awaits human review

If one PRD branch contains multiple completed issues, the draft PR should summarize the branch state clearly and list the implemented Linear issue references.

## Draft PR template

```md
## Context

Closes <linear-issue-identifier>

## What was implemented

Short end-to-end summary of the delivered behavior.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Notes for review

- Draft PR created by agent workflow
- Not merged automatically
```

## Output expectations

Return only:
- issues executed
- PRD branches created or reused
- PR URLs created or updated
- verification/review status
- blockers for the next wave
- whether the completed work is only review-ready or also integration-ready as a batch

## Constraints

- Do not touch `main` directly.
- Do not merge PRs automatically.
- Do not create planning files inside the repo unless explicitly requested.
- Do not execute blocked issues early.
- Do not re-run an issue that already has an execution branch or open PR unless the user explicitly asks for retrabalho.
- Do not treat individual issue completion as sufficient reason to unlock dependent waves unless the planned integration boundary says so.
- Prefer the existing PRD branch workflow over per-issue branch creation.
- Do not require merge to `main` before executing the next issue when the dependency is already satisfied on the active PRD branch.
