---
description: Review the current branch for rendering performance, memoization, data fetching, and bundle impact in a React/Next.js codebase. Supports whole-branch review or scoped review by path, feature, or base branch.
argument-hint: "[optional: path | feature-name | base-branch]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git branch:*), Bash(git ls-files:*), Read, Glob, Grep
---

You are reviewing the current branch for **performance and rendering efficiency ONLY**. Ignore visual polish and accessibility. Overlap with `/review-arch` is fine for issues with direct performance consequences, but don't re-raise pure architecture nits.

## Step 0 — Interpret the scope and detect the data-fetching library

User argument: `$ARGUMENTS`

Classify into one of four modes. Check `package.json` for the data-fetching library (TanStack Query, SWR, Apollo, or native fetch). The first two lines of your output MUST be:

```
Mode: <whole-branch | path: <p> | feature: <name> | base: <branch>> | Data fetcher: <tanstack-query | swr | apollo | native-fetch | none>
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

List modified components, hooks, and any `package.json` / lockfile / config changes (those affect bundle size).

## Step 2 — Evaluate each changed file

**Rendering efficiency**
- **Unnecessary re-renders** — inline object/array/function props passed to memoized children? New reference on every render?
- **Memoization correctness** — `React.memo`, `useMemo`, `useCallback` used where it actually helps (stable props to expensive children, expensive computation), or cargo-culted where it's dead weight?
- **Derived state** — stored in `useState` + synced via `useEffect` instead of computed during render?
- **Effects** — running too often? Missing dependencies? Doing work that should be event-driven?
- **Keys** — stable and meaningful (not index for dynamic/reorderable lists)?
- **Context splits** — one giant context causing unrelated consumers to re-render?
- **Expensive children** — rendered unconditionally when they could be gated?

**Render-tree weight**
- **Component size** — single component doing too much rendering work? Candidate to split?
- **Unbounded lists** — rendering N items where N can be large, without virtualization (`react-window`, `@tanstack/react-virtual`)?
- **Heavy computation in render** — sorting, filtering, transforming large arrays on every render without `useMemo`?
- **Code splitting** — route/modal/tab components that should be `React.lazy` + `Suspense` or Next.js `dynamic()`?

**Next.js-specific** (only if Next.js is detected)
- **Server/client boundary** — client components kept small; server components doing the heavy work?
- **`"use client"` placement** — at the leaf, not the root (pushing the boundary down keeps more work on the server)?
- **`next/image`** — used for all raster images, with appropriate `sizes` and `priority` on LCP?
- **`next/font`** — used for web fonts (avoids layout shift, no extra network roundtrip)?
- **`next/dynamic`** — used for heavy client-only deps (charts, editors, maps)?
- **App Router caching** — `fetch` calls have intentional `cache` / `next.revalidate` options (not defaulting unintentionally)?
- **Route segment config** — `dynamic`, `revalidate`, `runtime` set where non-default behavior is needed?

**Data fetching** — apply the section matching the detected library

*TanStack Query*
- Query keys consistent shape? Granular enough for proper cache hits?
- `staleTime` / `gcTime` set intentionally, or defaulting to refetch-on-every-mount?
- Duplicate requests — same data fetched from multiple places instead of sharing the cache?
- Waterfalls — sequential dependent queries that could be parallelized or prefetched?
- Over-fetching — fetching whole lists when a `select` could narrow the payload?
- `refetchOnWindowFocus` / `refetchOnMount` defaults appropriate for this data?

*SWR*
- Keys stable? Conditional fetching (`key === null`) used to defer requests?
- `dedupingInterval` appropriate?
- `revalidateOnFocus` / `revalidateOnReconnect` tuned for the data type?

*Native fetch in client components*
- Wrapped in a cache/dedup layer or fired unconditionally on mount?
- AbortController used for cleanup on unmount?
- Loading/error states handled explicitly (not just `.then` without `.catch`)?

**Bundle & assets**
- **New dependencies** — check `package.json` diff. Any heavyweight libs added (moment.js, full lodash, large UI kits)?
- **Import style** — tree-shakable imports (`import { x } from 'lib'`) vs namespace imports (`import * as _`)?
- **Icons** — individual imports vs full icon-set import (e.g. `lucide-react` named imports, not default export)?
- **Dynamic imports** — heavy client-only deps behind `React.lazy` / `next/dynamic`?

**Network & runtime**
- **Debounce / throttle** — user-typed inputs triggering fetches without debouncing?
- **Stable effect deps** — dependency arrays contain new references each render, causing the effect to run every time?

## Step 3 — No-findings case

- If the scoped diff is empty: output `No changes in scope.` and stop.
- If the diff is non-empty but no findings meet P0/P1/P2 criteria: output `Reviewed N files — no findings.` and stop.

## Step 4 — Produce three outputs

Separate Output A from Output B with a `---` horizontal rule. Separate Output B from Output C with another `---`.

### Output A — Inline comments per file

Use `### File: <path>` (markdown H3) per file, then a bullet list of findings:

```
### File: <path>
- Line <n>: <issue> — <measurable impact if estimable> — <suggested fix>
```

Where possible, quantify ("re-renders N children on every keystroke", "adds ~40KB to bundle"). When you can't measure, say so rather than guessing. No nested code fences inside bullets.

### Output B — Prioritized summary

Use these exact section headings:

- `## 🔴 P0 — Critical` — measurable perf regression or broken pattern: unbounded list without virtualization, re-render cascade on typing, missing `staleTime` on a hot query, namespace import of a 200KB lib, `"use client"` at the root of a page.
- `## 🟠 P1 — Important` — noticeable inefficiency: missing memoization on an expensive child, inline prop on a memoized component, suboptimal query keys, missing `next/image`.
- `## 🟡 P2 — Improvements` — micro-optimizations: could be lazy-loaded, could narrow `select`, minor dep cleanup.

Each bullet: one-line description ending with `(file:line)` reference + estimated impact when known.

### Output C — Action checklist

Heading: `## ✅ Action Checklist`. Markdown bullet list ordered by priority. Each item starts with a verb ("Memoize", "Virtualize", "Lazy-load", "Add staleTime to", "Replace namespace import of").

**Do not make any code changes. Review only.**

## Note on overlap with `/review-arch`

If you're about to flag an issue that's purely structural (e.g. "this component has too many props") with no performance impact, skip it — `/review-arch` owns that. Only flag architectural issues here if they have a concrete perf consequence you can describe.
