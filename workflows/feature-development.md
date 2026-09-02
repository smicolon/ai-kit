---
name: feature-development
description: Complete feature development workflow from architecture to deployment
---

# Feature Development Workflow

Multi-agent orchestration workflow for end-to-end feature development following Smicolon standards.

## Overview

This workflow coordinates multiple specialized agents to deliver a complete feature from requirements to production-ready code.

## Workflow Phases

### Phase 0: Task Clarification (Pre-Implementation)

**Agents & Commands Involved:**
- `/clarify` (Claude Code command)
- `@clarifier` (Cursor, Copilot, Codex, Amp, Gemini)

**Deliverables:**
1. Grounded candidate flow analysis
2. Disambiguated flow selection (if multiple flows plausible)
3. Structured execution context (`.claude/clarifications/<slug>.local.md` & `.local.json`)

**Actions:**
```
1. /clarify "<task description or ticket ID>"
2. If multi-flow, select preferred flow
3. Downstream agents/dev loops read .local.json context
```

### Phase 1: Architecture & Design

**Agents Involved:**
- `@django-architect` (Django backends)
- `@nestjs-architect` (NestJS backends)
- `@hono-architect` (Hono Edge APIs)
- `@nextjs-architect` (Next.js web apps)
- `@nuxtjs-architect` (Nuxt.js web apps)
- `@tanstack-architect` (TanStack Router React SPAs)
- `@flutter-architect` (Flutter mobile apps)
- `@auth-architect` (Authentication systems)
- `@system-architect` (System diagrams and ERDs via Eraser.io)

**Deliverables:**
1. Data model design (ERD)
2. API endpoint specifications and RPC contracts
3. System architecture diagrams
4. Security, auth, and performance plan
5. Component/module/screen structure

**Actions:**
```
1. @system-architect: Create ERD and architecture diagrams (/diagram-create)
2. @{framework}-architect: Design data models, API endpoints, and client routes
3. @auth-architect: Design auth flows, session model, and provider configuration
4. Review and validate architecture before implementation
```

### Phase 2: Backend & Infrastructure Implementation

**Agents Involved:**
- `@django-builder` / `@django-feature-based` (Django)
- `@nestjs-builder` (NestJS)
- `@hono-builder` (Hono Edge APIs)
- `@infisical-ops` (Secret management and CI/CD env setup)
- `@auth-architect` (Better Auth setup)

**Deliverables:**
1. Models/Entities with production-safe migrations
2. Service layer with core business logic
3. API endpoints with strict validation (DRF, Zod, class-validator)
4. Permission/guard configuration
5. Secret management via Infisical (`/infisical-init`, `/infisical-env-sync`)

**Actions:**
```
1. @{framework}-builder: Implement models/entities and migrations
2. @{framework}-builder: Implement service layer logic
3. @{framework}-builder: Implement API endpoints/routes with validation
4. @infisical-ops: Configure project secrets and env variables
```

### Phase 3: Frontend & Mobile Implementation

**Agents Involved:**
- `@nextjs-modular` / `@nextjs-architect` (Next.js React apps)
- `@nuxtjs-architect` (Nuxt.js Vue apps)
- `@tanstack-builder` (TanStack Router, Query, Form, Table SPAs)
- `@flutter-builder` (Flutter mobile apps)
- `@frontend-visual` (Visual QA with Playwright + Figma MCP)

**Deliverables:**
1. UI components and screens (TypeScript, Tailwind, Dart)
2. Type-safe forms with Zod / VeeValidate validation
3. API integration with TanStack Query / Hono RPC client
4. Error, empty, and loading states
5. WCAG 2.1 AA accessibility compliance

**Actions:**
```
1. @{framework}-builder: Create routes/screens and UI components
2. @{framework}-builder: Implement forms with type-safe validation
3. @{framework}-builder: Wire data fetching, caching, and state management
4. @frontend-visual: Verify visual design against Figma / Playwright specs
```

### Phase 4: Testing

**Agents Involved:**
- `@django-tester` (Django pytest)
- `@nestjs-tester` (NestJS Jest)
- `@hono-tester` (Hono Bun test / Vitest)
- `@tanstack-tester` (TanStack SPA testing)
- `@frontend-tester` (Next.js/Nuxt.js unit, integration, E2E)
- Flutter testing commands (`/flutter-test`)

**Deliverables:**
1. Unit tests (90%+ coverage target)
2. Integration and route tests
3. API endpoint and RPC contract tests
4. E2E and widget tests (frontend/mobile)
5. Accessibility test assertions

**Actions:**
```
1. @{framework}-tester: Generate comprehensive unit and integration tests
2. @frontend-tester / flutter-test: Generate E2E / widget tests
3. Run test suites and verify coverage
4. Verify tests fail in red phase before implementation (if practicing TDD)
```

### Phase 5: Code Review, Security & Four-Axis Review

