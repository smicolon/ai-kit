# Smicolon Django Project Template

This template includes all Smicolon conventions for Django development.

## Conventions Included

### 1. Absolute Imports Only
```python
# ✅ CORRECT
from users.models import User
from users.services import UserService

# ❌ WRONG
from .models import User
```

### 2. Standard Model Pattern
```python
import uuid
from django.db import models

class YourModel(models.Model):
    """Model description."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'your_table'
        indexes = [
            models.Index(fields=['created_at']),
        ]
```

### 3. Service Layer
```python
class YourService:
    """Business logic goes here."""

    @staticmethod
    def your_method(param: str) -> Result:
        """
        Method description.

        Args:
            param: Description

        Returns:
            Description
        """
        pass
```

### 4. Module Structure
```
app/
├── __init__.py
├── models/
│   ├── __init__.py       # Export: from app.models.user import User
│   └── user.py
├── services/
│   ├── __init__.py       # Export: from app.services.user_service import UserService
│   └── user_service.py
├── serializers/
│   ├── __init__.py
│   └── user_serializer.py
└── views/
    ├── __init__.py
    └── user_views.py
```

## Quick Start

1. Install Smicolon plugins:
   ```bash
   /plugin marketplace add https://github.com/smicolon/ai-kit
   /plugin install django
   ```

2. Configure MCP servers (project-scoped):
   ```bash
   # Update .mcp.json with your database connection string
   # Replace YOUR_DATABASE_NAME with your actual database name
   ```

3. Authenticate Linear MCP (first time only):
   ```bash
   # In Claude Code, Linear will prompt for authentication
   # Click "Authenticate" and authorize access
   ```

4. Start building:
   ```bash
   @django-architect "Design a user authentication system"
   ```

5. Implement:
   ```bash
   @django-builder "Build the authentication system"
   ```

6. Test:
   ```bash
   @django-tester "Write tests for authentication"
   ```

7. Review:
   ```bash
   @django-reviewer "Review the authentication code"
   ```

## Agents Available

- `@django-architect` - Architecture and design
- `@django-builder` - Feature implementation
- `@django-tester` - Write comprehensive tests (90%+ coverage)
- `@django-reviewer` - Security and code review
- `@django-feature-based` - Large-scale feature-based architecture

## Commands Available

- `/model-create` - Create Django models with conventions
- `/api-endpoint` - Generate complete REST API endpoints
- `/test-generate` - Generate comprehensive tests

## Enforced by Hooks

The post-write hook automatically checks for:
- ✅ Absolute imports
- ✅ UUID primary keys
- ✅ Timestamps on models
- ✅ Soft delete fields
- ✅ Permission classes on views

Violations will be flagged immediately.

## MCP Servers Configured

This template includes project-scoped MCP servers (`.mcp.json`) that automatically load when you work in this directory:

### Linear
- **Purpose**: Issue tracking and project management integration
- **Features**: Create/update/search Linear issues directly from Claude
- **Authentication**: OAuth (one-time setup)
- **Usage**: Ask Claude to "create a Linear issue" or "update issue ABC-123"

### PostgreSQL
- **Purpose**: Database inspection and read-only queries
- **Features**:
  - View database schemas
  - Execute read-only SQL queries
  - Inspect table structures
- **Configuration**: Update connection string in `.mcp.json`:
  ```json
  "postgresql://username:password@localhost:5432/your_db_name"
  ```
- **Security**: Read-only access for safety

### Configuration File

The `.mcp.json` file in this template:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/YOUR_DATABASE_NAME"
      ]
    }
  }
}
```

**Remember to**:
1. Update `YOUR_DATABASE_NAME` with your actual database name
2. Add credentials if your database requires authentication
3. Commit `.mcp.json` to git for team-wide MCP configuration

**Token Optimization**: Project-scoped MCPs only load when you're in this directory, saving ~100k tokens compared to global MCP configuration.
