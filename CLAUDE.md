# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository is a **Claude Code Marketplace** providing independent plugins for enforcing Smicolon company-wide development standards across Django, NestJS, Next.js, Nuxt.js, Hono, TanStack Router, Better Auth, Flutter, system architecture, dev loops, and more. Each plugin includes specialized agents and hooks that automatically inject conventions and validate code. The current pack list is the source of truth in `.claude-plugin/marketplace.json`.

## Development Environment

Notes for any AI agent (Claude Code, Cursor Cloud, Codex, etc.) working in this repo. The same content is exposed as `AGENTS.md` (symlink to this file) so tools that look for `AGENTS.md` see it too.

### Repo shape

- **Bun workspaces + Turborepo monorepo.** Bun is the only supported package manager — do **not** use npm, yarn, or pnpm. The lockfile is `bun.lock`.
- **`packages/cli/`** is the only buildable package: a TypeScript CLI (`@smicolon/ai-kit`) built with tsup, ESM-only (`"type": "module"`), targeting Node 22+. Do not introduce CommonJS patterns.
- **`packs/`** holds convention packs as Markdown (agents, skills, commands, rules, hooks). They are consumed by AI coding tools, not executed directly — editing them only requires Markdown.

### Common scripts

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Typecheck CLI | `bun run --filter @smicolon/ai-kit typecheck` |
| Build CLI | `bun run --filter @smicolon/ai-kit build` |
| Watch / dev mode | `bun run --filter @smicolon/ai-kit dev` |
| Smoke-test built CLI | `node packages/cli/dist/index.js --help` |
| Validate marketplace | `claude plugin validate .` |

### Caveats

