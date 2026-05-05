# 🔍 react-review

Four-axis branch review for React and Next.js codebases. Runs focused review passes that produce inline comments, prioritized summaries, and actionable checklists — without making any code changes.

```
/plugin install react-review
```

## Commands

Each command is invoked as a Claude Code slash command after `/plugin install react-review`.

| Command | Focus |
|---|---|
| `/review-arch` | Code quality, TypeScript, React & Next.js patterns |
| `/review-perf` | Rendering efficiency, memoization, data fetching, bundle |
| `/review-a11y` | Accessibility (WCAG 2.1 AA) & responsive behavior |
| `/review-ui` | UI/UX polish, spacing, typography, interactive states |

## Stack assumptions

- **React 18+** with function components and hooks
- **Next.js** App Router (Pages Router checks still apply where relevant) — detected from `package.json`
- **TypeScript** (strict mode preferred)
- **Tailwind CSS** for styling
- **TanStack Query** or **SWR** for data fetching (auto-detected)
- **WCAG 2.1 AA** as the accessibility baseline

For Vue, Svelte, or other frameworks, use the framework's own review tools or fork this pack.

**License:** MIT — see repository [`LICENSE`](../../LICENSE).

## Scope modes (all commands)

Each command accepts an optional argument and auto-detects one of four modes:

| Mode | When to use it | Example |
|---|---|---|
| **Whole branch** | Default — review everything changed | `/review-ui` |
| **Path scope** | Review only files inside a folder/file | `/review-ui apps/web/src/components` |
| **Feature scope** | Review files matching a feature keyword | `/review-ui preview-tab` |
| **Base branch** | Diff against a base other than `main` | `/review-ui develop` |

The command announces which mode it picked at the start of its output.

## Recommended workflow

Run in this order, one per fresh session, for maximum signal:

```
1. /review-arch   → structural issues first
2. /review-perf   → rendering & data-fetching cost
3. /review-a11y   → WCAG & mobile correctness
4. /review-ui     → visual polish last
```

See [PLAN.md](./PLAN.md) for the full workflow including verification steps.

## Pairs well with

- **`nextjs`** (ai-kit pack) — shares conventions, uses the same `@nextjs-architect` vocabulary
- **`tanstack-router`** (ai-kit pack) — query-patterns skill aligns with `/review-perf`'s TanStack Query section
- **`failure-log`** (ai-kit pack) — log recurring review findings as team failures to auto-inject into future sessions
- **`dev-loop`** (ai-kit pack) — run reviews inside autonomous dev loops for self-correcting iteration

## Output shape (every command)

Every command produces a consistent, scannable report:

```
Mode: <whole-branch | path: ... | feature: ... | base: ...>
Reviewed N files in scope. Found X P0, Y P1, Z P2 findings.

---

### File: <path>
- Line <n>: <issue> — <why it matters> — <suggested fix>

---

## 🔴 P0 — Critical
## 🟠 P1 — Important
## 🟡 P2 — Improvements

---

## ✅ Action Checklist
```

If the diff is empty, the command outputs `No changes in scope.` and stops. If no findings meet the criteria, it outputs `Reviewed N files — no findings.` and stops.

## Does not modify code

Every command is review-only. You stay in control of what gets applied. After a review, you can tell Claude Code `"apply the P0 items from the checklist"` in the same session.
