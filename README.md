```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│        ___    ____     __ __ __________                          │
│       /   |  /  _/    / //_//  _/_  __/                         │
│      / /| |  / /_____/ ,<   / /  / /                            │
│     / ___ |_/ /_____/ /| |_/ /  / /                             │
│    /_/  |_/___/    /_/ |_/___/ /_/                              │
│                                                                 │
│    Convention packs for any AI coding tool.                      │
│    by @smicolon                                                  │
│                                                                 │
├─────────────┬────────────┬────────────┬──────────────┬──────────────┤
│ 16 Plugins  │ 30 Agents  │ 46 Skills  │ 39 Commands  │   15 Tools   │
├─────────────┴────────────┴────────────┴──────────────┴──────────────┤
│                                                                 │
│   Django · NestJS · Next.js · Nuxt.js · Hono · TanStack Router  │
│   Better Auth · Infisical · Flutter · Architect · Dev Loop      │
│   Failure Log · Worktree · Onboard · Clarify · React Review     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

# @smicolon/ai-kit

**Convention packs for any AI coding tool.** Install agents, skills, commands, rules, and hooks for 15 AI tools including Claude Code, Cursor, Windsurf, Copilot, and more.

16 packs for Django, NestJS, Next.js, Nuxt.js, Hono, TanStack Router, Better Auth, Infisical, Flutter, system architecture, dev loops, failure memory, worktree management, engineer onboarding, clarify (pre-implementation), and react-review (four-axis review).

---

## Quick Start

### Install the CLI

```bash
# Homebrew (macOS/Linux — no dependencies)
brew install smicolon/tap/ai-kit

# Or standalone binary (no dependencies)
curl -fsSL https://raw.githubusercontent.com/smicolon/ai-kit/main/scripts/install.sh | sh

# Or via npm (requires Node.js 22+)
npx @smicolon/ai-kit@latest init
```

### Set up your project

```bash
# Interactive setup — pick your AI tools and stack
ai-kit init

# Or non-interactively
ai-kit add django
ai-kit add django --skills-only
ai-kit add django --tools claude-code,cursor
```

<p align="center">
  <img src="public/ai-kit-demo.gif" alt="ai-kit init demo" width="720" />
</p>

### Claude Code (native plugin)

```bash
# Add marketplace (one-time)
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install packs
/plugin install django          # Django (5 agents)
/plugin install hono            # Hono Edge (4 agents)
/plugin install tanstack-router # TanStack SPA (3 agents)

