---
name: code-review
description: Comprehensive code review workflow covering security, quality, and standards
---

# Code Review Workflow

Multi-phase code review workflow ensuring security, quality, and adherence to Smicolon standards.

## Overview

This workflow provides a systematic approach to reviewing code across security, conventions, performance, and testing dimensions.

## Review Phases

### Phase 1: Convention Compliance

**Focus:** Verify adherence to Smicolon standards across frameworks

**Checks:**
- [ ] Import patterns (absolute imports with aliases, path aliases)
- [ ] Model/entity standard fields (UUID, timestamps, soft delete)
- [ ] Service layer separation (no business logic in views/controllers/route handlers)
- [ ] Type safety (strict TypeScript, Python type hints, Dart null safety)
- [ ] Validation rules on all inputs (DRF serializers, Zod schemas, class-validator)
- [ ] Permissions/guards configured on protected routes

**Actions:**
```
1. Review import statements:
   - Django: `import app.models as _app_models`
   - NestJS: `import { Entity } from 'src/module/entities'`
   - Next.js / TanStack: `@/components/ui/button`, `@/features/auth`
   - Nuxt.js: `~/utils/date`
   - Hono: Sub-app routing with typed context

2. Verify model/entity structure:
   - UUID primary keys
   - created_at, updated_at timestamps
   - is_deleted or deletedAt for soft deletes
   - Flutter: Immutable domain models with copyWith

3. Check business logic location:
   - Service layer / repositories
   - Not in views, controllers, route handlers, or UI widgets

4. Verify type safety:
   - Python: Type hints on all function parameters and returns
   - TypeScript: Strict mode, zero `any` types
   - Dart: Sound null safety without unnecessary `!` assertions
```

### Phase 2: Security & Secret Review

**Focus:** Identify security vulnerabilities, access control flaws, and exposed credentials

**Checks:**
- [ ] Authentication required on protected endpoints / routes
- [ ] Authorization checks (permissions, guards, role checks)
- [ ] Input validation and sanitization (Zod schemas, serializers)
- [ ] SQL injection prevention (ORM usage, parameterized D1 queries)
- [ ] XSS prevention (proper escaping, safe HTML rendering)
- [ ] CSRF and session cookie security (SameSite, HttpOnly, secure)
- [ ] Rate limiting on public and auth endpoints
- [ ] Secrets not hardcoded in code or committed in .env files
- [ ] Sensitive data properly encrypted at rest and in transit

**Actions:**
```
1. Framework security reviews:
   - Django: @django-reviewer "Comprehensive security audit"
   - Hono: @hono-reviewer "Audit Edge API security and route authorization"

2. Secret hygiene scan:
   - /infisical-scan (scans codebase for exposed keys, credentials, and tokens)

3. Verify authentication & session protection:
   - Better Auth: Verify password policy, 2FA enforcement, and session expiry
   - Django: All views have `permission_classes`
   - NestJS: All controllers have `@UseGuards()`
   - Hono: Auth middleware applied before protected route handlers
```

### Phase 3: Performance Review

**Focus:** Identify database, rendering, network, and bundle performance issues

**Checks:**
- [ ] Database query optimization and N+1 prevention (select_related, prefetch_related)
- [ ] Proper database indexing on queried and filtered columns
- [ ] Caching where appropriate (Redis, KV, TanStack Query staleTime)
- [ ] Pagination on large datasets (cursor or offset-based)
- [ ] React/Next.js rendering efficiency and memoization
- [ ] Edge execution limits (Cloudflare Workers CPU time, memory limits)
- [ ] Bundle size optimization (dynamic imports, code splitting)
- [ ] Image optimization (next/image, nuxt/image, responsive assets)

**Actions:**
```
1. React & Next.js Performance:
   - Run `/review-perf` to audit rendering cost, unneeded re-renders, and query cache keys

2. Backend Database queries:
   - Django: Verify select_related() and prefetch_related()
   - NestJS: Verify relations loading strategy
   - Hono / D1: Verify prepared statements and indexing

3. Edge & Worker performance:
   - Hono: Audit sub-request limits and KV/D1 roundtrips with @hono-reviewer
```

### Phase 4: Accessibility (a11y) & Visual UI Review

**Focus:** Verify user experience, keyboard accessibility, and visual fidelity

**Checks:**
- [ ] WCAG 2.1 AA compliance
- [ ] Semantic HTML (`<button>`, `<main>`, `<nav>`, `<dialog>`)
- [ ] Keyboard navigation and visible focus rings
- [ ] ARIA roles and accessible names on interactive elements
- [ ] Color contrast ratios (text and UI components)
- [ ] Mobile responsive layout across all standard breakpoints
- [ ] Visual fidelity matching design specifications

**Actions:**
```
1. Run accessibility review:
   - /review-a11y (audits ARIA, focus traps, semantic tags, and screen reader friendliness)

2. Run UI/UX review:
   - /review-ui (audits spacing rhythm, typography, interaction states, and loading/error UX)

3. Visual QA:
   - @frontend-visual (automated Playwright tests and Figma design comparison)
```

