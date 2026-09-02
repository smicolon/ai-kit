# Skills Documentation

Comprehensive guide to auto-enforcing skills across the Smicolon marketplace plugins.

## What Are Skills?

Skills are **auto-invoked capabilities** that Claude Code activates based on context. Unlike agents (invoked with `@agent-name`) or commands (invoked with `/command-name`), skills run **automatically** when detecting relevant code patterns.

### Skills vs Other Components

| Component | Invocation | Use Case |
|-----------|-----------|----------|
| **Skills** | Automatic (model-invoked) | Enforce conventions, prevent mistakes |
| **Agents** | Manual (`@agent-name`) | Complex workflows, planning, implementation |
| **Commands** | Manual (`/command-name`) | Interactive guided workflows |
| **Hooks** | Automatic (event-based) | Pre/post-processing, validation |

### How Skills Work

1. **Context Detection**: Claude analyzes your prompt and code
2. **Auto-Activation**: Skills activate when detecting relevant patterns
3. **Proactive Enforcement**: Skills fix violations immediately
4. **Knowledge Transfer**: Skills always explain WHY conventions exist

## Skills by Plugin

### Django Plugin (8 Skills)

#### 1. import-convention-enforcer
**Auto-fixes imports to absolute modular pattern**

```python
# ❌ Detects violation
from .models import User
from users.models import User

# ✅ Auto-fixes to
import users.models as _users_models
# Usage: user = _users_models.User.objects.get(id=user_id)
```

**Activates when:**
- Writing Python imports
- Creating Django models/views/serializers
- User mentions "import", "Django", "models"

**Benefits:**
- Eliminates circular imports
- Enables confident refactoring
- Consistent codebase pattern

#### 2. model-entity-validator
**Auto-adds required fields to Django models**

```python
# ❌ User writes
class User(models.Model):
    email = models.EmailField()
    name = models.CharField(max_length=100)

# ✅ Auto-adds
class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField()
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
```

**Activates when:**
- Creating Django models
- Modifying model definitions
- User mentions "model", "entity", "database"

**Required fields:**
- UUID primary key (secure, distributed-friendly)
- Timestamps (audit trail)
- Soft delete (data recovery)

#### 3. security-first-validator
**Auto-checks API security requirements**

```python
# ❌ Blocks if missing
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()  # No permissions!
    serializer_class = UserSerializer

# ✅ Requires
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

**Activates when:**
- Creating API views/viewsets
- Writing serializers
- User mentions "API", "endpoint", "view"

**Enforces:**
- Permission classes on ALL views
- Serializer validation (no raw request.data)
- Rate limiting for security
- OWASP compliance

#### 4. test-coverage-advisor
**Auto-suggests tests for 90%+ coverage**

```python
# User creates users/services/user_service.py

# ✅ Skill auto-suggests
"""
Missing test coverage for:
1. users/tests/test_user_service.py
   - test_create_user_success()
   - test_create_user_duplicate_email()
   - test_create_user_invalid_data()
   - test_get_user_by_id()
   - test_get_user_not_found()
"""

# Generates test stubs automatically
```

**Activates when:**
- Creating new services/views/models
- User runs tests
- User mentions "test", "coverage"

**Provides:**
- Test suggestions for 90%+ coverage
- Pytest test stubs
- Edge case identification

#### 5. performance-optimizer
**Auto-detects N+1 query problems**

```python
# ❌ Detects N+1 query
def get_users_with_profiles(request):
    users = User.objects.all()
    for user in users:
        print(user.profile.bio)  # N+1 query!

# ✅ Auto-suggests
def get_users_with_profiles(request):
    users = User.objects.select_related('profile').all()
    for user in users:
        print(user.profile.bio)  # ✅ Single query
```

**Activates when:**
- Writing ORM queries
- Creating views that fetch related data
- User mentions "performance", "query", "slow"

**Detects:**
- N+1 queries
- Missing select_related/prefetch_related
- Inefficient filtering

#### 6. migration-safety-checker
**Auto-validates migrations won't cause data loss**

```python
# ❌ Blocks unsafe migration
class Migration(migrations.Migration):
    operations = [
        migrations.RemoveField('User', 'legacy_field'),  # Data loss!
    ]

