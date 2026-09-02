# Smicolon NestJS Project Template

This template includes all Smicolon conventions for NestJS (TypeScript backend) development.

## Conventions Included

### 1. Import Pattern - Absolute Imports from Barrel Exports

```typescript
// ✅ CORRECT - Absolute imports from index files (barrel exports)
import { User } from 'src/users/entities'
import { UsersService } from 'src/users/services'
import { CreateUserDto, UpdateUserDto } from 'src/users/dto'

// ❌ WRONG - Relative imports
import { User } from './entities/user.entity'
import { UserService } from '../services/user.service'
```

### 2. Entity Pattern (TypeORM)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn() // Soft delete
  deletedAt?: Date
}
```

### 3. DTO Pattern with Validation

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string
}
```

### 4. Service Pattern

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities'
import { CreateUserDto } from '../dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto)
    return this.userRepository.save(user)
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }
}
```

### 5. Controller Pattern

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from '../services'
import { CreateUserDto } from '../dto'
import { JwtAuthGuard } from 'src/auth/guards'

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }
}
```

### 6. Module Pattern

```typescript
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities'
import { UsersService } from './services'
import { UsersController } from './controllers'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 7. Project Structure

```
src/
├── main.ts
├── app.module.ts
├── users/                    # Feature module
│   ├── users.module.ts
│   ├── entities/
│   │   ├── index.ts         # export * from './user.entity'
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── index.ts         # export * from './create-user.dto'
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── services/
│   │   ├── index.ts         # export * from './users.service'
│   │   └── users.service.ts
│   ├── controllers/
│   │   ├── index.ts
│   │   └── users.controller.ts
│   └── __tests__/
│       ├── users.service.spec.ts
│       └── users.controller.spec.ts
├── auth/
│   ├── guards/
│   ├── strategies/
│   └── services/
└── common/
    ├── decorators/
    ├── filters/
    ├── interceptors/
    └── pipes/
```

## Quick Start

1. Install Smicolon plugins:
   ```bash
   /plugin marketplace add https://github.com/smicolon/ai-kit
   /plugin install nestjs
   ```

2. Configure MCP servers (project-scoped):
   ```bash
   # Update .mcp.json with your database connection string
   # Replace YOUR_DATABASE_NAME with your actual database name
   ```

3. Authenticate Linear MCP (first time only):
   ```bash
   # In Claude Code, Linear will prompt for authentication
   # Click "Authenticate" and authorize access
   ```

4. Start building:
   ```bash
   @nestjs-architect "Design a user management system with authentication"
   ```

5. Implement:
   ```bash
   @nestjs-builder "Build the user management system"
   ```

6. Test:
   ```bash
   @nestjs-tester "Write tests for the user system"
   ```

## Agents Available

- `@nestjs-architect` - Architecture design specialist
- `@nestjs-builder` - Feature implementation specialist
- `@nestjs-tester` - Testing specialist

## Commands Available

- `/module-create` - Create complete NestJS modules (entity, DTOs, service, controller)

## Enforced by Hooks

The post-write hook automatically checks for:
- ✅ Absolute imports from barrel exports
- ✅ UUID primary keys
- ✅ Timestamps on entities
- ✅ Soft delete fields
- ✅ No relative imports

Violations will be flagged immediately.

## MCP Servers Configured

This template includes project-scoped MCP servers (`.mcp.json`) that automatically load when you work in this directory:

### Linear
- **Purpose**: Issue tracking and project management integration
- **Features**: Create/update/search Linear issues directly from Claude
- **Authentication**: OAuth (one-time setup)
- **Usage**: Ask Claude to "create a Linear issue" or "update issue ABC-123"

### PostgreSQL
- **Purpose**: Database inspection and read-only queries
- **Features**:
  - View database schemas
  - Execute read-only SQL queries
  - Inspect table structures and relationships
- **Configuration**: Update connection string in `.mcp.json`:
  ```json
  "postgresql://username:password@localhost:5432/your_db_name"
  ```
- **Security**: Read-only access for safety

### Configuration File

The `.mcp.json` file in this template:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/YOUR_DATABASE_NAME"
      ]
    }
  }
}
```

**Remember to**:
1. Update `YOUR_DATABASE_NAME` with your actual database name
2. Add credentials if your database requires authentication
3. Commit `.mcp.json` to git for team-wide MCP configuration

**Token Optimization**: Project-scoped MCPs only load when you're in this directory, saving ~100k tokens compared to global MCP configuration.

## NestJS Configuration Example

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Smicolon API')
    .setDescription('API following Smicolon conventions')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}
bootstrap()
```

## TypeORM Configuration

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false, // Use migrations in production
      migrations: ['dist/migrations/*{.ts,.js}'],
      migrationsRun: true,
    }),
  ],
})
export class AppModule {}
```

## Best Practices

### Index Files for Clean Exports

Always create `index.ts` in each folder:

```typescript
// entities/index.ts
export * from './user.entity'
export * from './profile.entity'

// dto/index.ts
export * from './create-user.dto'
export * from './update-user.dto'
export * from './user-response.dto'
```

### Guards for Authentication

```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Usage in controllers
import { JwtAuthGuard } from 'src/auth/guards'

@UseGuards(JwtAuthGuard)
```

### Global Exception Filter

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    })
  }
}
```

## Testing Example

```typescript
// users/__tests__/users.service.spec.ts
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UsersService } from '../services'
import { User } from '../entities'

describe('UsersService', () => {
  let service: UsersService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get(UsersService)
  })

  it('should create a user', async () => {
    const dto = { email: 'test@example.com', password: 'password123' }
    mockRepository.create.mockReturnValue(dto)
    mockRepository.save.mockResolvedValue({ id: '123', ...dto })

    const result = await service.create(dto)
    expect(result.id).toBe('123')
  })
})
```
