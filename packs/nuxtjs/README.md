# Nuxt.js Development Standards Plugin

Production standards and convention pack for Nuxt.js/Vue 3 projects.

## Installation

```bash
# Add Smicolon marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install Nuxt.js plugin
/plugin install nuxtjs
```

## What's Included

### 3 Specialized Agents

- `@nuxtjs-architect` - Nuxt.js/Vue 3 architecture design
- `@frontend-visual` - Visual QA with Playwright + Figma MCP integration
- `@frontend-tester` - Frontend testing (unit, integration, E2E, accessibility)

### Automatic Convention Enforcement

**Required Standards:**
- TypeScript strict mode
- Vue 3 Composition API (`<script setup lang="ts">`)
- VeeValidate + Zod for forms
- Nuxt composables (useFetch, useAsyncData)
- Pinia for state management
- WCAG 2.1 AA accessibility

### Visual QA Integration

The `@frontend-visual` agent integrates with:
- **Playwright MCP** for automated browser testing
- **Figma MCP** for design comparison

See [MCP_SETUP.md](../../MCP_SETUP.md) for configuration.

## Usage

```bash
# Design architecture
@nuxtjs-architect "Design authentication flow with social login"

# Write comprehensive tests
@frontend-tester "Write tests for authentication module"

# Visual QA (requires Playwright + Figma MCP)
@frontend-visual "Verify login page matches Figma: https://figma.com/file/..."
```

## Documentation

See the main [Smicolon Claude Infra repository](https://github.com/smicolon/ai-kit) for complete documentation.