# ✅ Requires 3-step pattern
# Step 1: Make field nullable
# Step 2: Deploy code that stops writing to field
# Step 3: Remove field in separate migration
```

**Activates when:**
- Running makemigrations
- Creating migrations
- User mentions "migration", "schema"

**Prevents:**
- Data loss from column drops
- Downtime from blocking operations
- Type changes without data migration

#### 7. test-validity-checker
**Auto-validates test quality and structure**

```python
# ❌ Detects issues
def test_something():
    pass  # Empty test!

def test_create_user():
    result = create_user("test@example.com")
    # No assertion!

# ✅ Requires
def test_create_user():
    result = create_user("test@example.com")
    assert result is not None
    assert result.email == "test@example.com"
```

**Activates when:**
- Writing pytest tests
- User mentions "test", "TDD"

**Enforces:**
- No empty tests
- Tests must have assertions
- Meaningful test names

#### 8. red-phase-verifier
**Verifies TDD red phase (tests fail before implementation)**

```python
# ✅ Red phase verified
# Running: pytest users/tests/test_user_service.py
# FAILED: test_create_user - UserService not implemented
# TDD: Red phase confirmed - proceed to green phase

# ❌ Blocks if tests already pass
# Running: pytest users/tests/test_user_service.py
# PASSED: test_create_user
# TDD: Tests already pass - red phase incomplete!
```

**Activates when:**
- User starts TDD loop
- User mentions "TDD", "red phase"

**Enforces:**
- Tests must fail before implementation
- Prevents writing tests after code

### Next.js Plugin (3 Skills)

#### 1. accessibility-validator
**Auto-checks WCAG 2.1 AA compliance**

```tsx
// ❌ Detects accessibility violation
<div onClick={handleLogin}>Login</div>

// ✅ Auto-fixes to
<button onClick={handleLogin} type="button">
  Login
</button>

// ❌ Detects missing ARIA
<input placeholder="Search" />

// ✅ Auto-adds
<input
  type="text"
  placeholder="Search"
  aria-label="Search products"
/>
```

**Activates when:**
- Creating React components
- Writing JSX/TSX
- User mentions "component", "UI", "form"

**Enforces:**
- Semantic HTML (button not div)
- Keyboard navigation (no onClick on divs)
- ARIA attributes
- Focus management
- Color contrast ratios

#### 2. react-form-validator
**Auto-enforces React Hook Form + Zod**

```tsx
// ❌ Detects invalid form
<form onSubmit={handleSubmit}>
  <input name="email" />  // No validation!
</form>

// ✅ Auto-converts to
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
})

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

**Activates when:**
- Creating forms
- User mentions "form", "input", "validation"

**Enforces:**
- React Hook Form (performance, UX)
- Zod validation (type-safe)
- Error handling
- Accessibility integration

#### 3. import-convention-enforcer
**Auto-fixes imports to use path aliases**

```tsx
// ❌ Detects relative imports
import { Button } from '../../../components/ui/button'
import { useAuth } from '../../hooks/useAuth'

// ✅ Auto-fixes to
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
```

**Activates when:**
- Writing TypeScript imports
- Creating Next.js components
- User mentions "import", "component"

**Benefits:**
- Shorter imports
- Easier refactoring
- Consistent pattern

### NestJS Plugin (2 Skills)

#### 1. barrel-export-manager
**Auto-creates/maintains index.ts barrel exports**

```typescript
// User creates: users/entities/user.entity.ts

// ✅ Skill auto-creates users/entities/index.ts:
export * from './user.entity'
export * from './profile.entity'

// Usage becomes clean:
import { User, Profile } from 'src/users/entities'
```

**Activates when:**
- Creating entities, DTOs, services, controllers
- User mentions "NestJS", "module", "create"

**Auto-manages:**
- Creates index.ts in module directories
- Updates exports when files added/removed
- Maintains consistent barrel pattern

#### 2. import-convention-enforcer
**Auto-enforces absolute imports from barrels**

```typescript
// ❌ Detects violations
import { User } from './entities/user.entity'
import { UsersService } from '../services/users.service'

// ✅ Auto-fixes to
import { User } from 'src/users/entities'
import { UsersService } from 'src/users/services'
```

**Activates when:**
- Writing TypeScript imports
- Creating NestJS modules
- User mentions "import", "NestJS"

**Enforces:**
- Absolute paths from src/
- Barrel export usage
- Import organization (NestJS core → third-party → project)

### Nuxt.js Plugin (3 Skills)

#### 1. accessibility-validator
**Auto-checks WCAG 2.1 AA compliance (Vue 3)**

