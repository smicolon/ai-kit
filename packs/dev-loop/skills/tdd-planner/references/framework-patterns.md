# Framework Detection and Patterns

Reference for detecting frameworks and applying appropriate TDD patterns.

**Supports any framework** - Use `--test-cmd` and `--lint-cmd` for unlisted frameworks.

---

## Framework Detection

### Detection Order

Check in this order (first match wins):

**Mobile:**
1. **Flutter** - `pubspec.yaml` with `flutter:`
2. **React Native** - `react-native` in package.json

**Python:**
3. **Django** - `manage.py` exists
4. **FastAPI** - `fastapi` in pyproject.toml
5. **Flask** - `flask` in pyproject.toml

**Node.js:**
6. **NestJS** - `@nestjs/core` in package.json
7. **Next.js** - `next` in package.json
8. **Nuxt.js** - `nuxt` in package.json
9. **Hono** - `hono` in package.json
10. **Express** - `express` in package.json
11. **TanStack** - `@tanstack/react-router` in package.json

**Systems:**
12. **Go** - `go.mod` exists
13. **Rust** - `Cargo.toml` exists

**Web Frameworks:**
14. **Rails** - `rails` in Gemfile
15. **Laravel** - `laravel` in composer.json

**Generic Fallbacks:**
16. **Python** - `pyproject.toml` or `requirements.txt` exists
17. **Node** - `package.json` exists

### Detection Commands

```bash
# Mobile
[ -f "pubspec.yaml" ] && grep -q "flutter:" pubspec.yaml && echo "flutter"
[ -f "package.json" ] && grep -q "react-native" package.json && echo "react-native"

# Python
[ -f "manage.py" ] && echo "django"
[ -f "pyproject.toml" ] && grep -q "fastapi" pyproject.toml && echo "fastapi"
[ -f "pyproject.toml" ] && grep -q "flask" pyproject.toml && echo "flask"

# Node.js
grep -q "@nestjs/core" package.json 2>/dev/null && echo "nestjs"
grep -q '"next"' package.json 2>/dev/null && echo "nextjs"
grep -q '"nuxt"' package.json 2>/dev/null && echo "nuxtjs"
grep -q '"hono"' package.json 2>/dev/null && echo "hono"
grep -q '"express"' package.json 2>/dev/null && echo "express"
grep -q '"@tanstack/react-router"' package.json 2>/dev/null && echo "tanstack"

# Go
[ -f "go.mod" ] && echo "go"

# Rust
[ -f "Cargo.toml" ] && echo "rust"

# Ruby
[ -f "Gemfile" ] && grep -q "rails" Gemfile && echo "rails"

# PHP
[ -f "composer.json" ] && grep -q "laravel" composer.json && echo "laravel"

# Generic fallbacks
[ -f "pyproject.toml" ] || [ -f "requirements.txt" ] && echo "python"
[ -f "package.json" ] && echo "node"
```

### Package Manager Detection

For Node.js projects, detect package manager from lockfile:

```bash
# Detect package manager (first match wins, defaults to bun)
[ -f "bun.lockb" ] && PM="bun"
[ -f "pnpm-lock.yaml" ] && PM="pnpm"
[ -f "yarn.lock" ] && PM="yarn"
[ -f "package-lock.json" ] && PM="npm"
[ -z "$PM" ] && PM="bun"  # Default to bun
```

Use `${PM} test` and `${PM} run lint` for Node.js commands.

### Custom Frameworks

For unlisted frameworks, use CLI flags:

```bash
/dev-plan "Build auth" --framework elixir --test-cmd "mix test" --lint-cmd "mix credo"
/dev-plan "Add API" --framework kotlin --test-cmd "gradle test" --lint-cmd "ktlint"
```

---

## Django Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `pytest --tb=short` |
| Test Verbose | `pytest -v` |
| Test Single | `pytest tests/test_file.py::test_name` |
| Coverage | `pytest --cov=app_name --cov-report=term-missing` |
| Lint | `ruff check .` |
| Format | `ruff format .` |
| Migrations | `python manage.py makemigrations && python manage.py migrate` |

### TDD Phase Template

```markdown
### Phase N: Red - {{Component}} Tests

**Tasks:**
- Create tests/test_{{component}}.py
- Import necessary fixtures
- Write test cases using pytest

**Verification:**
```bash
pytest tests/test_{{component}}.py -v
```

**Conventions:**
- Use `import {{app}}.models as _{{app}}_models`
- Use factory_boy for test data
- Use pytest fixtures, not setUp/tearDown
```

### Common Test Patterns

```python
# Model tests
import pytest
import users.models as _users_models

@pytest.mark.django_db
def test_user_creation():
    user = _users_models.User.objects.create_user(
        email="test@example.com",
        password="testpass123"
    )
    assert user.email == "test@example.com"
    assert user.check_password("testpass123")

# API tests
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_login(api_client):
    response = api_client.post("/api/auth/login/", {
        "email": "test@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    assert "token" in response.data
```

---

## NestJS Patterns

### Commands

Use detected package manager (`${PM}` = bun/pnpm/yarn/npm):