# Or install everything
/plugin install django nestjs nextjs nuxtjs hono tanstack-router better-auth infisical flutter architect dev-loop failure-log worktree onboard clarify react-review
```

---

## Table of Contents

- [16 Available Plugins](#16-available-plugins)
- [What You Get](#what-you-get)
- [Installation Methods](#installation-methods)
- [Usage Examples](#usage-examples)
- [Conventions Enforced](#conventions-enforced)
- [Repository Structure](#repository-structure)
- [Customization](#customization)
- [Updates](#updates)
- [For Companies](#for-companies)
- [Troubleshooting](#troubleshooting)

---

## 16 Available Plugins

### 🐍 django (5 agents, 3 commands, 8 skills)

Django backend development with Python

```bash
/plugin install django
```

**Agents:**

- `@django-architect` - System architecture design
- `@django-builder` - Feature implementation
- `@django-feature-based` - Large-scale feature-based architecture
- `@django-tester` - Test writing (90%+ coverage target)
- `@django-reviewer` - Security and code review

**Commands:**

- `/model-create` - Create Django models with Smicolon conventions
- `/api-endpoint` - Generate complete REST API endpoints
- `/test-generate` - Generate comprehensive tests (90%+ coverage)

**Skills (Auto-Enforcing):**

- `import-convention-enforcer` - Auto-fixes to absolute modular imports
- `model-entity-validator` - Ensures UUID, timestamps, soft delete
- `security-first-validator` - Checks permissions, authentication, validation
- `test-coverage-advisor` - Suggests missing tests for 90%+ coverage
- `performance-optimizer` - Detects N+1 queries, missing indexes
- `migration-safety-checker` - Validates safe database migrations
- `test-validity-checker` - Ensures test quality
- `red-phase-verifier` - Verifies TDD red phase

### 🦅 nestjs (3 agents, 1 command, 2 skills)

NestJS backend development with TypeScript

```bash
/plugin install nestjs
```

**Agents:**

- `@nestjs-architect` - Backend architecture design
- `@nestjs-builder` - Feature implementation
- `@nestjs-tester` - Test writing

**Commands:**

- `/module-create` - Create complete NestJS modules

**Skills (Auto-Enforcing):**

- `barrel-export-manager` - Auto-creates and maintains index.ts exports
- `import-convention-enforcer` - Enforces absolute imports from barrel exports

### ⚛️ nextjs (4 agents, 1 command, 3 skills)

Next.js frontend development with React

```bash
/plugin install nextjs
```

**Agents:**

- `@nextjs-architect` - Frontend architecture
- `@nextjs-modular` - Large-scale modular architecture
- `@frontend-visual` - Visual QA (Playwright + Figma MCP)
- `@frontend-tester` - Testing (unit/integration/E2E/accessibility)

**Commands:**

- `/component-create` - Create React/Next.js components

**Skills (Auto-Enforcing):**

- `accessibility-validator` - WCAG 2.1 AA compliance
- `react-form-validator` - React Hook Form + Zod enforcement
- `import-convention-enforcer` - Path alias (@/) enforcement

### 💚 nuxtjs (3 agents, 1 command, 3 skills)

Nuxt.js frontend development with Vue 3

```bash
/plugin install nuxtjs
```

**Agents:**

- `@nuxtjs-architect` - Vue 3 architecture
- `@frontend-visual` - Visual QA (Playwright + Figma MCP)
- `@frontend-tester` - Testing (unit/integration/E2E/accessibility)

**Commands:**

- `/component-create` - Create Vue 3/Nuxt.js components

**Skills (Auto-Enforcing):**

- `accessibility-validator` - WCAG 2.1 AA compliance
- `veevalidate-form-validator` - VeeValidate + Zod enforcement
- `import-convention-enforcer` - ~/ path alias enforcement

### 🏗️ architect (1 agent, 1 command)

System architecture and diagram-as-code

```bash
/plugin install architect
```

**Agent:**

- `@system-architect` - Eraser.io diagrams (ERD, flowcharts, cloud, sequence, BPMN)

**Commands:**

- `/diagram-create` - Create system diagrams with Eraser.io

### 🔄 dev-loop (3 commands, 1 skill, 1 hook)

Autonomous development loops for iterative coding with TDD planning

```bash
/plugin install dev-loop
```

**Commands:**

- `/dev-loop` - Start autonomous development loop (Red-Green-Refactor)
- `/dev-plan` - Generate TDD development plan
- `/cancel-dev` - Cancel active development loop

**Skills (Auto-Enforcing):**

- `tdd-planner` - Structured TDD phase planning with file tables and tests

**Hooks:**

- Automatic continuation logic for iterative development

### 🧠 failure-log (2 commands, 1 skill, 2 hooks)

Persistent failure memory that prevents repeating mistakes

```bash
/plugin install failure-log
```

**Commands:**

- `/failure-add` - Log a mistake to prevent repeating it
- `/failure-list` - View all logged failures

**Skills:**

- `failure-log-manager` - Knowledge for reading/writing failure logs

**Features:**

- Automatic context injection of known mistakes
- Semi-automatic failure detection on Write/Edit
- Project-specific storage in `.claude/failure-log.local.md`
- Categories: imports, security, testing, architecture, conventions

### 📱 flutter (3 agents, 5 commands, 3 skills)

Flutter mobile development with Fastlane automation

```bash
/plugin install flutter
```

**Agents:**

- `@flutter-architect` - Mobile app architecture design
- `@flutter-builder` - Feature implementation
- `@release-manager` - App Store/Play Store publishing

**Commands:**

- `/flutter-build` - Build iOS/Android apps
- `/flutter-test` - Run tests with coverage
- `/flutter-deploy` - Deploy to stores via Fastlane
- `/fastlane-setup` - Initialize Fastlane configuration
- `/signing-setup` - Configure code signing

**Skills (Auto-Enforcing):**

- `flutter-architecture` - Clean architecture patterns
- `fastlane-knowledge` - Fastlane automation expertise
- `store-publishing` - App Store/Play Store guidelines

### 🔥 hono (4 agents, 4 commands, 4 skills)

Hono Edge framework for Bun and Cloudflare Workers

```bash
/plugin install hono
```

**Agents:**

- `@hono-architect` - Edge API architecture design
- `@hono-builder` - Route and middleware implementation
- `@hono-tester` - Test writing with Bun test/Vitest
- `@hono-reviewer` - Security and performance review

**Commands:**

- `/route-create` - Create routes with handlers and validators
- `/middleware-create` - Create typed middleware
- `/project-init` - Initialize Hono project (Bun/CF Workers)
- `/rpc-client` - Generate type-safe RPC client

**Skills (Auto-Enforcing):**

- `hono-patterns` - Routing, handlers, middleware patterns
- `cloudflare-bindings` - D1, KV, R2 integration
- `zod-validation` - Request validation with Zod
- `rpc-typesafe` - Type-safe client-server communication

### ⚡ tanstack-router (3 agents, 4 commands, 11 skills)

TanStack Router SPA development with React

```bash
/plugin install tanstack-router
```

**Agents:**

- `@tanstack-architect` - SPA architecture design
- `@tanstack-builder` - Feature implementation
- `@tanstack-tester` - Testing strategies

**Commands:**

- `/route-create` - Create type-safe routes
- `/query-create` - Create TanStack Query hooks
- `/form-create` - Create TanStack Form with validation
- `/table-create` - Create TanStack Table components

**Skills (Auto-Enforcing):**

- `router-patterns` - File-based routing patterns
- `query-patterns` - Data fetching and caching
- `form-patterns` - Form handling with validation
- `table-patterns` - Data table components
- `virtual-patterns` - Virtualized lists
- `store-patterns` - State management
- `db-patterns` - Client-side database
- `ai-patterns` - AI/LLM integration
- `pacer-patterns` - Rate limiting and debouncing
- `devtools-patterns` - Developer tooling
- `tanstack-conventions` - Project conventions

### 🔐 better-auth (1 agent, 2 commands, 2 skills)

Better Auth authentication integration

```bash
/plugin install better-auth
```

**Agents:**

- `@auth-architect` - Authentication architecture design

**Commands:**

- `/auth-setup` - Initialize Better Auth configuration
- `/auth-provider-add` - Add OAuth providers

**Skills (Auto-Enforcing):**

- `better-auth-patterns` - Authentication patterns
- `auth-security` - Security best practices

**MCP Integration:**

- Better Auth MCP server for documentation access

### 🔐 infisical (1 agent, 5 commands, 3 skills)

Infisical secret management for cloud and self-hosted instances

```bash
/plugin install infisical
```

**Agent:**

- `@infisical-ops` - Secret management operations, auth configuration, CLI guidance, CI/CD integration

**Commands:**

- `/infisical-init` - Initialize project with Infisical (install CLI, configure workspace)
- `/infisical-auth` - Configure authentication (user, machine, or CI context)
- `/infisical-scan` - Scan codebase for exposed secrets and hardcoded credentials
- `/infisical-env-sync` - Export/sync secrets to .env files or other formats
- `/infisical-ci-setup` - Generate CI/CD pipeline configs (GitHub, GitLab, CircleCI, Jenkins, Bitbucket)

**Skills (Auto-Enforcing):**

- `infisical-patterns` - Secret naming, folder organization, auth selection, local dev workflows
- `infisical-ci-integration` - CI/CD pipeline secret injection patterns
- `secret-hygiene` - Detects hardcoded secrets, enforces .env best practices

### 🚀 onboard (1 agent, 1 command, 1 skill)

Intelligent engineer onboarding with personalized guidance

```bash
/plugin install onboard
```

**Command:**

- `/onboard` - Interactive onboarding flow (skill assessment, project analysis, task planning)

**Agents:**

- `@onboard-guide` - Ongoing personalized Q&A after onboarding

**Skills (Auto-Enforcing):**

- `onboard-context-provider` - Personalizes explanations based on engineer's background

### 🌳 worktree (1 command, 1 skill)

Git worktree manager for parallel development with automatic environment isolation

```bash
/plugin install worktree
```

**Commands:**

- `/wt` - Manage git worktrees for parallel feature development (`/wt create`, `/wt list`, `/wt remove`, `/wt init`, `/wt open`)

**Skills (Auto-Enforcing):**

- `worktree-manager` - Automatic environment file copying (`.worktreeinclude`), branch-scoped DB creation, and Docker compose port isolation

### 💡 clarify (1 agent, 1 command, 3 skills)

Pre-implementation clarification for vague tasks: detects whether a task has one clear flow or several plausible ones, producing a structured execution context before code is written

```bash
/plugin install clarify
```

**Agent:**

- `@clarifier` - Clarification specialist for non-slash-command tools (Cursor, Copilot, Codex, Amp, Gemini)

**Command:**

- `/clarify` - Pre-implementation flow detection and disambiguation (single-flow auto-proceed, multi-flow one-question resolution)

**Skills (Auto-Enforcing):**

- `flow-detector` - Analyzes task and codebase to identify candidate end-to-end flows
- `flow-selector` - Presents candidate flows and asks a single disambiguating question
- `execution-context-builder` - Synthesizes chosen flow into canonical Markdown and JSON artifacts in `.claude/clarifications/`

### 🔍 react-review (4 commands)

Four-axis branch review for React and Next.js codebases: architecture, performance, accessibility, and UI/UX. Review-only — produces prioritized findings and checklists without altering code

```bash
/plugin install react-review
```

**Commands:**

- `/review-arch` - Code quality, TypeScript strictness, component boundaries, and React/Next.js design patterns
- `/review-perf` - Rendering efficiency, memoization, TanStack Query cache usage, and bundle impact
- `/review-a11y` - Accessibility (WCAG 2.1 AA), keyboard navigation, focus management, and responsive layout
- `/review-ui` - Visual polish, typography, spacing rhythm, loading states, and interactive feedback

---

## What You Get

### Specialized Agents (30 total)

Each plugin includes agents specialized for that tech stack with deep knowledge of:

- Architecture patterns
- Best practices
- Testing strategies
- Security requirements
- Performance optimization

### Auto-Enforcing Skills (46 total)

Skills automatically activate based on context:

- **Import Convention Enforcers** - Auto-fix import patterns per framework
- **Model/Entity Validators** - Ensure required fields (UUID, timestamps)
- **Security Validators** - Check permissions, guards, validation
- **Form Validators** - Enforce React Hook Form/VeeValidate/TanStack Form + Zod
- **Accessibility Validators** - WCAG 2.1 AA compliance
- **Performance Optimizers** - Detect N+1, missing indexes
- **Test Validators** - Quality checks, TDD phase verification
- **TDD Planning** - Structured TDD phase planning with file tables and tests
- **Failure Log Manager** - Persistent memory of mistakes to avoid
- **Edge Framework Patterns** - Hono, Cloudflare bindings, RPC
- **TanStack Ecosystem** - Router, Query, Form, Table, Virtual, Store, DB, AI, Pacer, DevTools
- **Authentication Patterns** - Better Auth, OAuth, sessions
- **Secret Management** - Infisical patterns, CI integration, secret hygiene
- **Mobile Development** - Flutter architecture, Fastlane, store publishing
- **Pre-Implementation Clarification** - Flow detection, flow selection, execution context generation
- **Git Worktree Management** - Environment file copying, DB & Docker compose isolation
- **Engineer Onboarding Context** - Personalized explanations matching engineer's background

### Interactive Commands (39 total)

Slash commands provide step-by-step interactive workflows:

- `/model-create` - Django model generation
- `/api-endpoint` - Complete API endpoint scaffolding
- `/test-generate` - Comprehensive test generation
- `/module-create` - NestJS module scaffolding
- `/component-create` - React/Vue component creation (Next.js & Nuxt.js)
- `/diagram-create` - System diagram generation
- `/dev-loop` - Autonomous development loop
- `/dev-plan` - Generate TDD development plan
- `/cancel-dev` - Cancel development loop
- `/failure-add` - Log a mistake to avoid
- `/failure-list` - View logged failures
- `/flutter-build` - Build Flutter apps
- `/flutter-test` - Run Flutter tests
- `/flutter-deploy` - Deploy to app stores
- `/fastlane-setup` - Initialize Fastlane
- `/signing-setup` - Configure code signing
- `/route-create` - Hono route creation / TanStack route creation
- `/middleware-create` - Hono middleware creation
- `/project-init` - Initialize Hono project
- `/rpc-client` - Generate type-safe RPC client
- `/query-create` - TanStack Query hooks
- `/form-create` - TanStack Form components
- `/table-create` - TanStack Table components
- `/auth-setup` - Initialize Better Auth
- `/auth-provider-add` - Add OAuth providers
- `/wt` - Git worktree management with env & Docker isolation
- `/onboard` - Interactive engineer onboarding flow
- `/infisical-init` - Initialize Infisical workspace
- `/infisical-auth` - Configure auth method
- `/infisical-scan` - Scan for exposed secrets
- `/infisical-env-sync` - Sync secrets to .env
- `/infisical-ci-setup` - Generate CI/CD pipeline configs
- `/clarify` - Pre-implementation task clarification & flow disambiguation
- `/review-arch` - Architecture and React/Next.js pattern branch review
- `/review-perf` - Rendering efficiency, memoization, and bundle review
- `/review-a11y` - Accessibility (WCAG 2.1 AA) and responsive review
- `/review-ui` - UI/UX polish, spacing, typography, and interactive review

### Multi-Agent Workflows

Pre-built orchestration workflows in `workflows/`:

- `feature-development.md` - End-to-end feature development (6 phases)
- `code-review.md` - Comprehensive code review workflow (6 phases)

### Automatic Convention Enforcement

Hooks automatically enforce company standards:

- ✅ Import patterns (absolute imports with aliases)
- ✅ Model structure (UUID, timestamps, soft deletes)
- ✅ Type safety (strict TypeScript, Python type hints)
- ✅ Security (permissions, guards, validation)
- ✅ Testing requirements (80-90% coverage)
- ✅ Accessibility (WCAG 2.1 AA)

### Visual QA Integration

Frontend plugins integrate with:

- **Playwright MCP** - Automated browser testing
- **Figma MCP** - Design comparison and validation

See [MCP_SETUP.md](MCP_SETUP.md) for setup instructions.

---

## Installation

### Homebrew (macOS/Linux)

```bash
brew install smicolon/tap/ai-kit
```

Zero dependencies. Auto-updates with `brew upgrade`.

### Standalone Binary

```bash
curl -fsSL https://raw.githubusercontent.com/smicolon/ai-kit/main/scripts/install.sh | sh
```

Downloads a self-contained binary to `/usr/local/bin`. Override with `AI_KIT_INSTALL_DIR=~/.local/bin`.

### npm

```bash
npx @smicolon/ai-kit@latest init
```

Requires Node.js 22+.

### CLI Usage

```bash
# Interactive setup — pick your tools and stack
ai-kit init

