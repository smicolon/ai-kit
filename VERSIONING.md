# Versioning Strategy

This document defines how versions are managed across the Smicolon marketplace and its plugins.

## Overview

We use **independent versioning** - each plugin has its own semantic version that reflects its maturity and changes. The marketplace version tracks the overall release.

## Version Meanings

### Plugin Versions

| Version Range | Meaning | Expectations |
|---------------|---------|--------------|
| **0.x.x** | New/Experimental | May have breaking changes, needs real-world testing, API not finalized |
| **1.0.0** | Stable | Production-ready, API stable, breaking changes only in major bumps |
| **2.x.x+** | Mature | Battle-tested, well-documented, widely used |

### When to Use Each

**Start at 0.1.0** when:
- Plugin is newly created
- Not yet tested in real projects
- API/conventions may change based on feedback

**Promote to 1.0.0** when:
- Used successfully in 2-3 real projects
- No major issues reported
- Conventions are finalized
- Documentation is complete

**Increment to 2.0.0+** when:
- Major redesign or breaking changes
- Significant new capabilities
- After extended production use

## Semantic Versioning Rules

### PATCH (x.x.+1)
Backward-compatible bug fixes and minor improvements.

**Examples:**
- Fixed typo in agent prompt
- Corrected example code in skill
- Updated documentation
- Fixed edge case in command

**When to use:** No behavior change, purely fixes.

### MINOR (x.+1.0)
Backward-compatible new features.

**Examples:**
- Added new skill
- Added new command
- Enhanced agent with new capabilities
- New optional configuration option

**When to use:** New features that don't break existing usage.

### MAJOR (+1.0.0)
Breaking changes that require user action.

**Examples:**
- Renamed agent (e.g., `@django-dev` → `@django-builder`)
- Changed command arguments
- Removed deprecated features
- Changed required conventions
- Major restructure of plugin

**When to use:** Existing users need to update their usage.

## Marketplace Version

The root marketplace version in `.claude-plugin/marketplace.json` tracks:
- Overall release coordination
- Major milestones (e.g., "11 plugins now available")
- Compatibility baselines

Bump marketplace version when:
- Adding new plugins
- Major feature releases
- Significant changes across multiple plugins

## Changelog Requirements

Each plugin MUST maintain a `CHANGELOG.md` file:

```
packs/django/CHANGELOG.md
packs/nestjs/CHANGELOG.md
...
```

### Changelog Format

```markdown
# Changelog

All notable changes to this plugin will be documented in this file.

## [Unreleased]
### Added
- New feature in development

## [1.0.0] - 2025-01-15
### Changed
- BREAKING: Renamed `@django-dev` to `@django-builder`

### Added
- New `security-first-validator` skill

## [0.2.0] - 2025-01-10
### Added
- New `/api-endpoint` command

### Fixed
- Typo in architect agent prompt

## [0.1.0] - 2025-01-01
### Added
- Initial release
- 5 agents: architect, builder, feature-based, tester, reviewer
- 3 commands: model-create, api-endpoint, test-generate
- 8 skills for convention enforcement
```

## Automatic Patch Bumps (CI)

Patch versions are **automatically bumped** in CI for any plugin whose files under `packs/<name>/` changed since the last commit. The release workflow runs `scripts/bump-plugin-versions.js` before the changeset version step, so:

- **Patch bumps** — handled automatically; no manual version change needed for bug fixes, typo corrections, or doc updates to plugin files.
- **MINOR / MAJOR bumps** — still require a manual version update in `marketplace.json` and a changelog entry. The auto-bump script will not downgrade a manually-bumped version (it only increments patch).

If you manually bump a version in the same PR that changes plugin files, the CI script will bump it one additional patch. To avoid this, either rely on auto-bump for patches or set the version to one patch below your target (e.g., set `1.3.0` and let CI make it `1.3.1` — but this is unusual; for MINOR/MAJOR bumps just accept the extra patch or commit the version bump separately from plugin file changes).

## Version Bump Checklist

Before committing changes to a plugin:

- [ ] **Patch**: No action needed — CI auto-bumps patch versions for changed plugins
- [ ] **Minor/Major**: Update version in `.claude-plugin/marketplace.json` manually
- [ ] **Minor/Major**: Add entry to `packs/{name}/CHANGELOG.md`
- [ ] Used correct bump type (patch/minor/major)
- [ ] Updated marketplace version if adding new plugin

## Current Plugin Status

| Plugin | Version | Status | Notes |
|--------|---------|--------|-------|
| django | 2.1.2 | Mature | Production-tested |
| nestjs | 2.1.2 | Mature | Production-tested |
| nextjs | 2.1.2 | Mature | Production-tested |
| nuxtjs | 2.1.2 | Mature | Production-tested |
| architect | 1.0.0 | Stable | Diagram generation |
| dev-loop | 1.2.4 | Stable | TDD automation |
| failure-log | 1.0.2 | Stable | Failure memory |
| flutter | 0.1.2 | New | Mobile & store publishing |
| hono | 0.1.2 | New | Edge API framework |
| tanstack-router | 0.1.1 | New | React SPA ecosystem |
| better-auth | 0.1.2 | New | Authentication integration |
| worktree | 0.5.2 | New | Git worktree manager |
| onboard | 0.1.1 | New | Engineer onboarding |
| infisical | 0.1.2 | New | Secret management |
| clarify | 0.1.1 | New | Pre-implementation clarification |
| react-review | 0.1.1 | New | Four-axis branch review |

## Promotion Criteria

To promote a plugin from 0.x to 1.0.0:

1. **Usage** - Used in at least 2 real projects
2. **Stability** - No major bugs or breaking changes in last 30 days
3. **Documentation** - README and all skills fully documented
4. **Completeness** - Core use cases covered
5. **Feedback** - Addressed initial user feedback
