# Changelog

All notable changes to the smi-hono plugin will be documented in this file.

## [0.2.0] - 2026-09-03

### Added
- In-memory `app.request` and CLI testing patterns from `yusukebe/hono-skill`
- OpenAPI 3.1 & Swagger UI patterns via `@hono/zod-openapi`
- Server-Sent Events (SSE) and AI streaming patterns (`streamText`, `streamSSE`)

## [0.1.0] - 2025-01-02

### Added
- Initial release (experimental)
- 4 agents: hono-architect, hono-builder, hono-tester, hono-reviewer
- 4 commands: route-create, middleware-create, project-init, rpc-client
- 4 skills: hono-patterns, cloudflare-bindings, zod-validation, rpc-typesafe
- Support for Bun and Cloudflare Workers
- Type-safe RPC client generation
