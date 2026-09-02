# Django Pack

Production standards and convention pack for Django projects.

## Installation

```bash
# Add Smicolon marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install Django plugin
/plugin install django
```

## What's Included

### 5 Specialized Agents

- `@django-architect` - System architecture design and planning
- `@django-builder` - Feature implementation with best practices
- `@django-feature-based` - Large-scale feature-based architecture
- `@django-tester` - Test writing (90%+ coverage target)
- `@django-reviewer` - Security and code review

### 8 Auto-Enforcing Skills

Skills automatically activate based on context - no manual invocation needed:

**Core Validators:**
- `import-convention-enforcer` - Auto-fixes import patterns to use absolute modular imports
- `model-entity-validator` - Auto-enforces BaseModel inheritance (UUID, timestamps, soft delete)
- `security-first-validator` - Auto-checks API endpoints for security requirements (permissions, validation)

**Quality Enforcers:**
- `test-coverage-advisor` - Auto-suggests missing tests to achieve 90%+ coverage
- `performance-optimizer` - Auto-detects N+1 queries and suggests optimizations
- `migration-safety-checker` - Auto-validates migrations are production-safe (no data loss)

**TDD Helpers:**
- `test-validity-checker` - Validates tests are meaningful and not trivial
- `red-phase-verifier` - Ensures tests fail before implementation (TDD red phase)

**How Skills Work:**
- Auto-invoke based on what you're doing (writing models, creating APIs, etc.)
- Proactively fix violations without being asked
- Explain WHY conventions exist
- Block unsafe operations (insecure endpoints, data-loss migrations)

### Automatic Convention Enforcement

Skills automatically enforce:

**Import Pattern:**
```python
# CORRECT - Absolute modular imports with aliases
import users.models as _users_models
import users.services as _users_services

user = _users_models.User.objects.get(id=user_id)

# WRONG - Never use
from .models import User
from users.models import User
```

**Model Standards:**
- UUID primary keys
- Timestamps (created_at, updated_at)
- Soft deletes (is_deleted)
- Service layer for business logic
- Type hints required
- Permission classes on all views

## Usage

```bash
# Start with architecture
@django-architect "Design a payment processing system"

# Implement features
@django-builder "Implement payment processing"

# Write tests
@django-tester "Write tests for payment system"

# Review for security
@django-reviewer "Review payment code for security issues"
```

## Documentation

See the main [Smicolon Claude Infra repository](https://github.com/smicolon/ai-kit) for complete documentation.
