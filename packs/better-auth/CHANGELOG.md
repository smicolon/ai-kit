# Changelog

All notable changes to the smi-better-auth plugin will be documented in this file.

## [0.2.0] - 2026-09-03

### Added
- `explain-error` skill for diagnosing and resolving Better Auth runtime and configuration error codes
- Modern official plugin patterns for 2FA, Passkeys, Organizations (multi-tenancy), Admin panel, and API keys in `better-auth-patterns`

### Changed
- Migrated MCP configuration to the official `@better-auth/cli mcp` server

## [0.1.0] - 2025-01-02

### Added
- Initial release (experimental)
- 1 agent: auth-architect
- 2 commands: auth-setup, auth-provider-add
- 2 skills:
  - `better-auth-patterns` - Authentication patterns and client setup
  - `auth-security` - Security best practices (rate limiting, CSRF, sessions)
- Better Auth MCP server integration
- Support for:
  - Email/password authentication
  - Social providers (Google, GitHub, Discord, Apple, Microsoft, etc.)
  - Two-factor authentication (2FA)
  - Passkeys/WebAuthn
  - Session management