**Agents & Commands Involved:**
- `@django-reviewer` (Django security and code review)
- `@hono-reviewer` (Hono Edge security and performance review)
- React Review commands: `/review-arch`, `/review-perf`, `/review-a11y`, `/review-ui`
- `/infisical-scan` (Scan for exposed credentials)
- `@frontend-visual` (Visual QA)

**Deliverables:**
1. Security audit report (permissions, rate limiting, sanitization)
2. Four-axis review report for React/Next.js (P0/P1/P2 checklist)
3. Secret scanning report (no credentials committed)
4. Performance review (N+1 queries, bundle size, cache efficiency)

**Actions:**
```
1. @{framework}-reviewer: Security and convention compliance review
2. Run React Review commands (/review-arch, /review-perf, /review-a11y, /review-ui)
3. /infisical-scan: Scan for exposed secrets
4. Address all P0 critical issues before merge
```

### Phase 6: Documentation, Release & Publishing

**Agents & Commands Involved:**
- `@release-manager` (Flutter App Store / Google Play publishing)
- `/flutter-deploy` (Fastlane automated deployments)
- Documentation generators (Swagger, OpenAPI)

**Deliverables:**
1. API documentation (OpenAPI/Swagger)
2. Component documentation and stories
3. Release builds and signing certificates
4. App Store / Google Play submission metadata and changelog

**Actions:**
```
1. Generate API documentation
2. @release-manager: Coordinate mobile app submission and review requirements
3. Run deployment pipeline or store deployment (/flutter-deploy)
```

## Usage Examples

### 1. Pre-Implementation Clarification + Dev Loop
```bash
# 1. Clarify vague requirements
/clarify "Add password reset flow"
# Output: .claude/clarifications/add-password-reset-flow.local.md & .local.json

# 2. Start autonomous TDD dev loop with plan
/dev-plan
/dev-loop
```

### 2. Django + Next.js Full-Stack Feature
```bash
# 1. Architecture
@system-architect "Create ERD for subscription billing system"
@django-architect "Design billing endpoints and webhook handlers"
@nextjs-architect "Design billing portal and plan selection UI"

# 2. Implementation
@django-builder "Implement billing models and Stripe webhook endpoint"
@nextjs-modular "Implement pricing table and subscription checkout form"

# 3. Testing & Review
@django-tester "Generate tests for Stripe webhook handling"
@frontend-tester "Generate E2E tests for subscription checkout"
@django-reviewer "Review billing implementation for security"
/review-arch
/review-perf
```

### 3. Hono Edge API + TanStack Router SPA
```bash
# 1. Architecture
@hono-architect "Design Edge API for workspace analytics on Cloudflare Workers"
@tanstack-architect "Design analytics dashboard SPA route tree and Query factories"

# 2. Implementation
@hono-builder "Implement analytics routes with D1 bindings and Zod validation"
@tanstack-builder "Implement analytics table and chart components with TanStack Table"

# 3. Testing & Review
@hono-tester "Generate Bun tests for analytics endpoints"
@tanstack-tester "Generate tests for query factories and route loaders"
@hono-reviewer "Audit Edge performance and Cloudflare binding usage"
```

### 4. Flutter Mobile Feature
```bash
# 1. Architecture
@flutter-architect "Design profile editing feature with avatar upload"

# 2. Implementation
@flutter-builder "Implement profile edit screen, cubit, and repository"

# 3. Testing & Deploy
/flutter-test
@release-manager "Prepare App Store submission metadata and review compliance"
/flutter-deploy
```

## Best Practices

### Sequential Agent Execution
- **Clarify before designing** - Use `/clarify` to resolve ambiguous requirements
- **Architecture first** - Always design models, contracts, and diagrams before coding
- **Backend before frontend** - Stabilize API specifications before building UI
- **Implementation before tests** - Code must exist to test (or follow TDD with `/dev-plan`)
- **Review before merging** - Always run security and multi-axis reviews

### Parallel Agent Execution
- Multiple architects can work in parallel on system and domain designs
- Frontend and backend teams can build in parallel once API contracts are locked
- Unit, E2E, and visual tests can run concurrently

### Iteration
- Return to clarification or architecture phases whenever new edge cases emerge
- Check `.claude/failure-log.local.md` to avoid repeating previously discovered mistakes

## Success Criteria

- [ ] Task clarified with execution context generated
- [ ] Architecture diagrams and API contracts approved
- [ ] Models/entities implement standard fields (UUID, timestamps, soft delete)
- [ ] Imports follow absolute path conventions
- [ ] API endpoints have strict validation and permissions/guards
- [ ] Frontend components accessible (WCAG 2.1 AA)
- [ ] Test coverage ≥ 90%
- [ ] No hardcoded secrets (Infisical clean scan)
- [ ] Code passes security and architecture reviews
- [ ] Documentation and deployment configs complete
