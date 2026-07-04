---
name: ready-plan-linear
description: Use when the user wants a fresh-session planning pass that fetches Linear issues labeled ready-for-agent, resolves dependencies, and groups runnable work into parallel execution waves without implementing yet.
---

# Ready Plan (Linear)

This skill is the planning half of a Sandcastle-style issue runner adapted to opencode, using Linear as the issue tracker.

Its job is not just to find runnable issues, but to organize them into **safe integration waves** inside a shared PRD branch workflow.

An issue can be ready for implementation without being safe to merge alone.

Assume the preferred workflow is:
- one shared branch per PRD in each affected repo
- same branch name across repos when the PRD spans multiple repos
- multiple issues implemented incrementally on those PRD branches
- merge to `main` only after the PRD branch is coherent and reviewed

Within that workflow, dependency satisfaction should be evaluated against the **active PRD branch baseline**, not only against `main`.

Use it to:
- fetch open Linear issues labeled `ready-for-agent`
- read their dependencies from issue bodies/comments
- build an execution graph
- group runnable work into safe parallel waves
- distinguish implementation readiness from integration readiness
- map issues into execution order within the PRD branch, not one branch per issue
- stop before implementation

## Issue dispatch state machine

Treat issue selection as a state machine, not just a label search.

Also treat execution in three layers:
- **planning unit**: the PRD
- **implementation unit**: the individual issue
- **integration unit**: the PRD branch or the smallest coherent wave within it that can safely move toward merge

### Eligible now
- issue is open (not Canceled or Done)
- has label `ready-for-agent`
- does **not** have label `agent-in-progress`
- does **not** have label `awaiting-review`

### Exclude from planning/reruns
- issue has label `agent-in-progress`
- issue has label `awaiting-review`
- issue already has an open PR or draft PR linked to it
- issue already appears to be in progress on the active PRD branch workflow

If labels and Git state disagree, prefer the more conservative interpretation and keep the issue out of the runnable wave until clarified.

## Integration-wave rule

Do not assume that one issue equals one safe merge.

In multi-repo or contract-sensitive work, a wave may contain multiple issues that:
- can be implemented separately
- can be reviewed separately
- but should only be considered **integration-ready together**

When planning, explicitly identify:
- issues that can be implemented now
- issues that belong to the same safe integration wave
- issues that should not unblock downstream work until the wave is reviewed and integrated coherently

## PRD-branch baseline rule

If a root dependency is already implemented on the active PRD branch, treat it as satisfied for subsequent waves inside that same PRD workflow.

Do **not** require merge to `main` just to continue the next issue or wave inside the same PRD branch.

Require merge to `main` only when:
- the next work depends on a different integration line, or
- the user explicitly wants planning against mainline state only.

## Core rules

- Do not implement anything.
- Do not create branches.
- Do not open PRs.
- Keep the session lean: fetch only the issues needed to construct the graph.
- Prefer explicit waves over vague sequencing.

## Process

### 1. Discover target repo(s)

Infer the target from:
- the current repo, or
- explicit repo arguments provided by the user.

If multiple repos are involved, plan them separately unless there are explicit cross-repo blockers.

### 2. Fetch ready issues

Use Linear tools/API to fetch open issues labeled `ready-for-agent`.

Also check for exclusion signals:
- label `agent-in-progress`
- label `awaiting-review`
- open PRs / draft PRs referencing the PRD branch or issue set
- evidence the issue is already being handled in the current PRD branch workflow

Also check for branch-baseline satisfaction signals:
- existing PRD branch with prior dependent work already implemented
- open PR / draft PR for the PRD branch containing the root dependency
- explicit user statement that the dependency already lives on the shared branch

Read:
- title
- description
- comments when needed
- labels

Extract:
- what to build
- acceptance criteria
- blocked-by references
- repo ownership and likely overlap areas
- dispatch state
- rerun risk
- whether the issue is safe to merge alone or should be merged as part of a wave
- whether the issue belongs to the current PRD branch sequence
- whether its blockers are satisfied by `main` or by the current PRD branch baseline

### 3. Build the dependency graph

Construct execution order from `Blocked by` references.

Rules:
- only issues with no unmet blockers can enter the current wave
- group independent work into the same wave
- keep potentially overlapping issues in the same repo out of parallel execution unless overlap risk is low
- identify cross-repo coordination points clearly
- prefer waves that form a coherent integration boundary rather than unlocking work via half-finished merges
- prefer grouping by what can progress safely on the shared PRD branch in each repo

When evaluating blockers:
- a blocker satisfied on the active PRD branch counts as satisfied for subsequent work on that branch
- do not insist on mainline merge before continuing the same PRD branch sequence

### 4. Produce waves

Return a concise wave plan like:
- Wave 1: issues A, B
- Wave 2: issue C
- Wave 3: issues D, E

For each issue show:
- title
- repo
- whether it can run in parallel in that wave
- blockers already satisfied or still pending

For each wave show:
- whether it is only **implementation-ready** or also **integration-ready**
- whether the issues in the wave are safe to merge independently or should be reviewed as a coherent batch
- whether the wave belongs on the current PRD branch in one repo or in paired PRD branches across repos
- whether its prerequisites are satisfied by `main` or by the PRD branch baseline

### 5. Recommend next execution input

End with a minimal handoff for the execution step:
- the current runnable wave
- exact repo + issue list
- any overlap warnings
- any wave-level merge warnings
- suggested PRD branch name to use across repos

If the branch baseline already satisfies the root dependency, say that explicitly and do not instruct the user to merge first.

## Output expectations

Return only:
- repo-by-repo dependency summary
- execution waves
- recommended next wave to run
- integration warnings
- any ambiguity or blocker that needs human input

## Constraints

- Do not touch `main`.
- Do not create branches or PRs.
- Do not implement blocked issues early.
- Never propose an issue for execution if it looks already in progress or already awaiting review.
- Never equate issue completion with safe merge unless the wave is coherent enough to integrate.
- Prefer continuing work on an existing PRD branch over inventing per-issue branches.
- Never require a merge to `main` merely to continue work that is already intentionally staged on the active PRD branch.
