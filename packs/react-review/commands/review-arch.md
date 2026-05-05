---
description: Review the current branch for code quality, TypeScript, and React/Next.js patterns. Supports whole-branch review or scoped review by path, feature, or base branch.
argument-hint: "[optional: path | feature-name | base-branch]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git branch:*), Bash(git ls-files:*), Read, Glob, Grep
---

You are reviewing the current branch for **code quality and architecture ONLY**. Ignore visual polish and accessibility — focus on how the code is structured, typed, and maintained.

## Step 0 — Interpret the scope

User argument: `$ARGUMENTS`

Classify into one of four modes. The first two lines of your output MUST be:

```
Mode: <whole-branch | path: <p> | feature: <name> | base: <branch>>
Reviewed N files in scope. Found X P0, Y P1, Z P2 findings.
```

- **Mode A — Whole branch** (empty): Review everything changed vs `main`.
- **Mode B — Path scope** (contains `/` or a known extension, or matches `git ls-files $ARGUMENTS`): Review only changes inside that path.
- **Mode C — Feature scope** (single bareword): Find files related via `git ls-files | grep -i <feature>`, intersect with branch diff.
- **Mode D — Base branch** (matches a real branch): Review against that base instead of `main`.

Ambiguous → prefer branch if `git branch -a` confirms.

## Step 1 — Scope the diff

Based on the mode:
- **A**: `git diff main...HEAD --stat`
- **B**: `git diff main...HEAD --stat -- <path>`
- **C**: Compute the file list from the feature match, diff each relevant file.
- **D**: `git diff <base>...HEAD --stat`

Also run `git log <base>..HEAD --oneline` to understand commit history and author intent.

## Step 2 — Read in layers

- Read new/modified components and hooks in full.
- Read their direct consumers to understand how the API is used (for context, don't comment on them).
- Note any cross-package imports in monorepos — package boundaries deserve extra scrutiny.

## Step 3 — Evaluate against these criteria

**Component design**
- Single responsibility — is the component doing one thing?
- Prop API — minimal, well-typed, no boolean explosions, sensible defaults?
- Composition over configuration (children / slots / render props) where it makes the API simpler?

**TypeScript**
- `any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error` without justification?
- `@ts-expect-error` / `@ts-ignore` without an adjacent comment explaining the suppression — silent debt.
- Discriminated unions for variant-like props/states?
- Generics constrained properly?
- Return types explicit on exported functions and hooks?

**React patterns**
- Rules of hooks followed? Custom hooks named `useX`?
- `useEffect` justified — could this be event-driven, derived state, or computed during render?
- Derived state stored in `useState` + synced via `useEffect` (anti-pattern — compute during render instead)?
- Keys stable and meaningful (not array index for reorderable lists)?
- `useMemo` / `useCallback` intentional, not cargo-culted?
- Refs used for DOM, not for state that should re-render?
- Context splits — one giant context causing unrelated consumers to re-render?
- Component/hook boundary — is this logic extractable to a custom hook for reuse and testability?

**Next.js patterns** (only if Next.js is detected)
- Server/client component boundaries — `"use client"` only where needed (narrow the boundary)?
- Data fetching in server components vs client queries — chosen appropriately?
- Route handlers typed properly? Input validation (e.g. Zod) on request bodies?
- `dynamic()` imports for heavy client-only components?
- Metadata API used correctly for SEO-relevant pages?

**State management**
- Right tool for the job (local state vs context vs TanStack Query vs URL state vs Zustand/Redux)?
- Derived state computed, not stored?
- Effects justified — could this be event-driven instead?

**Data flow**
- Loading, error, empty, success states all explicit?
- Optimistic updates clean?
- Query/cache keys structured consistently?

**Reusability & duplication**
- New code duplicating existing utilities/components?
- Opportunities to lift into a shared package/module?

**Testing & types**
- Are new components testable? Tight coupling preventing it?
- Public package exports properly typed?

## Step 4 — No-findings case

- If the scoped diff is empty: output `No changes in scope.` and stop.
- If the diff is non-empty but no findings meet P0/P1/P2 criteria: output `Reviewed N files — no findings.` and stop.

## Step 5 — Produce three outputs

Separate Output A from Output B with a `---` horizontal rule. Separate Output B from Output C with another `---`.

### Output A — Inline comments per file

Use `### File: <path>` (markdown H3) per file, then a bullet list of findings:

```
### File: <path>
- Line <n>: <issue> — <why it matters> — <suggested refactor>
```

No nested code fences inside bullets. One bullet per finding.

### Output B — Prioritized summary

Use these exact section headings:

- `## 🔴 P0 — Critical` — bugs / correctness risks: race conditions, stale closures, broken types masking errors, missing cleanup, memory leaks.
- `## 🟠 P1 — Important` — maintainability debt: duplication, unclear boundaries, missing error states, inappropriate React primitives.
- `## 🟡 P2 — Improvements` — style & consistency: naming, file organization, minor refactors.

Each bullet: one-line description ending with `(file:line)` reference.

### Output C — Action checklist

Heading: `## ✅ Action Checklist`. Markdown bullet list ordered by priority. Each item starts with a verb ("Extract", "Type", "Remove", "Replace").

**Do not make any code changes. Review only.**
