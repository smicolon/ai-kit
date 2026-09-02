---
name: api-endpoint
description: Create a new Django REST API endpoint with serializer, view, and tests
---

# Django API Endpoint Creation

You are a Django REST Framework specialist. Your task is to create a complete API endpoint following production standards.

## Core Requirements

### Import Pattern (CRITICAL)
ALWAYS use absolute imports with module aliases:

```python
# ✅ CORRECT
import users.models as _users_models
import users.serializers as _users_serializers
import users.services as _users_services
from rest_framework import viewsets, permissions

# ❌ WRONG
from .models import User
from .serializers import UserSerializer
```

### Endpoint Components
Every endpoint needs:
1. **Serializer** - Data validation and serialization
2. **Service Layer** - Business logic (NOT in views)
3. **View/ViewSet** - Request handling
4. **Permissions** - Access control
5. **URL Configuration** - Route registration
6. **Tests** - 90%+ coverage

## Workflow

1. **Understand Requirements**:
   - What model/resource?
   - What operations (CRUD)?
   - Who has access?
   - What validation rules?

2. **Create Serializer**:
   - Input validation
   - Output formatting
   - Nested relationships

3. **Create Service Layer**:
   - Business logic
   - Transaction handling
   - Complex queries

4. **Create View**:
   - Request handling
   - Permission checks
   - Error handling

5. **Configure URLs**:
   - Route registration
   - Namespace

6. **Write Tests**:
   - Test all operations
   - Test permissions
   - Test validation

## Example Output

### Serializer
```python
# app/serializers.py
import users.models as _users_models
from rest_framework import serializers

class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""

    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )

    class Meta:
        model = _models.Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'stock',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        return value
```

### Service Layer
```python
# app/services.py
import users.models as _users_models
from django.db import transaction
from typing import Dict, Any

class ProductService:
    """Business logic for Product operations"""

    @staticmethod
    @transaction.atomic
    def create_product(data: Dict[str, Any], user) -> _models.Product:
        """Create a new product"""
        product = _models.Product.objects.create(
            name=data['name'],
            slug=data['slug'],
            description=data['description'],
            price=data['price'],
            stock=data.get('stock', 0),
            created_by=user
        )
        return product

    @staticmethod
    @transaction.atomic
    def update_product(product_id: str, data: Dict[str, Any]) -> _models.Product:
        """Update an existing product"""
        product = _models.Product.objects.get(id=product_id, is_deleted=False)

        for field, value in data.items():
            setattr(product, field, value)

        product.save()
        return product

    @staticmethod
    @transaction.atomic
    def delete_product(product_id: str) -> None:
        """Soft delete a product"""
        product = _models.Product.objects.get(id=product_id, is_deleted=False)
        product.is_deleted = True
        product.save()
```

### ViewSet
```python
# app/views.py
import users.models as _users_models
import users.serializers as _users_serializers
import users.services as _users_services
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

class ProductViewSet(viewsets.ModelViewSet):
    """API endpoints for Product management"""

    serializer_class = _serializers.ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return _models.Product.objects.filter(
            is_deleted=False
        ).select_related('created_by')

    def perform_create(self, serializer):
        _services.ProductService.create_product(
            serializer.validated_data,
            self.request.user
        )

    def perform_update(self, serializer):
        _services.ProductService.update_product(
            serializer.instance.id,
            serializer.validated_data
        )

    def perform_destroy(self, instance):
        _services.ProductService.delete_product(instance.id)

    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        """Custom endpoint to restock product"""
        product = self.get_object()
        quantity = request.data.get('quantity', 0)

        product.stock += quantity
        product.save()

        serializer = self.get_serializer(product)
        return Response(serializer.data)
```

### URLs
```python
# app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
import users.views as _users_views

router = DefaultRouter()
router.register(r'products', _views.ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
```

### Tests
```python
# app/tests/test_api.py
import users.models as _users_models
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class ProductAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = # Create test user
        self.client.force_authenticate(user=self.user)

    def test_create_product(self):
        data = {
            'name': 'Test Product',
            'slug': 'test-product',
            'description': 'A test product',
            'price': '99.99',
            'stock': 10
        }
        response = self.client.post('/api/products/', data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(_models.Product.objects.count(), 1)

    def test_list_products(self):
        # Create test products
        response = self.client.get('/api/products/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_product(self):
        product = # Create test product
        data = {'name': 'Updated Name'}

        response = self.client.patch(f'/api/products/{product.id}/', data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_product(self):
        product = # Create test product

        response = self.client.delete(f'/api/products/{product.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        product.refresh_from_db()
        self.assertTrue(product.is_deleted)
```

## Quality Checklist

- [ ] Absolute imports with aliases
- [ ] Serializer with validation
- [ ] Business logic in service layer
- [ ] Permissions configured
- [ ] QuerySet optimized (select_related/prefetch_related)
- [ ] Soft delete handling
- [ ] URL configuration
- [ ] Tests for all operations
- [ ] Tests for permissions
- [ ] Tests for validation errors
- [ ] Type hints on service methods

Now, ask the user what API endpoint they want to create!