```vue
<!-- ❌ Detects accessibility violation -->
<div @click="handleLogin">Login</div>

<!-- ✅ Auto-fixes to -->
<button type="button" @click="handleLogin">
  Login
</button>

<!-- ❌ Detects missing ARIA -->
<input v-model="search" placeholder="Search" />

<!-- ✅ Auto-adds -->
<label for="search">Search</label>
<input
  id="search"
  v-model="search"
  placeholder="Search"
  aria-describedby="search-hint"
/>
```

**Activates when:**
- Creating Vue components
- Writing template sections
- User mentions "component", "form"

**Enforces:**
- Semantic HTML
- Keyboard navigation
- ARIA attributes
- Focus management

#### 2. veevalidate-form-validator
**Auto-enforces VeeValidate + Zod**

```vue
<!-- ❌ Detects unvalidated form -->
<form @submit="handleSubmit">
  <input v-model="email" />  <!-- No validation! -->
</form>

<!-- ✅ Auto-converts to -->
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const schema = toTypedSchema(
  z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })
)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
})

const [email, emailAttrs] = defineField('email')
</script>

<template>
  <form @submit="handleSubmit(onSubmit)">
    <input v-model="email" v-bind="emailAttrs" />
    <span v-if="errors.email">{{ errors.email }}</span>
  </form>
</template>
```

**Activates when:**
- Creating forms in Vue
- User mentions "form", "validation"

**Enforces:**
- VeeValidate integration
- Zod schemas for type safety
- Error display patterns

#### 3. import-convention-enforcer
**Auto-fixes imports to use Nuxt aliases**

```vue
<!-- ❌ Detects relative imports -->
<script setup>
import { ref } from 'vue'  // Unnecessary
import { formatDate } from '../../../utils/date'
</script>

<!-- ✅ Auto-fixes to -->
<script setup>
// ref is auto-imported in Nuxt
import { formatDate } from '~/utils/date'
</script>
```

**Activates when:**
- Writing Vue imports
- Creating Nuxt components

**Enforces:**
- ~/ path alias usage
- Auto-import awareness (no unnecessary imports)
- Import organization

### TanStack Router Plugin (11 Skills)

#### 1. router-patterns
**Auto-enforce TanStack Router file-based routing conventions**

```tsx
// ❌ Avoid untyped route definition
export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

// ✅ Enforce type-safe loader and search params validation
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const postSearchSchema = z.object({
  tab: z.enum(['details', 'comments']).default('details'),
})

export const Route = createFileRoute('/posts/$postId')({
  validateSearch: (search) => postSearchSchema.parse(search),
  loader: ({ params: { postId } }) => fetchPost(postId),
  component: PostComponent,
})
```

**Activates when:**
- Creating or editing file-based routes under `routes/`
- Configuring route parameters, loaders, or layout routes
- User mentions "TanStack Router", "routing", "file-based route"

**Enforces:**
- Type-safe route params with `$param` conventions
- Search parameter validation with Zod schemas
- Data loaders integrated with TanStack Query prefetching

#### 2. query-patterns
**Auto-enforce TanStack Query best practices with factory key pattern**

```tsx
// ❌ Inline ad-hoc query keys
useQuery({ queryKey: ['users', id], queryFn: () => fetchUser(id) })

// ✅ Query key factory pattern
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export const userQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: userKeys.detail(id),
      queryFn: () => fetchUser(id),
      staleTime: 5 * 60 * 1000,
    }),
}
```

**Activates when:**
- Writing `useQuery`, `useMutation`, or cache invalidations
- Configuring server state in React applications
- User mentions "TanStack Query", "React Query", "caching"

**Enforces:**
- Centralized query key factories
- `queryOptions` helper for reusable queries
- Optimistic updates and structured mutation lifecycles

#### 3. form-patterns
**Auto-enforce TanStack Form best practices with Zod validation**