# Add or install packs
ai-kit add django
ai-kit install django          # install a pack
ai-kit install                 # install all packs configured in .ai-kit.json
ai-kit add nextjs --skills-only

# Manage packs
ai-kit list              # available packs
ai-kit list --installed  # installed packs
ai-kit update            # update all
ai-kit remove django     # remove a pack
ai-kit search auth       # search packs

# Cache management
ai-kit cache clear       # force re-download on next run

# Options
ai-kit --no-cache add django   # skip cache, fetch latest
ai-kit --branch dev list       # use a specific branch

# Monorepo support
ai-kit init --cwd apps/web
ai-kit add django --cwd apps/web
```

### Claude Code plugin (native)

```bash
/plugin marketplace add https://github.com/smicolon/ai-kit
/plugin install django
/plugin update django
```

### Supported AI Tools

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

---

## Usage Examples

### Django Workflow

```bash
# Architecture phase
@django-architect "Design a payment processing system with subscriptions"

# Implementation phase
@django-builder "Implement the payment system with Stripe integration"

# Testing phase
@django-tester "Write tests for payment processing (90%+ coverage)"

# Review phase
@django-reviewer "Review payment code for security vulnerabilities"
```

### Next.js Workflow

```bash
# Architecture phase
@nextjs-architect "Design a dashboard with real-time analytics"

