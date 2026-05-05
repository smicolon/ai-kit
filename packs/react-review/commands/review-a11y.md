---
description: Review the current branch for accessibility (WCAG 2.1 AA) and responsive behavior in a React/Next.js codebase. Supports whole-branch review or scoped review by path, feature, or base branch.
argument-hint: "[optional: path | feature-name | base-branch]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git branch:*), Bash(git ls-files:*), Read, Glob, Grep
---

You are reviewing the current branch for **accessibility (a11y) and responsive behavior ONLY**. Ignore architecture and visual polish unless they directly cause an a11y or responsiveness issue.

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

Also check for changes to global styles, layout primitives, or anything affecting breakpoints.

## Step 2 — Evaluate each changed component

**Accessibility**
- **Semantic HTML** — correct element used (`button` vs `div`, `nav`, `main`, `section`, proper heading levels)?
- **ARIA** — used only when semantics are insufficient, and used correctly?
- **Keyboard navigation**
  - All interactive elements reachable by Tab?
  - Focus order logical?
  - Focus visible (no `outline: none` without replacement)?
  - Escape closes modals/popovers, Enter/Space activates buttons?
- **Focus management** — trapped in modals, restored on close, moved on route change (React Router / Next.js navigation)?
- **Labels** — every input programmatically labeled (`htmlFor` + `id`), not just placeholder?
- **Color contrast** — WCAG AA (4.5:1 body, 3:1 large text)?
- **Motion** — respects `prefers-reduced-motion`?
- **Images** — `alt` text meaningful, or empty for decorative? Next.js `<Image>` has `alt`?
- **Dynamic content** — live regions (`aria-live`) for async updates where appropriate?
- **Icon-only buttons** — have accessible names (`aria-label` or visually-hidden text)?

**React-specific a11y patterns**
- `onClick` handlers on non-interactive elements (`div`/`span`) — replace with `button`, or add `role` + keyboard handlers?
- Keyboard handlers paired with click handlers (not click-only)?
- `tabIndex="0"` only where needed (not on every interactive element, which breaks natural tab order)?
- `React.forwardRef` used on interactive components so parents can manage focus?
- Conditional rendering that removes focused elements — focus moved somewhere sensible before removal?

**Responsiveness**
- **Breakpoints** — consistent with Tailwind config, not ad-hoc?
- **Touch targets** — at least 44×44px on mobile?
- **Overflow** — long text/URLs/names don't break layout?
- **Horizontal scroll** — none on standard mobile widths (≥320px)?
- **Images/media** — using Next.js `<Image>` with proper `sizes`, or responsive `srcset`?
- **Fixed/sticky elements** — behave correctly on small viewports and with on-screen keyboards?
- **Grids/flex** — wrap gracefully, no orphans?
- **Forms** — usable on mobile (`inputMode`, `autoComplete`, `font-size ≥ 16px` on inputs to prevent iOS zoom)?
- **i18n expansion** — translated text doesn't break layouts (German ~+30% longer, compound words, RTL mirroring if relevant)?

## Step 3 — No-findings case

- If the scoped diff is empty: output `No changes in scope.` and stop.
- If the diff is non-empty but no findings meet P0/P1/P2 criteria: output `Reviewed N files — no findings.` and stop.

## Step 4 — Produce three outputs

Separate Output A from Output B with a `---` horizontal rule. Separate Output B from Output C with another `---`.

### Output A — Inline comments per file

Use `### File: <path>` (markdown H3) per file, then a bullet list of findings:

```
### File: <path>
- Line <n>: <issue> — <WCAG criterion or responsive concern> — <suggested fix>
```

Cite the WCAG success criterion number when relevant (e.g. "WCAG 2.4.7 Focus Visible"). No nested code fences inside bullets.

### Output B — Prioritized summary

Use these exact section headings:

- `## 🔴 P0 — Critical` — blocks users with disabilities or on mobile: keyboard traps, missing labels, contrast failures, layout breaks under 375px.
- `## 🟠 P1 — Important` — significant degradation: missing focus styles, non-semantic interactives, awkward tap targets.
- `## 🟡 P2 — Improvements` — refinements: minor ARIA improvements, motion preferences, edge-case breakpoints.

Each bullet: one-line description ending with `(file:line)` reference.

### Output C — Action checklist

Heading: `## ✅ Action Checklist`. Markdown bullet list ordered by priority. Each item starts with a verb ("Add label to", "Replace div with button", "Increase contrast of").

**Do not make any code changes. Review only.**
