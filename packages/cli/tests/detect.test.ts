import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { detectProject } from '../src/detect.js'

describe('detectProject', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-detect-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('detects django project and claude-code tool', () => {
    fs.writeFileSync(path.join(tmpDir, 'manage.py'), '')
    fs.mkdirSync(path.join(tmpDir, '.claude'))

    const res = detectProject(tmpDir)
    expect(res.tools).toContain('claude-code')
    expect(res.packs).toContain('django')
  })

  it('detects Next.js and react-review from package.json', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        dependencies: {
          next: '^15.0.0',
          'better-auth': '^1.0.0',
        },
      }),
    )

    const res = detectProject(tmpDir)
    expect(res.packs).toContain('nextjs')
    expect(res.packs).toContain('react-review')
    expect(res.packs).toContain('better-auth')
  })

  it('detects flutter from pubspec.yaml', () => {
    fs.writeFileSync(path.join(tmpDir, 'pubspec.yaml'), 'name: my_app')
    const res = detectProject(tmpDir)
    expect(res.packs).toContain('flutter')
  })

  it('detects cursor from .cursor directory', () => {
    fs.mkdirSync(path.join(tmpDir, '.cursor'))
    const res = detectProject(tmpDir)
    expect(res.tools).toContain('cursor')
  })

  it('detects antigravity from AGENTS.md', () => {
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents')
    const res = detectProject(tmpDir)
    expect(res.tools).toContain('antigravity')
  })
})