| Purpose | Command |
|---------|---------|
| Test | `${PM} test` |
| Test Watch | `${PM} run test:watch` |
| Test Coverage | `${PM} run test:cov` |
| Test E2E | `${PM} run test:e2e` |
| Lint | `${PM} run lint` |
| Format | `${PM} run format` |

### TDD Phase Template

```markdown
### Phase N: Red - {{Component}} Tests

**Tasks:**
- Create {{component}}.spec.ts
- Set up test module with mocks
- Write test cases

**Verification:**
```bash
${PM} test -- --testPathPattern={{component}}
```

**Conventions:**
- Use barrel imports: `import { Entity } from 'src/module/entities'`
- Mock dependencies with Jest
- Use describe/it blocks
```

### Common Test Patterns

```typescript
// Service tests
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<any>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should find all users', async () => {
    mockRepository.find.mockResolvedValue([{ id: '1', email: 'test@test.com' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });
});
```

---

## Next.js Patterns

### Commands

Use detected package manager (`${PM}` = bun/pnpm/yarn/npm):

| Purpose | Command |
|---------|---------|
| Test | `${PM} test` |
| Test Watch | `${PM} test -- --watch` |
| Test Coverage | `${PM} test -- --coverage` |
| Lint | `${PM} run lint` |
| Type Check | `${PM} run tsc --noEmit` |

### TDD Phase Template

```markdown
### Phase N: Red - {{Component}} Tests

**Tasks:**
- Create __tests__/{{component}}.test.tsx
- Set up React Testing Library
- Write component/hook tests

**Verification:**
```bash
${PM} test -- --testPathPattern={{component}}
```

**Conventions:**
- Use @/ path aliases
- Test user interactions, not implementation
- Use React Testing Library
```

### Common Test Patterns

```tsx
// Component tests
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('should submit form with email and password', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});

// Hook tests
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## Nuxt.js Patterns

### Commands

Use detected package manager (`${PM}` = bun/pnpm/yarn/npm):

| Purpose | Command |
|---------|---------|
| Test | `${PM} test` (vitest) |
| Test Watch | `${PM} test -- --watch` |
| Test Coverage | `${PM} test -- --coverage` |
| Lint | `${PM} run lint` |
| Type Check | `${PM} run nuxi typecheck` |

### TDD Phase Template

```markdown
### Phase N: Red - {{Component}} Tests

**Tasks:**
- Create tests/{{component}}.test.ts
- Set up Vue Test Utils
- Write component/composable tests

**Verification:**
```bash
${PM} test -- {{component}}
```

**Conventions:**
- Use ~/ path aliases
- Use Vue 3 Composition API
- Test with @vue/test-utils
```

### Common Test Patterns

```typescript
// Component tests
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import LoginForm from '~/components/LoginForm.vue';

describe('LoginForm', () => {
  it('emits submit with credentials', async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('input[name="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')[0]).toEqual([{
      email: 'test@example.com',
      password: 'password123',
    }]);
  });
});

// Composable tests
import { describe, it, expect } from 'vitest';
import { useAuth } from '~/composables/useAuth';

describe('useAuth', () => {
  it('should login user', async () => {
    const { login, isAuthenticated } = useAuth();

    await login('test@example.com', 'password');

    expect(isAuthenticated.value).toBe(true);
  });
});
```

---

## Generic Fallback

When no specific framework is detected:

### Commands

| Purpose | Command |
|---------|---------|
| Test (Python) | `pytest` |
| Test (Node) | `${PM} test` (defaults to bun) |
| Lint (Python) | `ruff check .` |
| Lint (Node) | `${PM} run lint` |

### TDD Phase Template

```markdown
### Phase N: Red - {{Component}} Tests

**Tasks:**
- Create test file for component
- Write test cases

**Verification:**
Run test command for the detected test framework

**Self-correction:**
- If no test framework found, suggest installing one
```

---

## Framework-Specific Considerations

### Django Production Conventions

- Use absolute modular imports: `import app.models as _app_models`
- UUID primary keys on all models
- Timestamps: `created_at`, `updated_at`
- Soft deletes: `is_deleted` field
- Service layer for business logic

### NestJS Production Conventions

- Barrel exports in all directories
- Absolute imports: `import { X } from 'src/module/entities'`
- UUID primary keys
- TypeORM soft deletes with `@DeleteDateColumn()`

### Next.js Production Conventions

- Path aliases: `@/components`, `@/hooks`
- React Hook Form + Zod for forms
- TanStack Query for data fetching
- WCAG 2.1 AA accessibility

### Nuxt.js Production Conventions

- Path aliases: `~/components`, `~/composables`
- VeeValidate + Zod for forms
- Built-in composables: `useFetch`, `useAsyncData`
- WCAG 2.1 AA accessibility

---

## Go Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `go test ./...` |
| Test Verbose | `go test -v ./...` |
| Test Single | `go test -run TestName ./pkg` |
| Coverage | `go test -cover ./...` |
| Lint | `golangci-lint run` |
| Format | `gofmt -w .` |

### Common Test Patterns

```go
// user_test.go
package user

