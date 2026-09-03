# Changelog

All notable changes to the smi-django plugin will be documented in this file.

## [2.2.0] - 2026-09-03

### Added
- Async ORM queries (`aget`, `afirst`, `acreate`) and `CONN_HEALTH_CHECKS` guidance in `performance-optimizer`
- Django 5.x database default patterns

## [2.1.0] - 2025-01-02

### Added
- 8 auto-enforcing skills for convention compliance
  - `import-convention-enforcer` - Absolute modular imports
  - `model-entity-validator` - UUID, timestamps, soft delete
  - `security-first-validator` - Permissions, authentication
  - `test-coverage-advisor` - 90%+ coverage guidance
  - `performance-optimizer` - N+1 detection
  - `migration-safety-checker` - Safe migrations
  - `test-validity-checker` - Test quality
  - `red-phase-verifier` - TDD red phase

## [2.0.0] - 2024-12-01

### Changed
- BREAKING: Renamed `@django-dev` to `@django-builder`
- Updated import conventions to use module aliases

### Added
- `@django-feature-based` agent for large-scale architecture
- `/api-endpoint` command

## [1.0.0] - 2024-10-01

### Added
- Initial stable release
- 5 agents: architect, builder, feature-based, tester, reviewer
- 3 commands: model-create, api-endpoint, test-generate