# Large-scale architecture
@nextjs-modular "Design modular architecture for e-commerce platform"

# Testing phase
@frontend-tester "Write comprehensive tests for dashboard"

# Visual QA (with Playwright + Figma MCP)
@frontend-visual "Verify dashboard matches Figma design"
```

### Full-Stack Workflow

```bash
# Backend
/plugin install django
@django-architect "Design REST API for inventory management"

# Frontend
/plugin install nextjs
@nextjs-architect "Design admin dashboard consuming the API"

# System design
/plugin install architect
@system-architect "Create system architecture diagram showing frontend, API, and database"
```

---

## Conventions Enforced

### Django Standards

**Import Pattern:**

```python
# ✅ CORRECT - Absolute modular imports with aliases
import users.models as _users_models
import users.services as _users_services

user = _users_models.User.objects.get(id=user_id)

# ❌ WRONG
from .models import User
from users.models import User
```

**Model Pattern:**

```python
import uuid
from django.db import models

class YourModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
```

**Required:**

- UUID primary keys
- Timestamps (created_at, updated_at)
- Soft deletes (is_deleted)
- Service layer for business logic
- Type hints on all functions
- Permission classes on all views

### NestJS Standards

**Import Pattern:**

```typescript
// ✅ CORRECT - Absolute imports from barrel exports
import { User } from "src/users/entities";
import { UsersService } from "src/users/services";

