# Smicolon Nuxt.js Project Template

This template includes all Smicolon conventions for Nuxt.js 3 development with Vue 3.

## Conventions Included

### 1. TypeScript Strict Mode + Composition API
```vue
<script setup lang="ts">
// ✅ CORRECT - Properly typed with Composition API
interface User {
  id: string
  email: string
  name: string
}

const user = ref<User | null>(null)

const fetchUser = async (id: string) => {
  const { data } = await useFetch<User>(`/api/users/${id}`)
  user.value = data.value
}

// ❌ WRONG - No types, not using script setup
// <script>
// export default {
//   data() {
//     return { user: null }
//   }
// }
```

### 2. Form Validation with VeeValidate + Zod
```vue
<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
})

const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (values: FormData) => {
  // Handle submission
})
</script>

<template>
  <form @submit="onSubmit">
    <input v-model="email" type="email" />
    <span v-if="errors.email">{{ errors.email }}</span>

    <input v-model="password" type="password" />
    <span v-if="errors.password">{{ errors.password }}</span>

    <button type="submit">Submit</button>
  </form>
</template>
```

### 3. Data Fetching with Nuxt Composables
```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
}

// useFetch - auto-imported by Nuxt
const { data: users, pending, error } = await useFetch<User[]>('/api/users')

// useAsyncData for custom fetching
const { data: user } = await useAsyncData(
  'user-detail',
  () => $fetch<User>(`/api/users/${route.params.id}`)
)
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="user in users" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>
```

### 4. Pinia Store Pattern
```typescript
// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)

  // Getters
  const userCount = computed(() => users.value.length)

  // Actions
  const fetchUsers = async () => {
    loading.value = true
    try {
      const { data } = await useFetch<User[]>('/api/users')
      users.value = data.value || []
    } finally {
      loading.value = false
    }
  }

  return {
    users: readonly(users),
    loading: readonly(loading),
    userCount,
    fetchUsers,
  }
})
```

### 5. Project Structure
```
app/
├── assets/                 # Static assets
├── components/            # Auto-imported components
│   ├── ui/
│   ├── forms/
│   └── layouts/
├── composables/           # Auto-imported composables
│   ├── useAuth.ts
│   └── useApi.ts
├── layouts/               # App layouts
│   ├── default.vue
│   └── dashboard.vue
├── middleware/            # Route middleware
│   └── auth.ts
├── pages/                 # File-based routing
│   ├── index.vue
│   └── users/
│       └── [id].vue
├── stores/                # Pinia stores
│   └── user.ts
├── types/                 # TypeScript types
└── app.vue               # Root component
```

## Quick Start

1. Install Smicolon plugins:
   ```bash
   /plugin marketplace add https://github.com/smicolon/ai-kit
   /plugin install nuxtjs
   ```

2. Authenticate MCP servers (first time only):
   ```bash
   # Linear: OAuth authentication (click "Authenticate" when prompted)
   # Figma: OAuth authentication (requires Figma Dev Mode permissions)
   ```

3. Start dev server for Playwright MCP:
   ```bash
   npm run dev  # Playwright MCP can test your running app
   ```

4. Start building:
   ```bash
   @nuxtjs-architect "Design a user dashboard with authentication"
   ```

## Agents Available

- `@nuxtjs-architect` - Nuxt.js/Vue 3 architecture specialist
- `@frontend-visual` - Visual QA (Playwright + Figma MCP)
- `@frontend-tester` - Testing (unit/integration/E2E/accessibility)

## Enforced by Hooks

The post-write hook automatically checks for:
- ✅ `<script setup lang="ts">` usage
- ✅ TypeScript strict mode
- ✅ No 'any' types
- ✅ Composition API usage
- ✅ Proper component patterns

Violations will be flagged immediately.

## MCP Servers Configured

This template includes project-scoped MCP servers (`.mcp.json`) that automatically load when you work in this directory:

### Linear
- **Purpose**: Issue tracking and project management integration
- **Features**: Create/update/search Linear issues directly from Claude
- **Authentication**: OAuth (one-time setup)
- **Usage**: Ask Claude to "create a Linear issue for this feature"

### Playwright
- **Purpose**: Browser automation and visual testing
- **Features**:
  - Navigate pages and test UI interactions
  - Take screenshots for visual verification
  - Execute JavaScript in browser context
  - Test Vue component behavior in real browser
- **Requirements**:
  - Run `npm run dev` to have a local server running
  - Playwright will open a visible browser window
- **Usage with @frontend-visual agent**:
  ```bash
  @frontend-visual "Verify the user profile page design"
  ```

### Figma (Remote)
- **Purpose**: Design file integration and pixel-perfect implementation
- **Features**:
  - Fetch design specs from Figma files
  - Extract colors, typography, spacing
  - Compare Vue component implementation vs design
- **Requirements**:
  - Figma account with Dev Mode permissions
  - OAuth authentication (one-time)
- **Usage**: Ask Claude to "get design specs from Figma file XYZ"

### Configuration File

The `.mcp.json` file in this template:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "figma": {
      "transport": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

**Setup Requirements**:
1. **Linear**: Click "Authenticate" when prompted (one-time OAuth)
2. **Playwright**: No setup needed, works out of the box
3. **Figma**:
   - Authenticate when prompted
   - Requires Figma Dev Mode access
   - Remote MCP server (no local Figma app needed)

**Token Optimization**: Project-scoped MCPs only load when you're in this directory, saving ~100k tokens compared to global MCP configuration.

**Visual Testing Workflow**:
```bash
# 1. Start dev server
npm run dev

# 2. Use visual testing agent
@frontend-visual "Verify dashboard layout matches design"

# Playwright will:
# - Open browser to your local Nuxt app
# - Take screenshots
# - Compare with Figma designs (if Figma file linked)
# - Report visual discrepancies
```

## Nuxt.js 3 Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: true,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000',
    },
  },
})
```

## Best Practices

### Always Use Auto-Imports
Nuxt auto-imports:
- Components from `components/`
- Composables from `composables/`
- Utils from `utils/`
- Nuxt composables (`useFetch`, `useState`, etc.)

No need to manually import!

### Use TypeScript Everywhere
```typescript
// ✅ CORRECT
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// ❌ WRONG
const props = defineProps({
  title: String,
  count: Number
})
```

### Leverage Nuxt Composables
```typescript
// ✅ CORRECT - Use Nuxt composables
const { data } = await useFetch('/api/users')
const route = useRoute()
const router = useRouter()

// ❌ WRONG - Don't use Vue Router directly
import { useRoute } from 'vue-router'
```

### State Management
```typescript
// ✅ CORRECT - Use Pinia for global state
const userStore = useUserStore()

// ✅ CORRECT - Use useState for shared state
const counter = useState('counter', () => 0)

// ❌ WRONG - Don't use provide/inject for complex state
```

## SEO & Meta Tags

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'My Page Title',
  description: 'Page description',
  ogImage: '/og-image.jpg',
})

useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>
```

## Middleware Example

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})

// Use in page:
definePageMeta({
  middleware: 'auth'
})
```
