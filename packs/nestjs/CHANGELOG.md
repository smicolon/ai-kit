# Changelog

All notable changes to the smi-nestjs plugin will be documented in this file.

## [2.2.0] - 2026-09-03

### Added
- `nestjs-security-validator` skill: ValidationPipe whitelist, @nestjs/throttler v5+ rate limits, Helmet, and CORS
- `nestjs-testing-patterns` skill: isolated unit and integration testing via `Test.createTestingModule()`
- Circular dependency prevention and `forwardRef()` resolution in `barrel-export-manager`

## [2.1.0] - 2025-01-02

### Added
- 2 auto-enforcing skills
  - `barrel-export-manager` - Auto-creates index.ts exports
  - `import-convention-enforcer` - Absolute imports from barrels

## [2.0.0] - 2024-12-01

### Changed
- BREAKING: Updated import conventions to use barrel exports
- Standardized entity patterns with UUID primary keys

## [1.0.0] - 2024-10-01

### Added
- Initial stable release
- 3 agents: architect, builder, tester
- 1 command: module-create
