# Django Import Patterns Reference

Complete guide to Django modular import patterns.

## Core Pattern: Absolute Modular Imports with Aliases

### Standard Form

```python
import {app}.{module} as _{app}_{module}
```

### Examples

```python
import users.models as _users_models
import users.services as _users_services
import users.serializers as _users_serializers
import users.views as _users_views
import users.utils as _users_utils
```

## Usage After Import

```python
import users.models as _users_models

# Access classes through the alias
user = _users_models.User.objects.get(id=user_id)
profile = _users_models.Profile.objects.create(user=user)
```

## Cross-App Imports

When importing from different apps, each alias is unique:

```python
# orders/services.py
import users.models as _users_models
import products.models as _products_models
import orders.models as _orders_models

class OrderService:
    def create_order(self, user_id, product_id):
        user = _users_models.User.objects.get(id=user_id)
        product = _products_models.Product.objects.get(id=product_id)
        order = _orders_models.Order.objects.create(user=user, product=product)
        return order
```

## Nested Module Imports

For sub-modules, include the full path:

```python
# ✅ CORRECT
import users.models.user as _user_models
import users.models.profile as _profile_models
import users.services.auth as _auth_services

# Usage
user = _user_models.User.objects.get(...)
profile = _profile_models.Profile.objects.get(...)
token = _auth_services.AuthService.generate_token(...)
```

## Third-Party and Django Imports

Standard imports for framework and libraries:

```python
# Django imports - use standard form
from django.db import models
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

# Third-party - use standard form
import uuid
from typing import List, Optional
import pandas as pd

# Project imports - use modular pattern with app prefix
import users.models as _users_models
import users.services as _users_services
```

## Complete File Example

```python
# users/views.py
import uuid
from typing import Optional

from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import users.models as _users_models
import users.serializers as _users_serializers
import users.services as _users_services
import core.permissions as _core_permissions


class UserViewSet(viewsets.ModelViewSet):
    """User management endpoints."""

    queryset = _users_models.User.objects.all()
    serializer_class = _users_serializers.UserSerializer
    permission_classes = [IsAuthenticated, _core_permissions.IsOwnerOrAdmin]

    def create(self, request):
        """Create new user."""
        user = _users_services.UserService.create_user(request.data)
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate user account."""
        user = self.get_object()
        _users_services.UserService.activate_user(user)
        return Response({'status': 'activated'})
```

## Import Order

Follow this order for clean organization:

```python
# 1. Standard library
import uuid
import json
from typing import List, Optional

# 2. Django imports
from django.db import models, transaction
from django.contrib.auth import get_user_model

# 3. Third-party
from rest_framework import serializers
import pandas as pd

# 4. Project imports (app-prefixed pattern)
import users.models as _users_models
import users.services as _users_services
import core.utils as _core_utils
```

## Common Mistakes and Fixes

### Mistake 1: Relative Imports

```python
# ❌ WRONG
from .models import User
from ..services import UserService
from . import models

# ✅ CORRECT
import users.models as _users_models
import users.services as _users_services
```

### Mistake 2: Direct Class Imports

```python
# ❌ WRONG
from users.models import User, Profile
from users.services import UserService

# ✅ CORRECT
import users.models as _users_models
import users.services as _users_services

# Usage
user = _users_models.User.objects.get(...)
_users_services.UserService.create_user(...)
```

### Mistake 3: No Alias

```python
# ❌ WRONG
import users.models
import users.services

# ✅ CORRECT
import users.models as _users_models
import users.services as _users_services
```

### Mistake 4: Inconsistent Aliases

```python
# ❌ WRONG (inconsistent naming)
import users.models as user_models
import products.models as prod_models
import orders.models as m

# ✅ CORRECT (consistent pattern)
import users.models as _user_models
import products.models as _product_models
import orders.models as _order_models
```

## Alias Naming Conventions

### Pattern Rule

Always use app-prefixed aliases for clarity:

```python
import {app}.{module} as _{app}_{module}
```

### Examples

```python
# In users/services.py
import users.models as _users_models
import users.serializers as _users_serializers
```

```python
# In orders/services.py - clear which app each import is from
import users.models as _users_models
import products.models as _products_models
import orders.models as _orders_models
```

### Common Module Types

```python
import {app}.models as _{app}_models
import {app}.services as _{app}_services
import {app}.serializers as _{app}_serializers
import {app}.views as _{app}_views
import {app}.utils as _{app}_utils
import {app}.permissions as _{app}_permissions
import {app}.forms as _{app}_forms
```

## Feature-Based Architecture

For large projects using feature-based structure:

```python
# features/authentication/services.py
import features.authentication.models as _auth_models
import features.authentication.serializers as _auth_serializers
import features.users.models as _users_models
import shared.utils as _shared_utils

class AuthService:
    def login(self, credentials):
        user = _users_models.User.objects.get(...)
        token = _auth_models.AuthToken.objects.create(user=user)
        return _auth_serializers.TokenSerializer(token).data
```

## Why This Pattern?

### Benefits

1. **Clear Module Boundaries**
   - Immediately see which module/app classes come from
   - `_models.User` vs `_user_models.User` vs `_product_models.User`

2. **Refactoring Safety**
   - Change class names without updating imports everywhere
   - Move classes between files easily
   - Barrel exports simplify refactoring

3. **No Circular Dependencies**
   - Absolute imports avoid circular dependency issues
   - Clear dependency graph

4. **Scales to Large Projects**
   - Works perfectly with 100+ apps
   - Consistent across entire codebase
   - New developers learn pattern once

5. **IDE Support**
   - Better autocomplete
   - Click-through to module works
   - Refactoring tools work better

### Comparison

```python
# Relative imports - unclear origin
from .models import User  # Where is this file?
from ..services import UserService  # How many levels up?

# Direct imports - verbose and breaks encapsulation
from users.models.user import User
from users.models.profile import Profile
from users.models.organization import Organization
# ... 20 more imports

# Modular with app-prefixed aliases - perfect balance
import users.models as _users_models
import orders.models as _orders_models
# Clear! No namespace conflicts, easy to identify source
```

## Edge Cases

### Circular Import Prevention

```python
# users/models.py
import users.services as _users_services  # ❌ May cause circular import

# Solution: Import inside method
class User(models.Model):
    def some_method(self):
        import users.services as _users_services  # ✅ Deferred import
        return _users_services.UserService.do_something()
```

### Type Hints

```python
from __future__ import annotations  # Enable forward references
import users.models as _users_models

def process_user(user: _users_models.User) -> None:
    """Process user."""
    pass
```

## Enforcement

This pattern is enforced by:
1. **user-prompt-submit-hook.sh** - Reminds conventions before every prompt
2. **import-convention-enforcer skill** - Auto-fixes violations when code is written
3. **django-reviewer agent** - Checks compliance during code review

All three work together to ensure 100% compliance.
