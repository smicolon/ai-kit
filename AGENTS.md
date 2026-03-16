# AGENTS.md

## Cursor Cloud specific instructions

This is a **documentation/configuration monorepo** with one buildable CLI package (`packages/cli/`). The 14 packs in `packs/` are Markdown files — no build needed.

### Project structure

- **Root**: Bun workspaces + Turborepo monorepo
- **`packages/cli/`**: TypeScript CLI (`@smicolon/ai-kit`) built with tsup, targeting Node 22+ / ESM
- **`packs/`**: 14 convention packs (Markdown agents, skills, commands, rules, hooks)

### Key commands

See `package.json` scripts and `turbo.json` for the full list. Summary:

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Typecheck | `bun run --filter @smicolon/ai-kit typecheck` |
| Build CLI | `bun run --filter @smicolon/ai-kit build` |
| Dev (watch) | `bun run --filter @smicolon/ai-kit dev` |
| Verify CLI | `node packages/cli/dist/index.js --help` |

### Notes

- There are no automated test suites or lint scripts configured in this repo. CI runs only `typecheck` and `build`.
- The CLI is ESM-only (`"type": "module"` in `packages/cli/package.json`). Do not introduce CommonJS patterns.
- Bun is the package manager (lockfile: `bun.lock`). Do not use npm/yarn/pnpm.
- The `packs/` directory contents are consumed by AI coding tools, not executed directly. Editing packs only requires Markdown knowledge.
