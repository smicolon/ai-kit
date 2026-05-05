# React Review Plan

End-to-end plan for reviewing a React/Next.js branch with this pack, applying fixes, and verifying nothing broke. Four commands, three outputs each, one verification pass at the end.

---

## TL;DR

```
1. /review-arch   → read report, apply P0/P1 fixes
2. /review-perf   → read report, apply P0/P1 fixes
3. /review-a11y   → read report, apply P0/P1 fixes
4. /review-ui     → read report, apply P0/P1 fixes
5. Verify         → lint, typecheck, test, smoke-test, compare bundle
```

Run each command in a fresh Claude Code session. Don't skip steps 1–2 for UI-only branches — perf and arch issues still sneak in.

---

## The four commands

| Command | Focus | Typical P0 findings |
|---|---|---|
| `/review-arch` | TypeScript, React patterns, component design, state | `any` hiding bugs, race conditions, stale closures, unclear boundaries |
| `/review-perf` | Rendering cost, memoization, data fetching, bundle | Re-render cascades, missing virtualization, unmemoized expensive children, wrong query keys |
| `/review-a11y` | WCAG compliance, keyboard, responsive | Missing labels, contrast failures, keyboard traps, mobile layout breaks |
| `/review-ui` | Visual polish, spacing, typography, states | Invisible focus ring, broken hover/empty states, inconsistent spacing |

All four accept the same optional argument — path, feature name, or base branch — and all four produce the same three outputs: inline comments, prioritized summary (P0/P1/P2), actionable checklist.

---

## Why this order

**arch → perf → a11y → ui**

Each pass builds on the previous. Running them out of order wastes work.

1. **`/review-arch` first.** Structural issues (wrong component boundaries, state mismanagement, type holes) are the cheapest to fix early. If you fix UI polish on a component that's about to be split in two, you just threw away that work.
2. **`/review-perf` second.** Performance fixes often touch the same code `arch` just cleaned up (memoization sits on top of clean prop interfaces, virtualization sits on top of well-typed lists). Doing perf right after arch means the code is already in a shape where memoization actually helps.
3. **`/review-a11y` third.** Semantic HTML and ARIA decisions depend on the component structure being stable. Adding `aria-label` to a button you're about to replace with a different component is wasted effort.
4. **`/review-ui` last.** Visual polish is the final layer. The hover states, spacing, and focus rings you add here should stick, because the underlying components are now stable.

---

## The workflow, step by step

### Before you start

- Make sure you're on the branch you want reviewed (`git status` clean or committed — review works off the diff).
- Identify your base branch (`main`, `develop`, whatever you merge into).
- Decide the scope. Options:
  - **Whole branch** — default. Run with no argument.
  - **Path scope** — `apps/web/src/features/auth`. Use when the branch has unrelated changes and you want to review one slice.
  - **Feature scope** — `preview-tab`. Use when feature files are scattered and you want Claude to find them.
  - **Base branch** — `develop`. Use when you're not diffing against `main`.

### Step 1 — Code quality & architecture

```bash
# Fresh session
claude

> /review-arch
# (or: /review-arch preview-tab, etc.)
```

Claude will announce which scope mode it picked, list the changed files, then produce:

- **Inline comments** per file (`File: path → Line N: issue — why — fix`)
- **Summary** grouped by P0/P1/P2
- **Checklist** of action items starting with verbs

**What to do with the output:**
1. Read the Summary first. Sanity-check the P0 items — are they real? If anything looks off, push back in the same session (`"the issue on X.tsx line 42 seems wrong because..."`). Claude Code can revisit.
2. In the same session, tell Claude: `"Apply the P0 items from the checklist."`
3. Spot-check the changes (`git diff`).
4. Commit with a clear message: `chore(review): apply arch P0 fixes`.
5. Optionally apply P1 now or defer to a follow-up PR.

**Skip P2 unless you have time.** Nice-to-haves multiply fast and can turn one review into a week.

### Step 2 — Performance

```bash
# Fresh session — important, context from Step 1 is no longer useful
claude

> /review-perf
```

Same pattern. Read Summary → apply P0 → commit.

**Watch for overlap with Step 1.** There's deliberate ~10% overlap between `arch` and `perf` (effects, derived state, etc.). If Claude re-raises something you already fixed, that's fine — it's running blind to Step 1's work. Just skip those items in the checklist.

**Commit message:** `perf: apply review P0 fixes`.

### Step 3 — Accessibility & responsiveness

```bash
# Fresh session
claude

> /review-a11y
```

Same pattern. A11y fixes are usually fast and safe (adding `aria-label`, replacing `div` with `button`, etc.). Apply generously.