```tsx
// ✅ TanStack Form with Zod validator
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const form = useForm({
  validatorAdapter: zodValidator(),
  defaultValues: { email: '' },
  onSubmit: async ({ value }) => submitData(value),
})

<form.Field
  name="email"
  validators={{ onChange: z.string().email('Invalid email') }}
>
  {(field) => (
    <input
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

**Activates when:**
- Building form components with `@tanstack/react-form`
- Managing field subscriptions and form state
- User mentions "TanStack Form", "form validation"

**Enforces:**
- Fine-grained reactivity without re-rendering the whole form
- Zod schema validation adapters
- Accessible field error states

#### 4. table-patterns
**Auto-enforce TanStack Table headless data table patterns**

```tsx
// ✅ Type-safe column definitions with TanStack Table
import { createColumnHelper, useReactTable, getCoreRowModel } from '@tanstack/react-table'

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Full Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: () => 'Email Address',
  }),
]
```

**Activates when:**
- Creating data tables, grids, or paginated lists
- User mentions "TanStack Table", "data grid", "sorting", "pagination"

**Enforces:**
- Column helper pattern for type-safe accessor definitions
- Headless architecture separated from UI presentation
- Efficient sorting, filtering, and pagination models

#### 5. virtual-patterns
**Auto-enforce TanStack Virtual list and grid virtualization**

```tsx
// ✅ Virtualized list for large datasets
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,
})
```

**Activates when:**
- Implementing infinite scroll, large lists, or massive tables
- User mentions "TanStack Virtual", "virtualization", "infinite scroll"

**Enforces:**
- DOM node recycling for large collections
- Dynamic measurement and responsive sizing
- Smooth scroll performance

#### 6. store-patterns
**TanStack Store patterns for framework-agnostic reactive state**

```typescript
// ✅ Framework-agnostic reactive store
import { Store } from '@tanstack/store'

export const countStore = new Store({ count: 0 })

export const increment = () => {
  countStore.setState((state) => ({ ...state, count: state.count + 1 }))
}
```

**Activates when:**
- Creating client-side state stores with `@tanstack/store`
- Managing global reactive state outside React component trees

#### 7. db-patterns
**TanStack DB patterns for client-side local-first data**

```typescript
// ✅ Client-first reactive collections
import { createCollection } from '@tanstack/db'

export const usersCollection = createCollection<User>({
  name: 'users',
  primaryKey: 'id',
})
```

**Activates when:**
- Implementing local-first caching, offline sync, or client collections
- User mentions "TanStack DB", "offline-first", "client database"

#### 8. ai-patterns
**TanStack AI patterns for unified AI SDK integration**

```typescript
// ✅ Streaming AI integration
import { useChat } from '@tanstack/ai-react'

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
})
```

**Activates when:**
- Implementing streaming AI chat, prompt handlers, or LLM UI features

#### 9. pacer-patterns
**TanStack Pacer patterns for rate limiting and debouncing**

```typescript
// ✅ Debouncing and throttling patterns
import { Pacer } from '@tanstack/pacer'

const debouncedSearch = new Pacer({
  mode: 'debounce',
  delayMs: 300,
})
```

**Activates when:**
- Adding search input debouncing, request throttling, or queue pacing

#### 10. devtools-patterns
**TanStack DevTools configuration for debugging**

```tsx
// ✅ Development-only DevTools mounting
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

{process.env.NODE_ENV === 'development' && (
  <>
    <ReactQueryDevtools position="bottom-right" />
    <TanStackRouterDevtools position="bottom-left" />
  </>
)}
```

**Activates when:**
- Configuring developer experience, debugging routes, or query inspection

#### 11. tanstack-conventions
**Auto-enforce cross-cutting project structure and imports across TanStack**

```typescript
// ✅ Clean barrel exports and path alias imports
import { userQueries } from '@/features/users/queries'
import { Route as UsersRoute } from '@/routes/users'
```

**Activates when:**
- Organizing folders, imports, and feature boundaries in TanStack projects

---

### Hono Plugin (4 Skills)

#### 1. hono-patterns
**Routing, handlers, middleware composition, and app factory patterns**

```typescript
// ✅ Modular typed Hono sub-apps
import { Hono } from 'hono'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})
```

**Activates when:**
- Writing Hono routes, handlers, error handlers, or middleware
- User mentions "Hono", "Edge API", "route handler"

**Enforces:**
- Proper context typing (`Context<Env>`)
- Explicit HTTP status codes and typed JSON responses
- Middleware chaining and error handling

#### 2. cloudflare-bindings
**Cloudflare Workers bindings typing for D1, KV, R2, and Secrets**

```typescript
// ✅ Strongly typed environment bindings
type Bindings = {
  DB: D1Database
  CACHE: KVNamespace
  STORAGE: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/items', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM items').all()
  return c.json(results)
})
```

**Activates when:**
- Accessing `c.env` or working with Cloudflare Workers resources (D1, KV, R2, Queues)
- User mentions "Cloudflare bindings", "D1", "KV", "Cloudflare Workers"

**Enforces:**
- Never using untyped `process.env` in Worker environments
- Type-safe binding declarations in Hono generic type parameters

#### 3. zod-validation
**Request validation with @hono/zod-validator**

```typescript
// ✅ Validating request payloads with Zod
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const data = c.req.valid('json')
  return c.json({ created: data.email }, 201)
})
```

**Activates when:**
- Validating JSON bodies, search queries, URL parameters, or headers in Hono
- User mentions "validation", "zValidator", "schema"

**Enforces:**
- Using `c.req.valid()` instead of unchecked input
- Returning standardized 400 Bad Request responses on validation errors

#### 4. rpc-typesafe
**End-to-end type safety with Hono RPC client (hc)**

```typescript
// Server: export type AppType = typeof routes
// Client:
import { hc } from 'hono/client'
import type { AppType } from './server'

