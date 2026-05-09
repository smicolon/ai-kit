# @smicolon/ai-kit

## 0.5.2

### Patch Changes

- db51649: `ai-kit remove <pack>` now cleans up orphan files when the pack is missing from `.ai-kit.json` (e.g. installed by an older CLI that didn't track files, or after the project manifest was reset). Falls back to looking up the pack in the marketplace and removing any matching files in canonical and per-tool component directories. Errors only when the pack is also unknown to the marketplace.

## 0.5.1

### Patch Changes

- 1f6b6c0: Fix skill resolver after marketplace skill entries became directory-shaped. Previously `discovery.ts` ran `path.dirname()` on each entry assuming it ended with `SKILL.md`; with the new shape this stripped the actual skill name and `installer.ts` collided every skill in a pack at `.claude/skills/skills`.

## 0.5.0

### Minor Changes

- b9daca2: Add react-review pack: four-axis branch review commands (/review-arch, /review-perf, /review-a11y, /review-ui) for React and Next.js codebases. Review-only, produces inline comments, prioritized summaries, and action checklists.

## 0.4.2

### Patch Changes

- 43400aa: Add infisical plugin to README documentation with agent, commands, skills, and updated counts

## 0.4.1

### Patch Changes

- ca43bc4: Show interactive pack selector when choosing "Add more packs" from init, and fix brew formula binary rename

## 0.4.0

### Minor Changes

- 37c098f: Runtime GitHub fetching: packs are downloaded from GitHub at runtime instead of being bundled in the npm package. Adds standalone binary builds (brew, curl install script), cache management, and --no-cache/--branch flags.

## 0.3.2

### Patch Changes

- 5564a97: Fix plugin hooks not being detected on install (showing "Hooks: 0")

  - Remove explicit hooks declarations from marketplace.json — Claude Code auto-discovers hooks/hooks.json by convention
  - Remove empty hono hooks directory

## 0.3.1

### Patch Changes

- 0848ba6: Fix wt.sh infinite loop on .env\* directories and remove redundant plugin.json files

  - Add `-type f` to find command in rewrite_all_env_files() to skip directories matching .env\* glob
  - Add file guard in rewrite_env_file() to bail early on non-file paths
  - Remove per-plugin .claude-plugin/plugin.json files — marketplace.json is the single source of truth for versions

## 0.3.0

### Minor Changes

- 29f26a0: Add worktree isolation for parallel development — .worktreeinclude config, env var rewriting, Docker port offsets, and database auto-creation

## 0.2.1

### Patch Changes

- 503ebcb: Fix gitignore: only ignore local files (_.local._), not entire tool directories — installed packs should be committed

## 0.2.0

### Minor Changes

- 4d86902: UX improvements: searchable prompts, global tool config, add works without init, search command

## 0.1.1

### Patch Changes

- 2a3b081: Fix npm package: include packs and marketplace.json in published package

## 0.1.0

### Minor Changes

- ac2737c: Initial CLI release with init, add, list, remove, and update commands.

  - Interactive `init` with AI tool and pack selection via @clack/prompts
  - `add` command with component filtering (--skills-only, --agents-only, etc.)
  - `list` command showing available and installed packs
  - `remove` command with tracked file deletion and directory cleanup
  - `update` command with version comparison and reinstall
  - 15 AI tool support (Claude Code, Cursor, Windsurf, Copilot, Codex, and more)
  - Canonical skills with symlinks for multi-tool sharing
  - Cursor .mdc rule conversion
  - Hook path rewriting for Claude Code
  - Monorepo support with --cwd flag
  - .ai-kit.json config tracking
  - .gitignore auto-update
