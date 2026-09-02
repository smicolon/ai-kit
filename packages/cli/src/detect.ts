import fs from 'node:fs'
import path from 'node:path'
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

  // Tool detection
  if (exists('.claude') || exists('.claude-plugin') || exists('CLAUDE.md')) {
    tools.push('claude-code')
  }
  if (exists('.cursor') || exists('.cursorrules')) {
    tools.push('cursor')
  }
  if (exists('.windsurf') || exists('.windsurfrules')) {
    tools.push('windsurf')
  }
  if (exists('.github/copilot-instructions.md') || exists('.github/skills')) {
    tools.push('copilot')
  }
  if (exists('.codex')) {
    tools.push('codex')
  }
  if (exists('.cline') || exists('.clinerules')) {
    tools.push('cline')
  }
  if (exists('.continue')) {
    tools.push('continue')
  }
  if (exists('.gemini') || exists('AGENTS.md')) {
    tools.push('antigravity')
  }
  if (exists('.roo-code')) {
    tools.push('roo-code')
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