const client = hc<AppType>('https://api.example.com')
const res = await client.users.$get()
const data = await res.json() // Fully typed response!
```

**Activates when:**
- Sharing types between backend API and frontend clients
- User mentions "Hono RPC", "hc client", "type-safe API"

---

### Flutter Plugin (3 Skills)

#### 1. flutter-architecture
**Feature-first clean architecture and state management patterns**

```dart
// ✅ Layered feature structure:
// lib/src/features/auth/
//   ├── data/ (repositories, data sources)
//   ├── domain/ (entities, value objects)
//   └── presentation/ (controllers/cubits, screens, widgets)
```

**Activates when:**
- Structuring Flutter projects, widgets, state management (Bloc, Riverpod, Provider)
- User mentions "Flutter", "architecture", "state management", "widget"

**Enforces:**
- Separation of business logic from UI widgets
- Immutability for domain entities and state objects
- Dependency injection conventions

#### 2. fastlane-knowledge
**Fastlane automation for iOS and Android deployment lanes**

```ruby
# ✅ Standard Fastlane configuration for mobile builds
lane :beta do
  match(type: "appstore")
  build_app(scheme: "Runner")
  upload_to_testflight
end
```

**Activates when:**
- Configuring `fastlane/Fastfile`, `Appfile`, code signing, or mobile CI/CD pipelines
- User mentions "Fastlane", "TestFlight", "Google Play track", "match"

#### 3. store-publishing
**App Store and Google Play review guidelines and metadata specifications**

```markdown
# ✅ Store Compliance Checklist:
- Privacy manifest and permission justifications in Info.plist / AndroidManifest.xml
- Screenshot dimensions matching all required device form factors
- In-App Purchase compliance and account deletion flows
```

**Activates when:**
- Preparing store submissions, drafting metadata, or resolving app review rejections
- User mentions "App Store", "Google Play", "store publishing", "review guidelines"

---

### Better Auth Plugin (2 Skills)

#### 1. better-auth-patterns
**Better Auth integration, provider setup, and session management**

```typescript
// ✅ Better Auth server setup with typed plugins
import { betterAuth } from 'better-auth'
import { twoFactor, passkey } from 'better-auth/plugins'

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  socialProviders: { github: { clientId: '...', clientSecret: '...' } },
  plugins: [twoFactor(), passkey()],
})
```

**Activates when:**
- Setting up Better Auth server config, OAuth providers, client hooks, or auth middleware
- User mentions "Better Auth", "authentication", "session", "passkey"

#### 2. auth-security
**Authentication security best practices, rate limiting, and session protection**

```typescript
// ✅ Enforce rate limiting, strong password policy, and secure session cookies
export const auth = betterAuth({
  rateLimit: { window: 60, max: 10 },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})
```

**Activates when:**
- Writing authentication flows, handling tokens, configuring cookies, or setting up 2FA
- Enforces OWASP authentication guidelines, brute-force protection, and CSRF safety

---

### Infisical Plugin (3 Skills)

#### 1. infisical-patterns
**Secret naming, folder organization, and CLI development workflows**

```bash
# ✅ Organize secrets by consumer, inject directly at runtime
infisical run --env=dev --path=/backend -- npm run dev
```

**Activates when:**
- Configuring `.infisical.json`, organizing environments, or secret naming conventions
- User mentions "Infisical", "secrets", "env vars", "secret management"

**Enforces:**
- By-consumer folder structure (`/backend`, `/frontend`, `/ci`)
- Semantic UPPER_SNAKE_CASE naming for secrets
- Eliminating long-lived local plaintext secrets

#### 2. infisical-ci-integration
**Secret injection in GitHub Actions, GitLab CI, Docker, and Kubernetes**

```yaml
# ✅ Safe secret injection in CI without repository secrets sprawl
- name: Install Infisical CLI
  uses: Infisical/infisical-action@v1
  with:
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
    env: staging