### Phase 5: Architecture & Code Quality

**Focus:** Maintainability, modularity, and framework architectural patterns

**Checks:**
- [ ] Adherence to framework architecture (Django services, NestJS modules, Hono sub-apps, Flutter clean arch)
- [ ] Clear, descriptive naming conventions
- [ ] Small, focused functions (< 50 lines) and cohesive classes/modules
- [ ] No duplicated business logic (DRY)
- [ ] Graceful error handling and typed failure results
- [ ] Clean barrel exports without circular dependencies

**Actions:**
```
1. Run architectural review:
   - /review-arch (audits React/Next.js structural boundaries, hook patterns, and separation of concerns)

2. Multi-framework architectural review:
   - @django-architect / @hono-architect / @tanstack-architect / @flutter-architect
```

### Phase 6: Testing Coverage

**Focus:** Ensure comprehensive automated test coverage

**Checks:**
- [ ] Test coverage ≥ 90%
- [ ] Unit tests for all services and business logic
- [ ] Integration tests for API endpoints and RPC contracts
- [ ] E2E tests for critical user workflows
- [ ] Edge cases, error paths, and validation errors covered
- [ ] Permission and authorization tests present

**Actions:**
```
1. Run framework test suites:
   - Django: `coverage run && coverage report`
   - NestJS: `npm run test:cov`
   - Next.js / Nuxt.js / TanStack: `npm test -- --coverage`
   - Hono: `bun test`
   - Flutter: `/flutter-test`

2. Verify test quality:
   - Meaningful assertion messages
   - Isolated tests without cross-test state leakage
   - Proper mocks for external third-party services
```

## Usage Examples

### 1. Full Review (Django + React/Next.js)
```bash
# 1. Security & secret audit
@django-reviewer "Comprehensive security audit of authentication and billing"
/infisical-scan

# 2. Four-axis React review
/review-arch
/review-perf
/review-a11y
/review-ui

# 3. Test verification
@django-tester "Verify test coverage meets 90% threshold"
@frontend-tester "Verify E2E checkout tests"
```

### 2. Edge API Review (Hono + Cloudflare)
```bash
# Security & performance review
@hono-reviewer "Review API routes, D1 queries, and Cloudflare bindings"
/infisical-scan
```

### 3. Mobile Review (Flutter)
```bash
# Code and store readiness review
/flutter-test
@release-manager "Review iOS and Android compliance for App Store release"
```

## Review Checklist Template

```markdown
## Code Review: [Feature Name]

### Convention Compliance
- [ ] Absolute imports used
- [ ] Standard model fields present
- [ ] Business logic in service layer
- [ ] Type hints/types present

### Security
- [ ] Authentication configured
- [ ] Authorization checks present
- [ ] Input validation complete
- [ ] No security vulnerabilities

### Performance
- [ ] Queries optimized
- [ ] Indexes added
- [ ] Caching implemented where needed
- [ ] No N+1 queries

### Testing
- [ ] Coverage ≥ 90%
- [ ] Unit tests present
- [ ] Integration tests present
- [ ] Edge cases covered

### Code Quality
- [ ] Clear naming
- [ ] Functions < 50 lines
- [ ] Error handling present
- [ ] No code duplication

### Documentation
- [ ] API documented
- [ ] Complex logic explained
- [ ] README updated

## Issues Found
1. [List issues here]

## Recommendations
1. [List recommendations here]

## Approval
- [ ] Approved
- [ ] Needs changes (see issues)
```

## Common Issues and Fixes

### Import Pattern Violations

**Issue:**
```python
# Django
from .models import User  # Relative import

# NestJS
import { User } from './entities/user.entity'  # Relative import
```

**Fix:**
```python
# Django
import users.models as _users_models
user = _users_models.User.objects.get(id=user_id)

# NestJS
import { User } from 'src/users/entities'
```

### Missing Standard Fields

**Issue:**
```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Missing id, timestamps, is_deleted
```

**Fix:**
```python
import uuid
from django.db import models

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
```

### N+1 Query Problem

**Issue:**
```python
products = Product.objects.all()
for product in products:
    print(product.created_by.email)  # N+1 queries
```

**Fix:**
```python
products = Product.objects.select_related('created_by').all()
for product in products:
    print(product.created_by.email)  # Single query with JOIN
```

### Missing Permissions

**Issue:**
```python
# Django
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    # Missing permission_classes!
```

**Fix:**
```python
from rest_framework import permissions

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
```

## Success Criteria

- [ ] All convention violations fixed
- [ ] No security vulnerabilities
- [ ] Performance issues addressed
- [ ] Test coverage ≥ 90%
- [ ] Code quality standards met
- [ ] Documentation complete
- [ ] Ready for production deployment

## Notes

- Use `@django-reviewer` agent for automated security reviews
- Always review database migrations before applying
- Consider peer review in addition to automated checks
- Block merges if critical issues found
- Document any technical debt for future work