// ❌ WRONG
import { User } from "./entities/user.entity";
```

**Entity Pattern:**

```typescript
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
```

**Required:**

- UUID primary keys
- Timestamps (createdAt, updatedAt)
- Soft deletes (deletedAt)
- DTOs with class-validator
- Guards on protected routes
- Barrel exports (index.ts) in all folders

### Frontend Standards (Next.js/Nuxt.js)

**Next.js:**

- TypeScript strict mode (no `any`)
- Zod validation for all forms
- TanStack Query for API calls
- Proper error and loading states
- Tailwind CSS
- WCAG 2.1 AA accessibility

**Nuxt.js:**

- TypeScript strict mode
- Vue 3 Composition API (`<script setup lang="ts">`)
- VeeValidate + Zod for forms
- Nuxt composables (useFetch, useAsyncData)
- Pinia for state management
- WCAG 2.1 AA accessibility

---

## Repository Structure

```
ai-kit/
├── .claude-plugin/
│   └── marketplace.json          # Pack metadata (single source of truth)
├── packages/
│   └── cli/                      # @smicolon/ai-kit CLI (npm + standalone binary)
│       └── src/
│           ├── index.ts          # CLI entry (commander)
│           ├── commands/         # init, add, list, remove, update, cache
│           ├── converters/       # Rule format converters (e.g., .md → .mdc)
│           ├── installer.ts      # Copy, symlink, hook rewrite
│           ├── discovery.ts      # Resolve packs (local or GitHub cache)
│           ├── registry.ts       # GitHub tarball download + caching
│           ├── tools.ts          # 15 AI tool registry
│           └── config.ts         # .ai-kit.json management
├── scripts/
│   └── install.sh                # curl install script for standalone binary
├── packs/
│   ├── django/                   # 5 agents, 3 commands, 8 skills, 6 rules
│   ├── nestjs/                   # 3 agents, 1 command, 2 skills, 4 rules
│   ├── nextjs/                   # 4 agents, 1 command, 3 skills, 3 rules
│   ├── nuxtjs/                   # 3 agents, 1 command, 3 skills, 3 rules
│   ├── hono/                     # 4 agents, 4 commands, 4 skills
│   ├── tanstack-router/          # 3 agents, 4 commands, 11 skills
│   ├── better-auth/              # 1 agent, 2 commands, 2 skills
│   ├── flutter/                  # 3 agents, 5 commands, 3 skills
│   ├── architect/                # 1 agent, 1 command
│   ├── dev-loop/                 # 3 commands, 1 skill, 1 hook
│   ├── failure-log/              # 2 commands, 1 skill, 1 hook
│   ├── worktree/                 # 1 command, 1 skill
│   ├── onboard/                  # 1 agent, 1 command, 1 skill
│   ├── infisical/                # 1 agent, 5 commands, 3 skills
│   ├── clarify/                  # 1 agent, 1 command, 3 skills, 1 rule
│   └── react-review/             # 4 commands
├── workflows/                    # Multi-agent orchestration workflows
└── .github/workflows/            # CI + release (changesets → npm)
```

---

## Customization

### Project-Specific Rules

Create `.claude/custom/project-context.md` in your project:

````markdown
# My Project

## Tech Stack

- Django 5.0 + PostgreSQL
- Next.js 15 + TypeScript

## Custom Rules

- Use Redis for session storage
- All API endpoints require JWT
- Rate limiting: 100 requests/minute

## Environment

\```bash
python manage.py migrate
npm run dev
\```
````

### Company-Wide Customization

**For Companies:** Fork this repository to create your own standards!

1. Fork https://github.com/smicolon/ai-kit
2. Customize agents in `packs/*/agents/`
3. Modify hooks in `packs/*/hooks/`
4. Update plugin names and descriptions
5. Distribute to team:

```bash
# Team members install from your fork
/plugin marketplace add yourcompany https://github.com/yourcompany/ai-kit
/plugin install yourcompany-django
```

---

## Updates

```bash
# CLI
ai-kit update          # update all packs
ai-kit update django   # update one pack

