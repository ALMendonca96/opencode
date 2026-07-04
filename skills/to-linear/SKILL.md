---
name: to-linear
description: Use when the user wants to turn a PRD, plan, or spec into Linear issues instead of GitHub Issues. Break the work into vertical slices, map slices to the right repos, create parent and child issues in Linear, and label them appropriately. Do not create branches or PRs.
---

# To Linear

Turn a PRD, plan, or spec into Linear issues and structured implementation slices.

Use this when the user wants planning captured in Linear rather than committed Markdown files or GitHub Issues.

## Core principle

Do **not** simulate issues by committing planning files into the repository unless the user explicitly asks for that.

Prefer:
- Linear issues for tracking
- draft PRs for implementation
- PR descriptions with checklists and acceptance criteria

over:
- committed `docs/issues/*.md`
- committed implementation plans

## Labels

Use the following Linear labels:
- `prd`: parent issue that represents the PRD/plan/spec
- `slice`: child issue representing a vertical implementation slice

These labels must already exist in the Linear workspace.

## Process

### 1. Gather context

Work from whatever is already in the conversation context.

If the user passes a PRD path, plan path, or feature description, read it fully first.

If there are prototypes or previous handoffs, incorporate the decision-rich parts without duplicating stale artifacts.

### 2. Explore the codebase and repo boundaries

Identify:
- which repositories are affected (`web`, `api`, etc.)
- whether the feature should be split across multiple repos
- whether each slice is frontend-only, backend-only, or cross-repo

Use the project's domain glossary vocabulary and respect any ADRs or repository architecture docs.

### 3. Draft vertical slices

Break the work into **tracer bullet** vertical slices.

Rules:
- each slice should be independently implementable or nearly so
- each slice should deliver a narrow end-to-end behavior
- prefer thin slices over broad horizontal phases
- a slice may target one repo or require coordinated work across multiple repos

Each slice should be labeled:
- **AFK**: can be implemented without more human input
- **HITL**: needs human review/decision before or during implementation

### 4. Map slices to Linear issues

Create a parent issue for the PRD and child issues for each slice.

- **Parent issue**: title = PRD title, labels = `prd`
- **Child issues**: title = slice title, labels = `slice`, parent = the PRD issue

For each child issue, include in the description:
- **Type**: HITL / AFK
- **Repos**: which repo(s) this slice touches
- **Blocked by**: other slices or external dependencies
- **User stories covered** if the source material has them
- **Acceptance criteria** as a checklist

Use the Linear issue template below.

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**
- **Type**: HITL / AFK
- **Repos**: which repo(s) this slice touches
- **Blocked by**
- **User stories covered** if the source material has them

Ask the user:
- Does the granularity feel right?
- Are the repo boundaries correct?
- Should any slices be merged or split?
- Should any AFK slices be marked HITL?

Do not create issues in Linear until the user approves the breakdown.

### 6. Create Linear issues

After approval:

1. Create the parent issue with label `prd`
2. Create each child issue with label `slice`, linked to the parent
3. Set acceptance criteria in each child issue description
4. Do not create branches or PRs

If Linear access is unavailable, return:
- the proposed issue titles
- the parent/child structure
- a ready-to-paste issue description for each

## Linear issue template

### Parent (PRD)

```
Title: <PRD title>
Labels: prd

## Description
<PRD summary or link to the PRD document>

## Slices
- <child issue 1>
- <child issue 2>
- <child issue 3>
```

### Child (Slice)

```
Title: <slice title>
Labels: slice
Parent: <PRD issue identifier>

## Context

Reference the parent PRD, plan, or source artifact.

## What this slice implements

Describe the end-to-end behavior for this slice. Focus on externally visible behavior, not layer-by-layer internals.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- <issue or slice reference>, if any

Or: None - can start immediately

## Notes

- Mention whether this slice is AFK or HITL.
- Mention paired repo dependency if another repo must land with it.
```

## Output expectations

When the work is done, return:
- approved slice list
- Linear parent issue identifier
- Linear child issue identifiers
- any blockers preventing issue creation

## Constraints

- Do not create GitHub Issues unless the user explicitly asks for both Linear and GitHub issues.
- Do not commit planning files into the repository unless explicitly requested.
- Do not create branches or PRs.
- Do not modify production code unless the user explicitly asks to begin implementation.
- Do not guess target repos or base branches; inspect them first.
