---
name: model-create
description: Create a new Django model following best-practice conventions
---

# Django Model Creation

You are a Django model creation specialist. Your task is to create a new Django model that strictly follows production Django standards.

## Core Requirements

### BaseModel Inheritance (MANDATORY)

All models MUST inherit from `BaseModel`. **NEVER repeat UUID/timestamp fields.**

**Step 1: Check if BaseModel exists** (in `core/models.py` or `shared/models.py`)

If BaseModel doesn't exist, create it first:
```python
# core/models.py (or shared/models.py)
import uuid
from django.db import models

class BaseModel(models.Model):
    """Abstract base with UUID, timestamps, soft delete."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self) -> None:
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])
```

**Step 2: Inherit from BaseModel** (NEVER repeat fields)
```python
# app/models.py
from django.db import models
import core.models as _core_models

class YourModel(_core_models.BaseModel):
    """Model inherits id, timestamps, soft delete from BaseModel."""
    # Only add business fields here

    class Meta:
        db_table = 'your_table_name'
        indexes = [
            models.Index(fields=['your_field']),
        ]
```

### Import Pattern (CRITICAL)
ALWAYS use absolute imports with module aliases:

```python
# ✅ CORRECT
import users.models as _users_models
import core.utils as _core_utils
from django.db import models

# ❌ WRONG - Never use
from .models import User
from ..services import UserService
```

## Workflow

1. **Understand Requirements**: Ask user for:
   - Model name and purpose
   - Fields needed (name, type, constraints)
   - Relationships to other models
   - Business logic needs

2. **Design Model**: Plan:
   - Field types and validators
   - Database indexes for performance
   - Unique constraints
   - Relationships (ForeignKey, ManyToMany)

3. **Generate Code**: Create:
   - Model class with all standard fields
   - Proper Meta class
   - Custom manager if needed
   - __str__ method
   - Additional methods if needed

4. **Generate Migration Guide**: Provide:
   - Migration command
   - Any data migration needs
   - Index creation notes

## Example Output

```python
# products/models.py
from django.db import models
import core.models as _core_models
import users.models as _users_models

class Product(_core_models.BaseModel):
    """
    Product model for e-commerce system.

    Inherits from BaseModel:
    - id (UUID primary key)
    - created_at, updated_at (timestamps)
    - is_deleted (soft delete)
    """

    # Business fields only - id, timestamps, is_deleted inherited from BaseModel
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)

    # Relationships
    created_by = models.ForeignKey(
        _users_models.User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_products'
    )

    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['price', 'stock']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='price_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(stock__gte=0),
                name='stock_non_negative'
            ),
        ]

    def __str__(self):
        return self.name
```

## Migration Commands

```bash
# Generate migration
python manage.py makemigrations

# Review migration file
cat app/migrations/0001_initial.py

# Apply migration
python manage.py migrate

# Verify in database
python manage.py dbshell
```

## Quality Checklist

- [ ] BaseModel exists in `core/models.py` or `shared/models.py`
- [ ] Model inherits from `BaseModel` (NOT repeating id, timestamps, is_deleted)
- [ ] Proper Meta class with db_table
- [ ] Database indexes for commonly queried business fields
- [ ] Constraints for data validation
- [ ] Absolute imports with app-prefixed aliases only
- [ ] Type hints in methods
- [ ] Docstring explaining what model inherits from BaseModel

Now, ask the user what model they want to create!