**Commit message:** `a11y: apply review P0 fixes`.

### Step 4 — UI polish

```bash
# Fresh session
claude

> /review-ui
```

Same pattern. This is the least likely to introduce regressions, but also the most subjective — feel free to reject suggestions that don't match your design intent.

**Commit message:** `style: apply UI review P0 fixes`.

---

## Verification

Verification has two jobs: (A) make sure the review was actually useful, and (B) make sure your fixes didn't break anything.

### A. Verify the review itself

For each pass, quick sanity check:

- **Did Claude actually read the files?** If the inline comments have vague line numbers or generic observations ("consider improving styling"), the review was shallow. Re-run with a narrower scope (path or feature mode) to get deeper coverage.
- **Are the P0 items real?** Pick one P0, open the file, read the code yourself. If you disagree, say so — Claude Code will often concede or justify better in a follow-up. False positives erode trust.
- **Did it miss anything obvious?** If you already know of a perf issue in the branch and `/review-perf` didn't flag it, that's a signal. Either the prompt needs tightening, or the issue lives outside the reviewed scope.
- **Coverage check:** does the file list at the start of the review match what you actually changed? Run `git diff main...HEAD --stat` yourself and compare.

### B. Verify the fixes

After all four passes, before you open/update the PR:

**Automated checks (run these every time):**

```bash
# 1. Type safety — nothing was typed around, no new `any`
pnpm typecheck        # or: tsc --noEmit

# 2. Lint — no new warnings, no rule suppressions added
pnpm lint

# 3. Tests — existing tests still pass
pnpm test

# 4. Build — production build succeeds
pnpm build
```

If any of these fail, something in the fixes broke. Bisect with `git log` per-step commits (that's why we commit after each step).

**Manual checks:**

- **Smoke-test the affected flows in the browser.** Open the pages/components you reviewed. Click around. Tab through. Resize the window to mobile width (≥320px).
- **Keyboard-only test.** Unplug your mouse mentally — can you reach every interactive element with Tab, activate it with Enter/Space, close modals with Escape, and see where focus is at all times?
- **Dark mode parity** (if your app supports it). Toggle it. Did any color swap break?
- **i18n expansion.** If your app supports multiple languages, switch to a verbose one (German, Finnish) and check for overflow or awkward wrapping. This is where compound words and long translations hit hardest.
- **Reduced motion.** Turn on `prefers-reduced-motion` in OS or DevTools. Animations should calm down, not vanish entirely.

**Performance verification (after `/review-perf` fixes):**

- **React DevTools Profiler.** Record an interaction you know used to re-render a lot. Confirm the flame graph is shorter/shallower.
- **Bundle diff.** Compare `dist/` or `.next/` build output before and after. Tools like `source-map-explorer` or `@next/bundle-analyzer` make this visual. A good perf pass *reduces* bundle size (or at least doesn't grow it without cause).
- **Network tab.** Reload the reviewed page. Are duplicate requests gone? Did anything go from sequential to parallel?

**Accessibility verification (after `/review-a11y` fixes):**

- **Axe DevTools or Lighthouse a11y audit.** Run it on the affected pages. Score should go up, not down.
- **Color contrast checker** for any color changes (DevTools → element → contrast ratio).
- **Screen reader spot-check** (VoiceOver on macOS, NVDA on Windows). Tab through one form or interactive component and listen. Labels read correctly? Any silent buttons?

### Verification checklist

Paste this into your PR description to make it easy for reviewers to trust the work:

```markdown
## Review plugin verification

- [ ] `/review-arch` ran — P0s resolved
- [ ] `/review-perf` ran — P0s resolved
- [ ] `/review-a11y` ran — P0s resolved
- [ ] `/review-ui` ran — P0s resolved
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Production build succeeds
- [ ] Smoke-tested affected flows
- [ ] Keyboard-only navigation verified
- [ ] Mobile layout verified (≥320px)
- [ ] i18n expansion verified (for all supported languages)
- [ ] Bundle size did not regress
- [ ] A11y audit score maintained or improved
```

---

## When to skip steps

Not every branch needs all four. Rough guide:

| Branch type | Run |
|---|---|
| UI-only change (styles, copy, colors) | `/review-ui` + `/review-a11y` |
| Pure refactor (no visible change) | `/review-arch` + `/review-perf` |
| New feature | All four |
| Hotfix | Only the axis the bug is in |
| Dependency bump | `/review-perf` (bundle impact) |
| Small tweak (<5 file change) | Spot-check manually, skip the plugin |

For installation and contribution details, see the repository
[`README.md`](../../README.md) and `CONTRIBUTING.md`.