```

**Activates when:**
- Writing CI/CD pipeline definitions, Dockerfiles, or container manifests that need credentials
- User mentions "CI/CD secrets", "GitHub Actions secret injection", "Infisical CI"

#### 3. secret-hygiene
**Detecting hardcoded secrets, preventing credential leaks, and .env auditing**

```typescript
// ❌ Hardcoded API key detected
const apiKey = "sk_test_placeholder_key"

// ✅ Replaced with Infisical secret reference
const apiKey = process.env.STRIPE_SECRET_KEY
```

**Activates when:**
- Code contains hardcoded API keys, JWT tokens, DB credentials, or unencrypted `.env` commits
- Proactively blocks credential exposure and suggests migration to Infisical

---

### Clarify Plugin (3 Skills)

#### 1. flow-detector
**Task grounding and candidate flow detection before implementation**

```markdown
# Flow Detector Output:
Task: "Send message on sign-in"
Candidate 1: In-app notification to signing-in user (Trigger: Auth post-login event -> Channel: InAppNotification -> Recipient: User)
Candidate 2: Email audit alert to tenant admins (Trigger: Auth post-login event -> Channel: EmailService -> Recipient: Tenant Admin)
```

**Activates when:**
- Developer provides a vague task prompt with unspecified triggers, entities, or recipients
- Scans existing repo infrastructure to anchor candidate flows in real code

#### 2. flow-selector
**Disambiguates candidate flows with exactly one multi-choice question**

```
This task has multiple possible flows:
1. User sign-in flow — in-app message to signing-in user
2. Tenant audit flow — email alert to tenant owner
Which flow would you like to proceed with?
```

**Activates when:**
- `flow-detector` yields 2+ plausible flows
- Prompts user once using `AskUserQuestion`; never asks repetitive cluster-by-cluster questions

#### 3. execution-context-builder
**Generates canonical execution context artifacts (.local.md and .local.json)**

```
✓ Execution context written:
  .claude/clarifications/send-message-on-sign-in.local.md
  .claude/clarifications/send-message-on-sign-in.local.json
```

**Activates when:**
- Single flow is identified or user selects a flow
- Writes machine-readable and human-readable contracts for downstream agents and dev loops

---

### Dev-Loop Plugin (1 Skill)

#### 1. tdd-planner
**Generates structured TDD feature plans for autonomous dev loops**

```markdown
# TDD Plan
## Phase 1: Red (Failing tests)
- `tests/test_auth.py::test_login_flow` -> Expected failure: UserService not found
## Phase 2: Green (Minimal implementation)
- Implement `UserService.authenticate`
## Phase 3: Refactor
- Extract token validator, clean imports
```

**Activates when:**
- User runs `/dev-plan` or asks to plan a feature with TDD
- Provides file breakdown tables, test specifications, and acceptance criteria

---

### Failure-Log Plugin (1 Skill)

#### 1. failure-log-manager
**Persistent mistake memory and regression prevention across sessions**

```markdown
<!-- .claude/failure-log.local.md -->
### Pattern: Circular Imports in Django
- Cause: Importing models relatively inside serializers
- Solution: Always use absolute modular imports with aliases (`import app.models as _app_models`)
```

**Activates when:**
- User logs a mistake via `/failure-add` or when errors are detected during editing
- Automatically injects known project pitfalls into Claude's context to prevent repeated errors

---

### Onboard Plugin (1 Skill)

#### 1. onboard-context-provider
**Adaptive, personalized explanations matched to an engineer's background**

```markdown
# Conceptual Bridge:
Engineer knows: Django ORM & class-based views
Project uses: NestJS TypeORM & Controllers
Explanation: "TypeORM repositories operate like Django Managers; controllers route requests like CBVs."
```

**Activates when:**
- Engineer asks architectural questions ("how do I", "where does this go", "what is the pattern")
- Reads `.claude/onboard-profile.local.md` to tailor depth, syntax, and terminology

---

### Worktree Plugin (1 Skill)

#### 1. worktree-manager
**Automates parallel git worktrees with environment copying and container isolation**

```bash
/wt create feature/payments
# → Sibling worktree: project--feature-payments/
# → Copies files per .worktreeinclude
# → Rewrites DB_NAME to project_feature_payments
# → Applies deterministic Docker compose port offsets
```

**Activates when:**
- Managing worktrees, parallel branch workflows, or solving Docker port / database collision issues
- Enforces `.worktreeinclude` conventions and clean workspace teardown

---

## Developer Experience

### Before Skills

**Scenario**: Junior developer creates a Django API endpoint

```python
# 1. Uses relative imports (causes circular import later)
from .models import User