import (
    "testing"
)

func TestCreateUser(t *testing.T) {
    // Arrange
    service := NewUserService(mockDB)

    // Act
    user, err := service.Create("test@example.com", "password123")

    // Assert
    if err != nil {
        t.Fatalf("expected no error, got %v", err)
    }
    if user.Email != "test@example.com" {
        t.Errorf("expected email test@example.com, got %s", user.Email)
    }
}

func TestCreateUser_InvalidEmail(t *testing.T) {
    service := NewUserService(mockDB)

    _, err := service.Create("invalid", "password123")

    if err == nil {
        t.Fatal("expected error for invalid email")
    }
}
```

### Table-Driven Tests

```go
func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid email", "test@example.com", false},
        {"missing @", "testexample.com", true},
        {"empty", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateEmail() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

---

## Rust Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `cargo test` |
| Test Single | `cargo test test_name` |
| Test Verbose | `cargo test -- --nocapture` |
| Lint | `cargo clippy` |
| Format | `cargo fmt` |

### Common Test Patterns

```rust
// src/user.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_user() {
        let user = User::new("test@example.com", "password123");
        assert_eq!(user.email, "test@example.com");
        assert!(user.verify_password("password123"));
    }

    #[test]
    fn test_invalid_email() {
        let result = User::new("invalid", "password123");
        assert!(result.is_err());
    }

    #[test]
    #[should_panic(expected = "Email required")]
    fn test_empty_email_panics() {
        User::new("", "password123").unwrap();
    }
}
```

---

## Rails Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `bundle exec rspec` |
| Test Single | `bundle exec rspec spec/models/user_spec.rb` |
| Test Line | `bundle exec rspec spec/models/user_spec.rb:15` |
| Lint | `bundle exec rubocop` |
| Format | `bundle exec rubocop -a` |

### Common Test Patterns (RSpec)

```ruby
# spec/models/user_spec.rb
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }
  end

  describe '#authenticate' do
    let(:user) { create(:user, password: 'password123') }

    context 'with valid password' do
      it 'returns true' do
        expect(user.authenticate('password123')).to be true
      end
    end

    context 'with invalid password' do
      it 'returns false' do
        expect(user.authenticate('wrong')).to be false
      end
    end
  end
end

# spec/requests/auth_spec.rb
RSpec.describe 'Authentication', type: :request do
  describe 'POST /login' do
    let(:user) { create(:user) }

    it 'returns JWT token' do
      post '/login', params: { email: user.email, password: 'password123' }
      expect(response).to have_http_status(:ok)
      expect(json_response['token']).to be_present
    end
  end
end
```

---

## Laravel Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `php artisan test` |
| Test Filter | `php artisan test --filter=UserTest` |
| Test Parallel | `php artisan test --parallel` |
| Lint | `./vendor/bin/pint` |
| Static Analysis | `./vendor/bin/phpstan analyse` |

### Common Test Patterns

```php
// tests/Feature/AuthTest.php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();
    }
}
```

---

## FastAPI Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `pytest --tb=short` |
| Test Verbose | `pytest -v` |
| Coverage | `pytest --cov=app` |
| Lint | `ruff check .` |
| Format | `ruff format .` |

### Common Test Patterns

```python
# tests/test_auth.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_login(client):
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401
```

---

## Hono Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `bun test` |
| Test Watch | `bun test --watch` |
| Lint | `bun run lint` |
| Format | `bun run format` |

### Common Test Patterns

```typescript
// src/routes/auth.test.ts
import { describe, it, expect } from 'bun:test';
import { app } from './app';

describe('Auth Routes', () => {
  it('POST /login returns token', async () => {
    const res = await app.request('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBeDefined();
  });

  it('POST /login rejects invalid credentials', async () => {
    const res = await app.request('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(401);
  });
});
```

---

## Flutter Patterns

### Commands

| Purpose | Command |
|---------|---------|
| Test | `flutter test` |
| Test Single | `flutter test test/widget_test.dart` |
| Coverage | `flutter test --coverage` |
| Lint | `flutter analyze` |
| Format | `dart format .` |

### Common Test Patterns

```dart
// test/providers/auth_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:myapp/providers/auth_provider.dart';

void main() {
  group('AuthProvider', () {
    test('initial state is unauthenticated', () {
      final container = ProviderContainer();
      final state = container.read(authProvider);

      expect(state.isAuthenticated, false);
      expect(state.user, isNull);
    });

    test('login updates state', () async {
      final container = ProviderContainer();

      await container.read(authProvider.notifier).login(
        'test@example.com',
        'password123',
      );

      final state = container.read(authProvider);
      expect(state.isAuthenticated, true);
      expect(state.user?.email, 'test@example.com');
    });
  });
}

// test/widgets/login_screen_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:myapp/screens/login_screen.dart';

void main() {
  testWidgets('login form submits correctly', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(home: LoginScreen()),
      ),
    );

    await tester.enterText(find.byKey(Key('email')), 'test@example.com');
    await tester.enterText(find.byKey(Key('password')), 'password123');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();

    // Verify navigation or state change
  });
}
```
