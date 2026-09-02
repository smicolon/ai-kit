# NestJS Development Standards Plugin

Production standards and convention pack for NestJS/TypeScript backend projects.

## Installation

```bash
# Add Smicolon marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install NestJS plugin
/plugin install nestjs
```

## What's Included

### 3 Specialized Agents

- `@nestjs-architect` - Backend architecture design and planning
- `@nestjs-builder` - Feature implementation with NestJS best practices
- `@nestjs-tester` - Test writing for NestJS applications

### 2 Auto-Enforcing Skills (NEW!)

Skills automatically activate based on context - no manual invocation needed:

**Code Organization:**
- `barrel-export-manager` - Auto-creates/maintains index.ts barrel exports in all module directories
- `import-convention-enforcer` - Auto-fixes imports to use absolute paths from barrel exports

**How Skills Work:**
- Auto-invoke when creating entities, DTOs, services, or importing modules
- Automatically create index.ts files with proper exports
- Convert relative imports to absolute barrel imports
- Maintain clean, organized module structure
- Work alongside agents for complete code quality

### Automatic Convention Enforcement

**Import Pattern:**
```typescript
// CORRECT - Absolute imports from barrel exports
import { User } from 'src/users/entities'
import { UsersService } from 'src/users/services'
import { CreateUserDto } from 'src/users/dto'

// WRONG - Relative imports
import { User } from './entities/user.entity'
```

**Entity Standards:**
- UUID primary keys
- Timestamps (createdAt, updatedAt)
- Soft deletes (deletedAt)
- DTOs with class-validator
- Dependency injection
- Guards on protected routes
- Barrel exports (index.ts) in all folders

## Usage

```bash
# Design architecture
@nestjs-architect "Design a REST API for inventory management"

# Implement features
@nestjs-builder "Implement inventory API endpoints"

# Write tests
@nestjs-tester "Write tests for inventory module"
```

## Documentation

See the main [Smicolon Claude Infra repository](https://github.com/smicolon/ai-kit) for complete documentation.