# 2. Forgets permission classes (security vulnerability)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()  # Public access!

# 3. Creates model without UUID (breaks distributed system)
class User(models.Model):
    id = models.AutoField(primary_key=True)  # Problematic

# 4. N+1 query (performance issue)
def get_users_with_orders(request):
    users = User.objects.all()
    for user in users:
        print(user.orders.count())  # Queries DB in loop!

# Result: Code review catches 4 issues, takes 2 hours to fix
```

### After Skills

**Scenario**: Same developer, skills enabled

```python
# 1. import-convention-enforcer auto-fixes imports
import users.models as _users_models  # ✅ Fixed automatically

# 2. security-first-validator blocks until permissions added
# ⚠️ Skill message: "Missing permission_classes. Required for OWASP compliance."
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # ✅ Added
    queryset = _users_models.User.objects.all()

# 3. model-entity-validator auto-adds UUID
# ✅ Skill adds: id = UUIDField, created_at, updated_at, is_deleted

# 4. performance-optimizer detects N+1
# ⚠️ Skill suggests: "Use select_related('orders') to avoid N+1 query"
def get_users_with_orders(request):
    users = _users_models.User.objects.prefetch_related('orders').all()  # ✅ Fixed

# Result: All issues caught/fixed during development, 0 code review issues
```

### Impact Metrics

| Metric | Before Skills | After Skills | Improvement |
|--------|--------------|-------------|-------------|
| Security vulnerabilities in code review | 3-5 per PR | 0-1 per PR | 80-100% reduction |
| Circular import bugs | 2-3 per sprint | 0 per sprint | 100% elimination |
| Performance issues (N+1) | 4-6 per sprint | 0-1 per sprint | 83-100% reduction |
| Accessibility violations | 10-15 per component | 0-2 per component | 87-100% reduction |
| Time spent on convention corrections | 5-8 hours/week | 0.5-1 hour/week | 87-90% reduction |

## How Skills Work Together

Skills complement agents, commands, and hooks:

### 1. Architecture Phase
**Agent**: `@django-architect` designs the API structure
**Skills**: Not active yet (no code written)

### 2. Implementation Phase
**Agent**: `@django-builder` generates initial code
**Skills**: Auto-activate DURING implementation
- `import-convention-enforcer` fixes imports
- `model-entity-validator` adds required fields
- `security-first-validator` blocks if permissions missing

### 3. Review Phase
**Agent**: `@django-reviewer` performs security audit
**Skills**: Already prevented issues during implementation
- Fewer issues to review
- Focus on business logic, not conventions

### 4. Testing Phase
**Agent**: `@django-tester` writes comprehensive tests
**Skills**: Auto-suggest missing tests
- `test-coverage-advisor` identifies gaps
- Generates test stubs automatically

## Installation and Usage

### Installing Plugins with Skills

```bash
# Install Django plugin (includes 6 skills)
/plugin install django

# Install Next.js plugin (includes 3 skills)
/plugin install nextjs

# Install NestJS plugin (includes 2 skills)
/plugin install nestjs
```

### Skills Activate Automatically

No manual invocation needed. Skills activate based on context:

```python
# Writing Django code → Django skills active
class User(models.Model):  # model-entity-validator activates
    email = models.EmailField()

# Writing Next.js code → Next.js skills active
<form>  # react-form-validator activates
  <input name="email" />
</form>

# Writing NestJS code → NestJS skills active
import { User } from './entities/user.entity'  # import-convention-enforcer activates
```

### Skill Behavior

Skills are **proactive** and **educational**:

1. **Detect violations** automatically
2. **Fix violations** immediately (when possible)
3. **Explain WHY** conventions exist
4. **Block completion** if critical issues remain

Example skill message:
```
⚠️ Accessibility Violation Detected

Using div with onClick creates a keyboard navigation barrier for users
who cannot use a mouse. This violates WCAG 2.1 AA guidelines.

Fixed automatically:
- Changed <div onClick> to <button type="button">
- Added keyboard event handling
- Ensured focus is visible

