---
description: Review the current branch for UI/UX and visual polish in a React/Next.js codebase. Supports whole-branch review or scoped review by path, feature, or base branch.
argument-hint: "[optional: path | feature-name | base-branch]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git branch:*), Bash(git ls-files:*), Read, Glob, Grep
---

You are reviewing the current branch for **UI/UX and visual polish ONLY**. Ignore code architecture and accessibility unless a visual issue stems from them directly.

## Step 0 — Interpret the scope

User argument: `$ARGUMENTS`

Classify `$ARGUMENTS` into one of four modes. The first two lines of your output MUST be:

```
Mode: <whole-branch | path: <p> | feature: <name> | base: <branch>>
Reviewed N files in scope. Found X P0, Y P1, Z P2 findings.
```

- **Mode A — Whole branch** (empty): Review everything changed vs `main`.
- **Mode B — Path scope** (contains `/` or a known extension like `.tsx`/`.ts`/`.css`, or matches `git ls-files $ARGUMENTS`): Review only changes inside that path.
- **Mode C — Feature scope** (single bareword like `auth`, `preview`, `env-setup`): Find files related to that feature via `git ls-files | grep -i <feature>` and `glob`/`grep`, intersect with the branch diff. Review only those files. If nothing matches, stop and ask the user to clarify.
- **Mode D — Base branch** (matches a real branch via `git branch -a`): Review current branch vs that base instead of `main`.

If the argument is ambiguous, prefer the branch interpretation if `git branch -a` confirms it exists.

## Step 1 — Scope the diff

Based on the mode:
- **A**: `git diff main...HEAD --stat`
- **B**: `git diff main...HEAD --stat -- <path>`
- **C**: Compute the file list from the feature match, diff each relevant file.
- **D**: `git diff <base>...HEAD --stat`

List modified UI files (components, styles, pages, stories). Skip unchanged files entirely.

## Step 2 — Inspect each changed file

For every changed component/style file in scope:
- Read the file in full.
- If a parent or sibling component is needed for context, read it but do not comment on it.
- Evaluate against:
  - **Visual hierarchy** — is the most important element the most prominent?
  - **Spacing rhythm** — consistent Tailwind spacing scale (or project's design tokens), no magic pixel values?
  - **Typography** — consistent font sizes, weights, line-heights?
  - **Color usage** — design tokens vs arbitrary hex? Dark-mode parity if applicable?
  - **Interactive states** — hover, focus, active, disabled, loading, empty, error all handled?
  - **Motion** — transitions feel purposeful? Respects `prefers-reduced-motion`?
  - **Iconography** — consistent stroke/weight, aligned with text baseline?
  - **Density** — right level of cramped/airy for the context?
  - **Edge cases** — long text, zero-state, large numbers, RTL if relevant?

## Step 3 — No-findings case

- If the scoped diff is empty: output `No changes in scope.` and stop.
- If the diff is non-empty but no findings meet P0/P1/P2 criteria: output `Reviewed N files — no findings.` and stop.

## Step 4 — Produce three outputs

Separate Output A from Output B with a `---` horizontal rule. Separate Output B from Output C with another `---`.

### Output A — Inline comments per file

Use `### File: <path>` (markdown H3) per file, then a bullet list of findings:

```
### File: <path>
- Line <n>: <observation> — <why it matters> — <suggested fix>
```

Be specific and actionable. No vague "consider improving styling." No nested code fences inside bullets.

### Output B — Prioritized summary

Use these exact section headings:

- `## 🔴 P0 — Critical` — broken / ships wrong: overlapping elements, invisible focus ring, unreadable contrast.
- `## 🟠 P1 — Important` — polish gaps users will notice: inconsistent spacing, missing hover states, jumpy layouts.
- `## 🟡 P2 — Improvements` — nice-to-have: subtle alignment, motion timing, icon weight.

Each bullet: one-line description ending with `(file:line)` reference.

### Output C — Action checklist

Heading: `## ✅ Action Checklist`. Markdown bullet list ordered by priority, pasteable into a PR description. Each item starts with a verb ("Fix", "Align", "Replace", "Add").

**Do not make any code changes. Review only.**