# Homebrew
brew upgrade ai-kit

# Claude Code plugin
/plugin update django
```

---

## For Companies

### Create Your Own Marketplace

1. **Fork this repository**

   ```bash
   git clone https://github.com/smicolon/ai-kit.git your-company-standards
   ```

2. **Customize**

   - Edit `packs/*/agents/` for your conventions
   - Modify `packs/*/hooks/` for your standards
   - Update `.claude-plugin/marketplace.json`

3. **Distribute**

   ```bash
   # Push to your GitHub
   git push origin main

   # Team installs
   /plugin marketplace add yourcompany https://github.com/yourcompany/standards
   /plugin install yourcompany-django
   ```

### Git Worktree Pattern (Multiple Features)

Work on multiple features simultaneously with separate Claude sessions:

```bash
# Main project
cd ~/projects/your-app

# Create worktrees for parallel features
git worktree add ../your-app-auth feature/authentication
git worktree add ../your-app-payments feature/payments

# Each has independent Claude session
cd ../your-app-auth
claude @django-architect

# In another terminal
cd ../your-app-payments
claude @nestjs-builder
```

---

## Troubleshooting

### Agents not appearing?

```bash
# Check plugin is installed
/plugin list

# Reinstall if needed
/plugin uninstall django
/plugin install django

# Verify
/help
```

### Hooks not running?

Hooks are automatic with plugin installation. If hooks aren't working:

```bash
# Reinstall the plugin
/plugin uninstall django
/plugin install django
```

### Need different agents?

Install additional plugins:

```bash
# Add frontend to Django project
/plugin install nextjs

# Now you have Django + Next.js agents
```

---

## Documentation

- **[MCP_SETUP.md](MCP_SETUP.md)** - Playwright + Figma MCP integration setup
- **Plugin READMEs** - Each plugin has its own documentation in `packs/*/README.md`

---

## Support

- **Issues**: [GitHub Issues](https://github.com/smicolon/ai-kit/issues)
- **Custom Marketplace**: Fork and customize

---

## License

MIT
