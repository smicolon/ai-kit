# Smicolon Next.js Project Template

This template includes all Smicolon conventions for Next.js development.

## Conventions Included

### 1. TypeScript Strict Mode
```typescript
// ✅ CORRECT - Properly typed
interface User {
  id: string
  email: string
  firstName: string
}

function getUser(id: string): Promise<User> {
  // Implementation
}

// ❌ WRONG - No types
function getUser(id) {
  // Implementation
}
```

### 2. Form Validation with Zod
```typescript
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

export function Form() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  // ...
}
```

### 3. API Client with TanStack Query
```typescript
import { useQuery } from '@tanstack/react-query'

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => apiClient<User>(`/users/${id}`),
  })
}
```

### 4. Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   └── dashboard/
│   └── api/
├── components/
│   ├── ui/
│   ├── forms/
│   └── layouts/
├── lib/
│   ├── api/
│   ├── utils/
│   └── validations/
├── hooks/
└── types/
```

## Quick Start

1. Install Smicolon plugins:
   ```bash
   /plugin marketplace add https://github.com/smicolon/ai-kit
   /plugin install nextjs
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
   @nextjs-architect "Design a user dashboard"
   ```

## Agents Available

- `@nextjs-architect` - Frontend architecture and design
- `@nextjs-modular` - Large-scale modular architecture
- `@frontend-visual` - Visual QA (Playwright + Figma MCP)
- `@frontend-tester` - Testing (unit/integration/E2E/accessibility)

## Commands Available

- `/component-create` - Create React/Next.js components

## Enforced by Hooks

The post-write hook automatically checks for:
- ✅ TypeScript strict mode
- ✅ No 'any' types
- ✅ Zod validation on forms
- ✅ Proper error handling

Violations will be flagged immediately.

## MCP Servers Configured

This template includes project-scoped MCP servers (`.mcp.json`) that automatically load when you work in this directory:

### Linear
- **Purpose**: Issue tracking and project management integration
- **Features**: Create/update/search Linear issues directly from Claude
- **Authentication**: OAuth (one-time setup)
- **Usage**: Ask Claude to "create a Linear issue for this bug"

### Playwright
- **Purpose**: Browser automation and visual testing
- **Features**:
  - Navigate pages and test UI interactions
  - Take screenshots for visual verification
  - Execute JavaScript in browser context
  - Submit forms and test user flows
- **Requirements**:
  - Run `npm run dev` to have a local server running
  - Playwright will open a visible browser window
- **Usage with @frontend-visual agent**:
  ```bash
  @frontend-visual "Verify the login page design matches Figma"
  ```

### Figma (Remote)
- **Purpose**: Design file integration and pixel-perfect implementation
- **Features**:
  - Fetch design specs from Figma files
  - Extract colors, typography, spacing
  - Compare implementation vs design
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
# - Open browser to your local app
# - Take screenshots
# - Compare with Figma designs (if Figma file linked)
# - Report visual discrepancies
```
