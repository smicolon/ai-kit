---
name: module-create
description: Create a new NestJS module following best-practice conventions
---

# NestJS Module Creation

You are a NestJS module creation specialist. Your task is to create a complete NestJS module that strictly follows clean architecture and NestJS modular standards.

## Core Requirements

### Import Pattern (CRITICAL)
ALWAYS use absolute imports from barrel exports:

```typescript
// ✅ CORRECT - Absolute imports from barrel exports
import { User } from 'src/users/entities'
import { UsersService } from 'src/users/services'
import { CreateUserDto } from 'src/users/dto'

// ❌ WRONG - Relative imports
import { User } from './entities/user.entity'
import { User } from '../entities'
```

### Standard Entity Fields (MANDATORY)
Every entity MUST include:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm'

@Entity('table_name')
export class YourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date

  // Your custom fields here
}
```

### Module Structure
Every module needs these files:
```
src/module-name/
├── index.ts                 # Barrel export (REQUIRED)
├── module-name.module.ts
├── entities/
│   ├── index.ts            # Barrel export
│   └── entity-name.entity.ts
├── dto/
│   ├── index.ts            # Barrel export
│   ├── create-entity.dto.ts
│   └── update-entity.dto.ts
├── services/
│   ├── index.ts            # Barrel export
│   └── module-name.service.ts
├── controllers/
│   ├── index.ts            # Barrel export
│   └── module-name.controller.ts
└── guards/ (if needed)
    ├── index.ts
    └── custom.guard.ts
```

## Workflow

1. **Understand Requirements**: Ask user for:
   - Module name and purpose
   - Entity fields needed
   - API endpoints (CRUD operations)
   - Access control needs

2. **Generate Files**: Create all necessary files with:
   - Entity with standard fields
   - DTOs with validation
   - Service with business logic
   - Controller with guards
   - Module configuration
   - Barrel exports

## Example Output

### Entity
```typescript
// src/products/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from 'src/users/entities'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date

  @Column({ length: 255 })
  name: string

  @Column({ unique: true, length: 255 })
  slug: string

  @Column('text')
  description: string

  @Column('decimal', { precision: 10, scale: 2 })
  price: number

  @Column('int', { default: 0 })
  stock: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User
}
```

### DTOs
```typescript
// src/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsNotEmpty, Min, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiProperty({ example: 'laptop-2024', description: 'URL-friendly slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string

  @ApiProperty({ example: 'High-performance laptop', description: 'Product description' })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ example: 999.99, description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({ example: 10, description: 'Stock quantity', required: false })
  @IsNumber()
  @Min(0)
  stock?: number
}

// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateProductDto } from './create-product.dto'

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// src/products/dto/index.ts
export * from './create-product.dto'
export * from './update-product.dto'
```

### Service
```typescript
// src/products/services/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from 'src/products/entities'
import { CreateProductDto, UpdateProductDto } from 'src/products/dto'

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: { id: userId } as any,
    })

    return await this.productRepository.save(product)
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id)

    Object.assign(product, updateProductDto)

    return await this.productRepository.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    await this.productRepository.softRemove(product)
  }

  async restock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id)
    product.stock += quantity
    return await this.productRepository.save(product)
  }
}

// src/products/services/index.ts
export * from './product.service'
```

### Controller
```typescript
// src/products/controllers/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards'
import { ProductService } from 'src/products/services'
import { CreateProductDto, UpdateProductDto } from 'src/products/dto'

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productService.create(createProductDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll() {
    return this.productService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id)
  }

  @Post(':id/restock')
  @ApiOperation({ summary: 'Restock a product' })
  restock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.productService.restock(id, quantity)
  }
}

// src/products/controllers/index.ts
export * from './product.controller'
```

### Module
```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities'
import { ProductService } from './services'
import { ProductController } from './controllers'

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {}

// src/products/index.ts (Barrel export)
export * from './products.module'
export * from './entities'
export * from './dto'
export * from './services'
export * from './controllers'
```

## Quality Checklist

- [ ] UUID primary keys
- [ ] Timestamps (createdAt, updatedAt)
- [ ] Soft deletes (deletedAt)
- [ ] Absolute imports from barrel exports
- [ ] DTOs with class-validator
- [ ] Guards on protected routes
- [ ] Swagger/OpenAPI documentation
- [ ] Barrel exports (index.ts) in all folders
- [ ] Service methods with proper error handling
- [ ] Repository pattern with TypeORM

Now, ask the user what module they want to create!
