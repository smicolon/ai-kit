---
name: component-create
description: Create a Nuxt.js/Vue 3 component following best-practice conventions
---

# Nuxt.js Component Creation

## Component Types

1. **Page Component** - `/pages/*.vue`
2. **Layout Component** - `/layouts/*.vue`
3. **UI Component** - `/components/*.vue`
4. **Composable** - `/composables/*.ts`

## Template

### Basic Component

```vue
<script setup lang="ts">
// Props with TypeScript
interface Props {
  title: string
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
})

// Emits with TypeScript
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'close'): void
}>()

// Reactive state (auto-imported)
const isOpen = ref(false)

// Computed (auto-imported)
const buttonClass = computed(() => `btn-${props.variant}`)

// Methods
function handleClick() {
  emit('update', 'new value')
}
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <button
      type="button"
      :class="buttonClass"
      @click="emit('close')"
    >
      Close
    </button>
  </div>
</template>

<style scoped>
.component {
  /* Scoped styles */
}
</style>
```

### Page Component

```vue
<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'User Profile',
  middleware: ['auth'],
})

// Route params
const route = useRoute()
const userId = computed(() => route.params.id as string)

// Data fetching
const { data: user, pending, error } = await useFetch(`/api/users/${userId.value}`)

// SEO
useHead({
  title: () => user.value?.name || 'User Profile',
})
</script>

<template>
  <div>
    <p v-if="pending">Loading...</p>
    <p v-else-if="error">Error: {{ error.message }}</p>
    <div v-else-if="user">
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>
```

### Form Component

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
  })
)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
})

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')

const emit = defineEmits<{
  (e: 'submit', data: { name: string; email: string }): void
}>()

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <form @submit="onSubmit">
    <div>
      <label for="name">Name</label>
      <input id="name" v-model="name" v-bind="nameAttrs" />
      <span v-if="errors.name" role="alert">{{ errors.name }}</span>
    </div>
    <div>
      <label for="email">Email</label>
      <input id="email" v-model="email" v-bind="emailAttrs" type="email" />
      <span v-if="errors.email" role="alert">{{ errors.email }}</span>
    </div>
    <button type="submit">Submit</button>
  </form>
</template>
```

### Composable

```typescript
// composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = useState('counter', () => initial)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initial
  }

  return {
    count: readonly(count),
    increment,
    decrement,
    reset,
  }
}
```

## Accessibility Checklist

- [ ] Semantic HTML elements (`<button>`, `<nav>`, `<main>`)
- [ ] Keyboard navigation (tab order, focus management)
- [ ] ARIA attributes where needed
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 minimum
- [ ] Form labels associated with inputs
- [ ] Error messages announced to screen readers

## Naming Conventions

- Components: PascalCase (`UserCard.vue`)
- Composables: camelCase with `use` prefix (`useAuth.ts`)
- Pages: kebab-case (`user-profile.vue`)
- Layouts: kebab-case (`default.vue`, `dashboard.vue`)

## File Structure

```
components/
├── ui/
│   ├── Button.vue
│   ├── Card.vue
│   └── Modal.vue
├── layout/
│   ├── Header.vue
│   └── Footer.vue
└── feature/
    ├── UserCard.vue
    └── ProductList.vue

composables/
├── useAuth.ts
├── useUser.ts
└── useCart.ts

pages/
├── index.vue
├── login.vue
└── users/
    ├── index.vue
    └── [id].vue
```
