# @smicolon/ai-kit

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