- There are **no automated test suites or lint scripts** in this repo. CI runs only `typecheck` and `build`. If you need to verify CLI behaviour, write an ad-hoc shell harness against `dist/index.js` (see PR #17 for examples).
- Plugin patch versions auto-bump in CI based on changed files under `packs/<name>/`. Marketplace-only changes do **not** trigger auto-bump — bump manually if a fix needs to ship to installed users.
- `.ai-kit.json` (per-project) and `~/.config/ai-kit/config.json` (global tool list) are both still in active use. Don't conflate them.

## Core Architecture

### Directory Structure

```
ai-kit/                     # Smicolon Marketplace
├── .claude-plugin/
│   └── marketplace.json          # Single source of truth - all plugin configuration
├── packs/
│   ├── django/               # Django plugin (5 agents, 3 commands, 8 skills)
│   │   ├── agents/               # Agent definitions
│   │   ├── commands/             # Slash commands
│   │   ├── skills/               # Auto-enforcing skills
│   │   └── README.md
│   ├── nestjs/               # NestJS plugin (3 agents, 1 command, 2 skills)
│   ├── nextjs/               # Next.js plugin (4 agents, 1 command, 3 skills)
│   ├── nuxtjs/               # Nuxt.js plugin (3 agents, 1 command, 3 skills)
│   ├── hono/                 # Hono Edge plugin (4 agents, 4 commands, 4 skills)
│   ├── tanstack-router/      # TanStack SPA plugin (3 agents, 4 commands, 11 skills)
│   ├── better-auth/          # Better Auth plugin (1 agent, 2 commands, 2 skills)
│   ├── flutter/              # Flutter mobile plugin (3 agents, 5 commands, 3 skills)
│   ├── architect/            # System architecture plugin (1 agent, 1 command)
│   ├── dev-loop/             # Dev loop automation (3 commands, 1 skill, 1 hook)
│   └── failure-log/          # Failure memory plugin (2 commands, 1 skill, 2 hooks)
├── workflows/                    # Multi-agent orchestration workflows
│   ├── feature-development.md
│   └── code-review.md
├── scripts/
│   └── cleanup-plugins.sh        # Development cleanup utility
├── templates/                    # Project templates with pre-configured conventions
└── .claude/                      # Local Claude Code configuration (not committed)
```

### Installation Method

**Plugin Installation**
- Install as Claude Code plugins via marketplace
- Install only what you need (e.g., just Django or just Next.js)
- Automatic updates per plugin
- Independent versioning
- Zero manual setup required

```bash
# Add marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install specific plugins
/plugin install django          # Django only (5 agents)
/plugin install hono            # Hono Edge (4 agents)
/plugin install tanstack-router # TanStack SPA (3 agents)
/plugin install better-auth     # Better Auth (1 agent + MCP)
/plugin install architect       # System diagrams (1 agent)

# Or install all
/plugin install django nestjs nextjs nuxtjs hono tanstack-router better-auth flutter architect dev-loop failure-log
```

## Agent System

### Agent Categories (27 Total Across 11 Plugins)

**django Plugin** (5 agents):
- `@django-architect` - Architecture design
- `@django-builder` - Feature implementation
- `@django-feature-based` - Large-scale feature-based architecture
- `@django-tester` - Test writing (90%+ coverage target)
- `@django-reviewer` - Security and code review

**nestjs Plugin** (3 agents):
- `@nestjs-architect` - Backend architecture
- `@nestjs-builder` - Feature implementation
- `@nestjs-tester` - Test writing

**nextjs Plugin** (4 agents):
- `@nextjs-architect` - Next.js/React architecture
- `@nextjs-modular` - Large-scale Next.js modular architecture
- `@frontend-visual` - Visual QA with Playwright MCP + Figma MCP
- `@frontend-tester` - Frontend testing (unit, integration, E2E, accessibility)

**nuxtjs Plugin** (3 agents):
- `@nuxtjs-architect` - Nuxt.js/Vue 3 architecture
- `@frontend-visual` - Visual QA with Playwright MCP + Figma MCP (shared with Next.js)
- `@frontend-tester` - Frontend testing (shared with Next.js)

**hono Plugin** (4 agents):
- `@hono-architect` - Edge API architecture design
- `@hono-builder` - Route and middleware implementation
- `@hono-tester` - Test writing with Bun test/Vitest
- `@hono-reviewer` - Security and performance review

**tanstack-router Plugin** (3 agents):
- `@tanstack-architect` - SPA architecture design
- `@tanstack-builder` - Feature implementation with TanStack ecosystem
- `@tanstack-tester` - Testing strategies for SPAs

**better-auth Plugin** (1 agent):
- `@auth-architect` - Authentication architecture and security flows

**flutter Plugin** (3 agents):
- `@flutter-architect` - Mobile app architecture design
- `@flutter-builder` - Feature implementation
- `@release-manager` - App Store/Play Store publishing

**architect Plugin** (1 agent):
- `@system-architect` - Eraser.io diagram-as-code specialist (ERD, flowcharts, cloud, sequence, BPMN)

### Agent Usage Pattern

Agents are invoked with `@agent-name` syntax in Claude Code. They enforce specific conventions for each framework through detailed prompt engineering. Each plugin's agents are only available when that plugin is installed.

## Command System

Each plugin includes specialized slash commands that provide interactive workflows for common development tasks.

### Command Categories (24 Total)

**django Commands:**
- `/model-create` - Create Django models following Smicolon conventions
- `/api-endpoint` - Create complete REST API endpoints (serializer, service, view, tests)
- `/test-generate` - Generate comprehensive tests (90%+ coverage target)

**nestjs Commands:**
- `/module-create` - Create complete NestJS modules (entity, DTOs, service, controller)

**nextjs Commands:**
- `/component-create` - Create React/Next.js components (UI, forms, server components)

**nuxtjs Commands:**
- `/component-create` - Create Vue 3/Nuxt.js components

**hono Commands:**
- `/route-create` - Create routes with handlers and validators
- `/middleware-create` - Create typed middleware
- `/project-init` - Initialize Hono project (Bun/CF Workers)
- `/rpc-client` - Generate type-safe RPC client

**tanstack-router Commands:**
- `/route-create` - Create type-safe file-based routes
- `/query-create` - Create TanStack Query with factory key pattern
- `/form-create` - Create TanStack Form with Zod validation
- `/table-create` - Create TanStack Table component

**better-auth Commands:**
- `/auth-setup` - Initialize Better Auth configuration
- `/auth-provider-add` - Add OAuth providers (Google, GitHub, Discord, etc.)

**flutter Commands:**
- `/flutter-build` - Build iOS/Android apps
- `/flutter-test` - Run tests with coverage
- `/flutter-deploy` - Deploy to stores via Fastlane
- `/fastlane-setup` - Initialize Fastlane configuration
- `/signing-setup` - Configure code signing

**architect Commands:**
- `/diagram-create` - Create system diagrams using Eraser.io (ERD, cloud, sequence, flowcharts)

**dev-loop Commands:**
- `/dev-loop` - Start autonomous development loop (Red-Green-Refactor)
- `/dev-plan` - Generate TDD development plan
- `/cancel-dev` - Cancel active development loop

**failure-log Commands:**
- `/failure-add` - Log a mistake to prevent repeating it
- `/failure-list` - View all logged failures

### Command Usage Pattern

Commands are invoked with `/command-name` syntax. They provide step-by-step interactive workflows:

```bash
# Create a Django model
/model-create

# Create an API endpoint
/api-endpoint

# Generate tests
/test-generate

# Create a system diagram
/diagram-create
```

## Workflow System

Multi-agent orchestration workflows that coordinate specialized agents for complex tasks.

### Available Workflows

**feature-development.md** - Complete feature development from architecture to deployment
- Phase 1: Architecture & Design
- Phase 2: Backend Implementation
- Phase 3: Frontend Implementation
- Phase 4: Testing (90%+ coverage)
- Phase 5: Code Review & Security
- Phase 6: Documentation & Deployment

**code-review.md** - Comprehensive code review workflow
- Phase 1: Convention Compliance
- Phase 2: Security Review
- Phase 3: Performance Review
- Phase 4: Testing Coverage
- Phase 5: Code Quality
- Phase 6: Documentation

### Workflow Usage Example

```bash
# Full feature development workflow
# 1. Architecture
@system-architect "Create ERD for user authentication"
@django-architect "Design auth API with JWT"

# 2. Implementation
@django-builder "Implement authentication endpoints"

# 3. Testing
@django-tester "Generate comprehensive auth tests"

# 4. Review
@django-reviewer "Security audit of authentication"

# 5. Visual verification (if frontend)
@frontend-visual "Verify login page design"
```

## Hook System

Currently, only `dev-loop` includes hooks for autonomous development loops:

### dev-loop Hooks

Located in `packs/dev-loop/hooks/`

- `stop-hook.sh` - Handles dev loop continuation logic

**Note:** Convention enforcement is handled by **skills** (auto-invoked based on context) and **rules** (path-specific patterns), not hooks.

## Development Standards Enforced

### Django Conventions

**Import Pattern:**
```python
# CORRECT - Absolute modular imports with aliases
import users.models as _users_models
import users.services as _users_services

# Usage
user = _users_models.User.objects.get(id=user_id)

# WRONG - Never use
from .models import User  # Relative import
from users.models import User  # Direct import
```

**Model Standard:**
- UUID primary keys (`id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`)
- Timestamps (`created_at`, `updated_at`)
- Soft deletes (`is_deleted = models.BooleanField(default=False)`)
- Service layer for business logic
- Type hints required
- Permission classes on all views

### NestJS Conventions

**Import Pattern:**
```typescript
// CORRECT - Absolute imports from barrel exports
import { User } from 'src/users/entities'
import { UsersService } from 'src/users/services'
import { CreateUserDto } from 'src/users/dto'

// WRONG - Relative imports
import { User } from './entities/user.entity'
import { User } from '../entities'
```

**Entity Standard:**
- UUID primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Timestamps (`@CreateDateColumn()`, `@UpdateDateColumn()`)
- Soft deletes (`@DeleteDateColumn()`)
- DTOs with class-validator
- Guards on protected routes
- Barrel exports (index.ts) in all folders

### Next.js Conventions

- TypeScript strict mode (no `any`)
- Zod validation for forms (React Hook Form + Zod)
- TanStack Query for API calls
- Proper error and loading states
- Tailwind CSS
- WCAG 2.1 AA accessibility

### Nuxt.js Conventions

- TypeScript strict mode
- Vue 3 Composition API (`<script setup lang="ts">`)
- VeeValidate + Zod for forms
- Nuxt composables (useFetch, useAsyncData)
- Pinia for state management
- WCAG 2.1 AA accessibility

## Common Commands

### Installation and Setup

```bash
# Add Smicolon marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install specific plugins
/plugin install django          # Django only
/plugin install hono            # Hono Edge only
/plugin install tanstack-router # TanStack SPA only
/plugin install better-auth     # Better Auth only
/plugin install architect       # System architecture only

# Or install all
/plugin install django nestjs nextjs nuxtjs hono tanstack-router better-auth flutter architect dev-loop failure-log

# Update plugins
/plugin update django
/plugin update django nestjs nextjs nuxtjs hono tanstack-router better-auth flutter architect dev-loop failure-log
```

### Testing Installation

```bash
# Test plugin installation
/plugin marketplace add https://github.com/smicolon/ai-kit
/plugin install django
/help  # Should show @django-* agents
```

## Project Type Detection Logic

Used by hooks to determine which agents and conventions to apply:

1. **Django**: `[ -f "manage.py" ] || [ -d "config/settings" ]`
2. **NestJS**: `[ -f "package.json" ] && grep -q "@nestjs/core" package.json`
3. **Next.js**: `[ -f "package.json" ] && grep -q "\"next\"" package.json`
4. **Nuxt.js**: `[ -f "package.json" ] && grep -q "nuxt" package.json`
5. **Hono**: `[ -f "package.json" ] && grep -q "\"hono\"" package.json`
6. **TanStack Router**: `[ -f "package.json" ] && grep -q "@tanstack/react-router" package.json`
7. **Better Auth**: `[ -f "package.json" ] && grep -q "\"better-auth\"" package.json`
8. **Flutter**: `[ -f "pubspec.yaml" ]`

## Distribution System

The repository uses GitHub-native distribution via Claude Code's plugin system. No packaging or publishing scripts are needed:

1. **Development**: Make changes to plugins in `packs/` directory
2. **Commit**: Commit and push changes to GitHub
3. **Distribution**: Users install/update directly from GitHub via `/plugin marketplace add` and `/plugin install`

**Benefits:**
- No build or packaging step required
- Automatic updates via Claude Code plugin system
- Independent versioning per plugin
- Git-based version control

## Git Worktree Pattern

Recommended workflow for multiple feature development (documented in README.md):

```bash
# Main project
cd ~/projects/your-app

# Create worktrees for parallel features
git worktree add ../your-app-feature-auth feature/authentication
git worktree add ../your-app-feature-payments feature/payments

# Each has independent .claude/ directory
cd ../your-app-feature-auth
claude @django-architect  # Separate Claude session
```

## MCP Integration (Playwright Visual Testing)

The `@frontend-visual` agent integrates with Playwright MCP server for visual testing. Configuration in `MCP_SETUP.md`:

**Setup:**
```json
// ~/.claude/mcp.json or project .claude/mcp.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "env": {}
    }
  }
}
```

**Usage:**
```bash
npm run dev  # Start dev server
claude @frontend-visual
# "Verify dashboard at /dashboard is pixel-perfect"
```

## Important Files to Understand

### Core Configuration

- `.claude-plugin/marketplace.json` - Single source of truth for all plugin configuration
- `packs/django/skills/` - Auto-enforcing skills for convention compliance
- `packs/django/agents/django-architect.md` - Example agent structure and conventions

### Documentation

- `README.md` - Complete user-facing documentation (Quick Start, installation, usage, conventions)
- `CLAUDE.md` - Project instructions for Claude Code (this file)
- `VERSIONING.md` - Version strategy, bump rules, promotion criteria
- `MCP_SETUP.md` - Playwright + Figma MCP integration setup
- `packs/*/README.md` - Plugin-specific documentation
- `packs/*/CHANGELOG.md` - Version history per plugin

### Not Committed

- `.claude/` in repository root (local development only)

## Development Workflow

### Adding New Agents

1. Choose the appropriate plugin (e.g., `packs/django/`)
2. Create agent file in `packs/django/agents/{role}.md`
3. Follow existing agent structure (role definition, conventions, deliverables)
4. Update `.claude-plugin/marketplace.json` to register the agent in the plugin's `agents` array
5. Bump plugin version (MINOR bump for new agent)
6. Add changelog entry to `packs/{name}/CHANGELOG.md`
7. Update plugin's README.md to document new agent
8. Update root README.md to reflect new agent count
9. Test plugin installation in sample project

### Modifying Conventions

1. Edit agent files in `packs/*/agents/` directory
2. Update corresponding skills in `packs/*/skills/` directory
3. Update rules in `packs/*/rules/` directory if path-specific
4. Test with sample project
5. Update plugin's README.md if visible changes
6. **Patch versions auto-bump in CI** — no manual bump needed for bug fixes/typos
7. For MINOR/MAJOR bumps: manually update version in `.claude-plugin/marketplace.json`
8. For MINOR/MAJOR bumps: add changelog entry to `packs/{name}/CHANGELOG.md`

### Creating New Plugins

1. Create `packs/{name}/` directory
2. Create `agents/` directory with agent files
3. Create `commands/` directory with command files (if needed)
4. Create `skills/` directory with auto-enforcing skills (if needed)
5. Create `rules/` directory with path-specific rules (if needed)
6. Create plugin README.md
7. Create plugin CHANGELOG.md with initial `[0.1.0]` entry
8. Add plugin configuration to `.claude-plugin/marketplace.json` with `"version": "0.1.0"`
9. Update root README.md to document the new plugin
10. Update VERSIONING.md plugin status table

**Important:** New plugins always start at `0.1.0` (experimental). See VERSIONING.md for promotion criteria to `1.0.0`.

### Testing Changes

```bash
# Test plugin installation
/plugin marketplace add https://github.com/smicolon/ai-kit
/plugin install django
/help  # Verify agents appear
```

## Troubleshooting

**Agents not appearing after plugin installation:**
- Verify plugin is installed: `/plugin list`
- Check plugin installation: `/help` should show agents
- Reinstall if needed: `/plugin uninstall django && /plugin install django`

**Skills not activating:**
- Skills auto-invoke based on context (e.g., writing models triggers model-entity-validator)
- Check that skill is registered in `marketplace.json`
- Verify SKILL.md frontmatter has correct `name` and `description`

**Plugin installation fails:**
- Verify marketplace URL is correct: `https://github.com/smicolon/ai-kit`
- Check GitHub repository is accessible
- Try removing and re-adding marketplace

## Repository Maintenance

### Archive Policy

Old/experimental code goes in `archive/` directory. Do not delete - useful for reference and understanding evolution of conventions.

### Update Propagation

**Plugin Installation:**
- Updates via Claude Code plugin system: `/plugin update django`
- Automatic version checking
- Per-plugin independent updates

### Version Management

See **VERSIONING.md** for complete strategy. Key points:

**Version Meanings:**
| Range | Status | Description |
|-------|--------|-------------|
| 0.x.x | Experimental | New plugin, needs testing, API may change |
| 1.x.x | Stable | Production-ready, tested in real projects |
| 2.x.x+ | Mature | Battle-tested, widely used |

**Semantic Versioning:**
- **PATCH** (x.x.+1): Bug fixes, typos, no behavior change — **auto-bumped in CI**
- **MINOR** (x.+1.0): New features, backward compatible — manual bump required
- **MAJOR** (+1.0.0): Breaking changes — manual bump required

**Before Committing Plugin Changes:**
1. **Patch**: No action needed — CI auto-bumps via `scripts/bump-plugin-versions.js`
2. **Minor/Major**: Manually bump version in `.claude-plugin/marketplace.json`
3. **Minor/Major**: Add entry to `packs/{name}/CHANGELOG.md`

**Promotion to 1.0.0 requires:**
- Used in 2+ real projects
- No major bugs in 30 days
- Complete documentation
- User feedback addressed