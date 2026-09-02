# Next.js Development Standards Plugin

Production standards and convention pack for Next.js/React projects.

## Installation

```bash
# Add Smicolon marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install Next.js plugin
/plugin install nextjs
```

## What's Included

### 4 Specialized Agents

- `@nextjs-architect` - Next.js/React architecture design
- `@nextjs-modular` - Large-scale Next.js modular architecture
- `@frontend-visual` - Visual QA with Playwright + Figma MCP integration
- `@frontend-tester` - Frontend testing (unit, integration, E2E, accessibility)

### 3 Auto-Enforcing Skills (NEW!)

Skills automatically activate based on context - no manual invocation needed:

**Frontend Quality:**
- `accessibility-validator` - Auto-checks WCAG 2.1 AA compliance (keyboard nav, ARIA, contrast)
- `react-form-validator` - Auto-enforces React Hook Form + Zod for all forms
- `import-convention-enforcer` - Auto-fixes imports to use path aliases (@/ pattern)

**How Skills Work:**
- Auto-invoke when creating components, forms, or organizing imports
- Proactively fix violations (divs→buttons, add ARIA, convert to Zod)
- Explain WHY accessibility/validation matters
- Block inaccessible/unvalidated code
- Work alongside agents for complete quality assurance

### Automatic Convention Enforcement

**Required Standards:**
- TypeScript strict mode (no `any`)
- Zod validation for all forms
- TanStack Query for API calls
- Proper error and loading states
- Tailwind CSS
- WCAG 2.1 AA accessibility

### Visual QA Integration

The `@frontend-visual` agent integrates with:
- **Playwright MCP** for automated browser testing
- **Figma MCP** for design comparison

See [MCP_SETUP.md](../../MCP_SETUP.md) for configuration.

## Usage

```bash
# Design architecture
@nextjs-architect "Design a dashboard with real-time analytics"

# Large-scale architecture
@nextjs-modular "Design modular architecture for e-commerce platform"

# Write comprehensive tests
@frontend-tester "Write tests for authentication flow"

# Visual QA (requires Playwright + Figma MCP)
@frontend-visual "Verify dashboard matches Figma: https://figma.com/file/..."
```

## Documentation

See the main [Smicolon Claude Infra repository](https://github.com/smicolon/ai-kit) for complete documentation.
