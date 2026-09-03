# Changelog

All notable changes to the react-review pack will be documented in this file.

## [0.2.0] - 2026-09-03

### Added
- `web-design-guidelines` skill based on modern Web Interface Guidelines
- `react-perf-rules` skill codifying P0/P1/P2 review criteria across waterfalls, bundle bloat, and re-renders
- Next.js 15 uncached fetch defaults and `after()` background tasks audit in `review-perf`

## [0.1.0] - 2026-04-21

### Added
- Initial release
- 4 commands: `review-arch`, `review-perf`, `review-a11y`, `review-ui`
- Four-axis branch review for React and Next.js codebases (architecture, performance, accessibility, UI/UX)
- Scope modes: whole-branch, path-scoped, feature-scoped, and alternate-base diff
- Output shape per command: inline comments, prioritized P0/P1/P2 summary, action checklist
- Review-only — does not modify source code
