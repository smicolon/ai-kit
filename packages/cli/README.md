# @smicolon/ai-kit

AI coding tool pack manager. Install convention packs (agents, skills, commands, rules, hooks) for any AI coding tool.

## Install

### Homebrew (macOS/Linux)

```bash
brew install smicolon/tap/ai-kit
```

### Standalone Binary

```bash
curl -fsSL https://raw.githubusercontent.com/smicolon/ai-kit/main/scripts/install.sh | sh
```

Downloads a self-contained binary. Override install location with `AI_KIT_INSTALL_DIR=~/.local/bin`.

### npm

```bash
npx @smicolon/ai-kit@latest init
```

Requires Node.js 22+.

## Commands

### `init`

Interactive first-time setup. Prompts for your AI tools, stack, and component preferences.

```bash
ai-kit init
ai-kit init --cwd apps/web  # monorepo sub-package
```

### `add <pack>` / `install [pack]`

Add or install packs in your project. Run without arguments to install all packs recorded in `.ai-kit.json`.

```bash
ai-kit add django
ai-kit install django
ai-kit install                  # install all packs configured in .ai-kit.json
ai-kit add django --skills-only
ai-kit add django --agents-only
ai-kit add django --rules-only
ai-kit add django --tools claude-code,cursor
```

### `list`

Show available or installed packs.

```bash
ai-kit list              # available packs
ai-kit list --installed  # installed packs
```

### `remove <pack>`

Remove a pack and all its installed files.

```bash
ai-kit remove django
```

### `search <query>`

Search packs by name or keyword.

```bash
ai-kit search auth
ai-kit search frontend
ai-kit search tdd
```

### `update [pack]`

Update installed packs to latest versions.

```bash
ai-kit update          # update all
ai-kit update django   # update one
```

### `cache`

Manage the local pack cache.

```bash
ai-kit cache clear     # force re-download on next run
```

## Global Options

```bash
ai-kit --no-cache <command>      # skip cache, always fetch latest from GitHub
ai-kit --branch dev <command>    # use a specific branch (default: main)
```

## How It Works

Packs are fetched from GitHub at runtime and cached locally at `~/.config/ai-kit/cache/`. Every command checks for updates by comparing `marketplace.json` — if packs have changed upstream, they're re-downloaded automatically. No stale data when you're online.

Skills use a **canonical + symlink** strategy:

```
your-project/
├── .agents/skills/          # canonical copies
│   ├── import-convention-enforcer/
│   └── model-entity-validator/
├── .claude/skills/          # symlinks → .agents/skills/*
├── .cursor/skills/          # symlinks → .agents/skills/*
├── .claude/agents/          # copied .md files
├── .claude/commands/        # copied .md files
├── .claude/rules/           # copied .md files
├── .cursor/rules/           # converted .mdc files
├── .ai-kit.json             # tracks installed packs + files
└── .gitignore               # auto-updated
```

Tool preferences are stored globally at `~/.config/ai-kit/config.json` (pick once, works in all projects). Local `.ai-kit.json` tracks installed packs and files for clean removal — it's auto-added to `.gitignore`.

## Supported AI Tools

| Tool | Skills | Agents | Commands | Rules | Hooks |
|------|:------:|:------:|:--------:|:-----:|:-----:|
| Claude Code | yes | yes | yes | yes | yes |
| Cursor | yes | - | - | yes (.mdc) | - |
| Windsurf | yes | - | - | yes | - |
| GitHub Copilot | yes | yes | - | - | - |
| Codex | yes | yes | - | - | - |
| Cline | yes | - | - | yes | - |
| Continue | yes | - | - | yes | - |
| Gemini | yes | yes | - | - | - |
| Junie | yes | - | - | yes | - |
| Kiro | yes | - | - | yes | - |
| Amp | yes | yes | - | - | - |
| Antigravity | yes | - | - | yes | - |
| Augment | yes | - | - | yes | - |
| Roo Code | yes | - | - | yes | - |
| Amazon Q | yes | - | - | yes | - |

## Available Packs

| Pack | Agents | Skills | Commands | Rules |
|------|:------:|:------:|:--------:|:-----:|
| django | 5 | 8 | 3 | 6 |
| nestjs | 3 | 2 | 1 | 4 |
| nextjs | 4 | 3 | 1 | 3 |
| nuxtjs | 3 | 3 | 1 | 3 |
| hono | 4 | 4 | 4 | - |
| tanstack-router | 3 | 11 | 4 | - |
| better-auth | 1 | 2 | 2 | - |
| flutter | 3 | 3 | 5 | - |
| architect | 1 | - | 1 | - |
| dev-loop | - | 1 | 3 | - |
| failure-log | - | 1 | 2 | - |
| worktree | - | 1 | 1 | - |
| onboard | 1 | 1 | 1 | - |
| infisical | 1 | 3 | 5 | - |
| clarify | 1 | 3 | 1 | 1 |
| react-review | - | - | 4 | - |

## Monorepo Support

Use `--cwd` to target a sub-package. Both the sub-package and root `.gitignore` are updated.

```bash
ai-kit init --cwd apps/web
ai-kit add django --cwd apps/web
```

## License

MIT
