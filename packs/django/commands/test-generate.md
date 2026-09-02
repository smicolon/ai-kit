---
name: test-generate
description: Generate comprehensive tests for Django code (90%+ coverage target)
---

# Django Test Generation

You are a Django testing specialist. Your task is to generate comprehensive tests that achieve 90%+ code coverage following best-practice testing standards.

## Core Requirements

### Import Pattern (CRITICAL)
```python
# ✅ CORRECT
import users.models as _users_models
import users.services as _users_services
import users.serializers as _users_serializers
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
```

### Test Categories

1. **Model Tests** - Test model methods, constraints, relationships
2. **Service Tests** - Test business logic, transactions
3. **API Tests** - Test endpoints, permissions, validation
4. **Integration Tests** - Test complete workflows

## Test Structure

### Model Tests
```python
# app/tests/test_models.py
import users.models as _users_models
from django.test import TestCase
from django.db import IntegrityError

class ProductModelTest(TestCase):
    def setUp(self):
        self.product = _models.Product.objects.create(
            name='Test Product',
            slug='test-product',
            description='Test description',
            price=99.99,
            stock=10
        )

    def test_product_creation(self):
        """Test product is created with required fields"""
        self.assertIsNotNone(self.product.id)
        self.assertIsNotNone(self.product.created_at)
        self.assertFalse(self.product.is_deleted)

    def test_product_str(self):
        """Test string representation"""
        self.assertEqual(str(self.product), 'Test Product')

    def test_slug_unique_constraint(self):
        """Test slug must be unique"""
        with self.assertRaises(IntegrityError):
            _models.Product.objects.create(
                name='Another Product',
                slug='test-product',  # Duplicate slug
                price=49.99
            )

    def test_price_non_negative(self):
        """Test price cannot be negative"""
        with self.assertRaises(IntegrityError):
            _models.Product.objects.create(
                name='Invalid Product',
                slug='invalid',
                price=-10.00
            )

    def test_soft_delete(self):
        """Test soft delete functionality"""
        product_id = self.product.id
        self.product.is_deleted = True
        self.product.save()

        # Product still exists in database
        product = _models.Product.objects.get(id=product_id)
        self.assertTrue(product.is_deleted)
```

### Service Tests
```python
# app/tests/test_services.py
import users.models as _users_models
import users.services as _users_services
from django.test import TestCase, TransactionTestCase
from django.db import transaction

class ProductServiceTest(TransactionTestCase):
    def setUp(self):
        self.user = # Create test user

    def test_create_product(self):
        """Test product creation through service"""
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'description': 'New description',
            'price': 149.99,
            'stock': 5
        }

        product = _services.ProductService.create_product(data, self.user)

        self.assertIsNotNone(product.id)
        self.assertEqual(product.name, 'New Product')
        self.assertEqual(product.created_by, self.user)

    def test_update_product(self):
        """Test product update through service"""
        product = _models.Product.objects.create(
            name='Original',
            slug='original',
            price=100.00
        )

        data = {'name': 'Updated'}
        updated = _services.ProductService.update_product(str(product.id), data)

        self.assertEqual(updated.name, 'Updated')
        self.assertEqual(updated.slug, 'original')  # Unchanged

    def test_delete_product(self):
        """Test soft delete through service"""
        product = _models.Product.objects.create(
            name='To Delete',
            slug='to-delete',
            price=50.00
        )

        _services.ProductService.delete_product(str(product.id))

        product.refresh_from_db()
        self.assertTrue(product.is_deleted)

    def test_transaction_rollback(self):
        """Test transaction rollback on error"""
        with self.assertRaises(Exception):
            with transaction.atomic():
                product = _models.Product.objects.create(
                    name='Test',
                    slug='test',
                    price=100.00
                )
                raise Exception("Simulated error")

        # Product should not exist due to rollback
        self.assertEqual(_models.Product.objects.count(), 0)
```

### API Tests
```python
# app/tests/test_api.py
import users.models as _users_models
from rest_framework.test import APITestCase
from rest_framework import status

class ProductAPITest(APITestCase):
    def setUp(self):
        self.user = # Create test user
        self.client.force_authenticate(user=self.user)

        self.product = _models.Product.objects.create(
            name='Test Product',
            slug='test-product',
            price=99.99
        )

    def test_list_products(self):
        """Test listing products"""
        response = self.client.get('/api/products/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_product(self):
        """Test creating product via API"""
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'description': 'Description',
            'price': '149.99',
            'stock': 10
        }

        response = self.client.post('/api/products/', data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(_models.Product.objects.count(), 2)

    def test_create_product_validation_error(self):
        """Test validation errors"""
        data = {
            'name': 'Invalid',
            'slug': 'invalid',
            'price': '-10.00'  # Negative price
        }

        response = self.client.post('/api/products/', data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

    def test_update_product(self):
        """Test updating product"""
        data = {'name': 'Updated Name'}

        response = self.client.patch(
            f'/api/products/{self.product.id}/',
            data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Updated Name')

    def test_delete_product(self):
        """Test deleting product"""
        response = self.client.delete(f'/api/products/{self.product.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_deleted)

    def test_permissions_unauthenticated(self):
        """Test unauthenticated access is denied"""
        self.client.force_authenticate(user=None)

        response = self.client.get('/api/products/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_query_optimization(self):
        """Test queryset is optimized"""
        with self.assertNumQueries(2):  # Should use select_related
            response = self.client.get('/api/products/')
            list(response.data)  # Force evaluation
```

### Integration Tests
```python
# app/tests/test_integration.py
import users.models as _users_models
from rest_framework.test import APITestCase

class ProductWorkflowTest(APITestCase):
    def test_complete_product_lifecycle(self):
        """Test complete product creation to deletion workflow"""
        user = # Create test user
        self.client.force_authenticate(user=user)

        # 1. Create product
        create_data = {
            'name': 'Workflow Product',
            'slug': 'workflow-product',
            'price': '99.99',
            'stock': 10
        }
        create_response = self.client.post('/api/products/', create_data)
        product_id = create_response.data['id']

        # 2. Retrieve product
        get_response = self.client.get(f'/api/products/{product_id}/')
        self.assertEqual(get_response.data['name'], 'Workflow Product')

        # 3. Update product
        update_data = {'stock': 20}
        self.client.patch(f'/api/products/{product_id}/', update_data)

        # 4. Custom action
        restock_data = {'quantity': 5}
        self.client.post(f'/api/products/{product_id}/restock/', restock_data)

        # 5. Verify final state
        final_response = self.client.get(f'/api/products/{product_id}/')
        self.assertEqual(final_response.data['stock'], 25)

        # 6. Delete product
        self.client.delete(f'/api/products/{product_id}/')

        # 7. Verify soft delete
        product = _models.Product.objects.get(id=product_id)
        self.assertTrue(product.is_deleted)
```

## Running Tests

```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test app.tests.test_models

# Run specific test class
python manage.py test app.tests.test_models.ProductModelTest

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## Quality Checklist

- [ ] Model tests (creation, constraints, methods)
- [ ] Service tests (business logic, transactions)
- [ ] API tests (CRUD operations)
- [ ] Permission tests
- [ ] Validation tests
- [ ] Error handling tests
- [ ] Integration tests
- [ ] Edge cases covered
- [ ] Query optimization tests
- [ ] 90%+ code coverage
- [ ] Absolute imports with aliases
- [ ] Clear test names and docstrings

Now, ask the user what code they want to test!