Why this matters:
- 15% of users rely on keyboard navigation
- Screen readers expect semantic HTML
- Legal compliance (ADA, Section 508)
```

## Configuration

Skills are configured in `.claude-plugin/marketplace.json`:

```json
{
  "plugins": [
    {
      "name": "django",
      "version": "1.1.0",
      "skills": [
        "./skills/import-convention-enforcer/SKILL.md",
        "./skills/model-entity-validator/SKILL.md",
        "./skills/security-first-validator/SKILL.md",
        "./skills/test-coverage-advisor/SKILL.md",
        "./skills/performance-optimizer/SKILL.md",
        "./skills/migration-safety-checker/SKILL.md"
      ]
    }
  ]
}
```

Each skill has a SKILL.md file with YAML frontmatter:

```yaml
---
name: import-convention-enforcer
description: Automatically enforce absolute modular imports in Django. Use when writing imports, creating models/views/serializers, or organizing Django modules.
---
```

## Best Practices

### 1. Trust the Skills
Skills activate when needed. Don't manually invoke them.

### 2. Read the Explanations
Skills explain WHY conventions exist. Learn from them.

### 3. Report Issues
If a skill auto-fix causes problems, report in code review.

### 4. Combine with Agents
Use agents for complex workflows, skills for conventions:

```bash
# Agent for architecture
@django-architect "Design user authentication API"

# Skills enforce during implementation (automatic)
# - import-convention-enforcer
# - model-entity-validator
# - security-first-validator

# Agent for testing
@django-tester "Write auth tests"

# Skills suggest coverage gaps (automatic)
# - test-coverage-advisor
```

## Troubleshooting

### Skills Not Activating

**Problem**: Skills don't auto-activate when expected

**Solutions**:
1. Verify plugin installation: `/plugin list`
2. Check you're in a relevant project (Django/Next.js/NestJS)
3. Reinstall plugin: `/plugin update django`

### False Positives

**Problem**: Skill reports violation incorrectly

**Solutions**:
1. Explain the specific case in prompt
2. Skills may learn from context and adjust
3. Report persistent issues for skill refinement

### Skill Conflicts

**Problem**: Multiple skills suggest different fixes

**Solutions**:
1. Skills are designed to work together
2. If conflict occurs, follow the more specific skill
3. Report conflict for resolution

## Skill Development

### Creating New Skills

Skills follow this structure:

```markdown
---
name: skill-name
description: When this skill activates and what it does
---

# Skill Name

## When This Skill Activates

List specific triggers:
- User writes X code
- User mentions Y keyword
- User creates Z file type

## Required Pattern (MANDATORY)

Show correct vs incorrect examples

## Auto-Fix Process

Document step-by-step how skill fixes violations

## Success Criteria

Define what "correct" looks like

## Skill Behavior

Document proactive actions and explanations
```

### Registering Skills

Add to `.claude-plugin/marketplace.json`:

```json
{
  "skills": [
    "./skills/your-skill/SKILL.md"
  ]
}
```

## Summary

Skills provide **automatic convention enforcement** across the Smicolon marketplace:

| Plugin | Skills | Focus |
|--------|:------:|-------|
| django | 8 | Security, performance, testing, TDD, patterns |
| tanstack-router | 11 | Routing, caching, forms, tables, virtualization, store, DB |
| hono | 4 | Routing, Cloudflare bindings, Zod validation, RPC |
| nextjs | 3 | Accessibility, forms, path alias imports |
| nuxtjs | 3 | Accessibility, forms, Nuxt imports |
| flutter | 3 | Clean architecture, Fastlane, store publishing |
| infisical | 3 | Secret naming, CI/CD injection, secret hygiene |
| clarify | 3 | Flow detection, disambiguation, execution context |
| nestjs | 2 | Barrel exports, absolute imports |
| better-auth | 2 | Authentication setup, security best practices |
| dev-loop | 1 | Structured TDD planning for iterative loops |
| failure-log | 1 | Persistent mistake memory and prevention |
| worktree | 1 | Git worktree management, env and port isolation |
| onboard | 1 | Personalized engineer onboarding guidance |

**Total**: 46 auto-enforcing skills that prevent mistakes before they reach code review.

**Benefits**:
- 80-100% reduction in convention violations
- Automated knowledge transfer to developers
- Faster code reviews (focus on logic, not style)
- Consistent codebase quality across teams
- Educational (explains WHY, not just fixes WHAT)

**Philosophy**: Skills shift convention enforcement from code review (reactive) to development time (proactive), allowing developers to learn correct patterns as they code.
