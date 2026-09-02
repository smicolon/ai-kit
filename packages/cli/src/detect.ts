import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { ToolId } from './types.js'

export interface DetectionResult {
  tools: ToolId[]
  packs: string[]
  reasons: Record<string, string>
}

/**
 * Inspects a project directory to automatically detect active AI tools
 * and likely framework/library packs based on manifest files and project structure.
 */
export function detectProject(projectDir: string): DetectionResult {
  const tools: ToolId[] = []
  const packs: string[] = []
  const reasons: Record<string, string> = {}

  const exists = (relPath: string) => fs.existsSync(path.join(projectDir, relPath))

  // 1. Runtime execution environment detection (inside agent terminal)
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_PLUGIN_ROOT) {
    if (!tools.includes('claude-code')) tools.push('claude-code')
  }
  if (process.env.CURSOR_AGENT || process.env.CURSOR_TRACE_ID) {
    if (!tools.includes('cursor')) tools.push('cursor')
  }
  if (process.env.CODEX_SESSION || process.env.CODEX_HOME) {
    if (!tools.includes('codex')) tools.push('codex')
  }
  if (process.env.ANTIGRAVITY_AGENT || process.env.GEMINI_CLI) {
    if (!tools.includes('antigravity')) tools.push('antigravity')
  }
  if (process.env.WINDSURF_AGENT) {
    if (!tools.includes('windsurf')) tools.push('windsurf')
  }
  if (process.env.DEVIN_AGENT) {
    if (!tools.includes('devin')) tools.push('devin')
  }

  // 2. Project workspace dotfiles and directory detection
  if (exists('.claude') || exists('.claude-plugin') || exists('CLAUDE.md')) {
    if (!tools.includes('claude-code')) tools.push('claude-code')
  }
  if (exists('.cursor') || exists('.cursorrules') || exists('.cursor/rules')) {
    if (!tools.includes('cursor')) tools.push('cursor')
  }
  if (exists('.windsurf') || exists('.windsurfrules')) {
    if (!tools.includes('windsurf')) tools.push('windsurf')
  }
  if (exists('.github/copilot-instructions.md') || exists('.github/skills') || exists('.github/prompts')) {
    if (!tools.includes('copilot')) tools.push('copilot')
  }
  if (exists('.codex')) {
    if (!tools.includes('codex')) tools.push('codex')
  }
  if (exists('.cline') || exists('.clinerules')) {
    if (!tools.includes('cline')) tools.push('cline')
  }
  if (exists('.continue')) {
    if (!tools.includes('continue')) tools.push('continue')
  }
  if (exists('.gemini') || exists('AGENTS.md')) {
    if (!tools.includes('antigravity')) tools.push('antigravity')
  }
  if (exists('.roo-code') || exists('.roo') || exists('.roomodes')) {
    if (!tools.includes('roo-code')) tools.push('roo-code')
  }
  if (exists('.opencode')) {
    if (!tools.includes('opencode')) tools.push('opencode')
  }
  if (exists('.goose')) {
    if (!tools.includes('goose')) tools.push('goose')
  }
  if (exists('.zed')) {
    if (!tools.includes('zed')) tools.push('zed')
  }
  if (exists('.trae')) {
    if (!tools.includes('trae')) tools.push('trae')
  }
  if (exists('.agents/skills')) {
    if (!tools.includes('universal')) tools.push('universal')
  }

  // 3. User machine detection fallback (home directory)
  if (tools.length === 0) {
    const home = os.homedir()
    const homeExists = (p: string) => fs.existsSync(path.join(home, p))
    if (homeExists('.claude')) tools.push('claude-code')
    if (homeExists('.cursor')) tools.push('cursor')
    if (homeExists('.codeium/windsurf')) tools.push('windsurf')
    if (homeExists('.gemini/antigravity') || homeExists('.gemini/antigravity-cli')) tools.push('antigravity')
    if (homeExists('.codex')) tools.push('codex')
    if (homeExists('.cline')) tools.push('cline')
    if (homeExists('.roo') || homeExists('.roo-code')) tools.push('roo-code')
    if (homeExists('.config/opencode') || homeExists('.opencode')) tools.push('opencode')
    if (homeExists('.goose')) tools.push('goose')
    if (homeExists('.trae')) tools.push('trae')
  }

  // Pack detection
  if (exists('manage.py')) {
    packs.push('django')
    reasons['django'] = 'manage.py detected'
  }

  if (exists('pubspec.yaml')) {
    packs.push('flutter')
    reasons['flutter'] = 'pubspec.yaml detected'
  }

  const pkgJsonPath = path.join(projectDir, 'package.json')
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      }

      if (allDeps['next']) {
        packs.push('nextjs')
        reasons['nextjs'] = 'next dependency detected'
        if (!packs.includes('react-review')) {
          packs.push('react-review')
          reasons['react-review'] = 'React/Next.js review rules'
        }
      }

      if (allDeps['nuxt']) {
        packs.push('nuxtjs')
        reasons['nuxtjs'] = 'nuxt dependency detected'
      }

      if (allDeps['hono']) {
        packs.push('hono')
        reasons['hono'] = 'hono dependency detected'
      }

      if (allDeps['@nestjs/core']) {
        packs.push('nestjs')
        reasons['nestjs'] = '@nestjs/core dependency detected'
      }

      if (allDeps['@tanstack/react-router'] || allDeps['@tanstack/start']) {
        packs.push('tanstack-router')
        reasons['tanstack-router'] = 'TanStack Router dependency detected'
      }

      if (allDeps['better-auth']) {
        packs.push('better-auth')
        reasons['better-auth'] = 'better-auth dependency detected'
      }

      if (allDeps['@infisical/sdk'] || allDeps['infisical']) {
        packs.push('infisical')
        reasons['infisical'] = 'infisical dependency detected'
      }
    } catch {
      // Ignore malformed package.json
    }
  }

  // Git repository workflows
  if (exists('.git')) {
    if (!packs.includes('worktree')) {
      packs.push('worktree')
      reasons['worktree'] = 'Git repository detected'
    }
    if (!packs.includes('dev-loop')) {
      packs.push('dev-loop')
      reasons['dev-loop'] = 'TDD dev-loop for git workflows'
    }
    if (!packs.includes('failure-log')) {
      packs.push('failure-log')
      reasons['failure-log'] = 'Persistent failure memory'
    }
  }

  return { tools, packs, reasons }
}
