import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { installPack, removePack } from '../src/installer.js'
import type { ResolvedPack } from '../src/types.js'

describe('installer', () => {
  let tmpProjectDir: string
  let tmpPackDir: string

  beforeEach(() => {
    tmpProjectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-install-proj-'))
    tmpPackDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-install-pack-'))
  })

  afterEach(() => {
    fs.rmSync(tmpProjectDir, { recursive: true, force: true })
    fs.rmSync(tmpPackDir, { recursive: true, force: true })
  })

  it('installs agents and skills into correct tool directories', () => {
    const agentsDir = path.join(tmpPackDir, 'agents')
    const skillsDir = path.join(tmpPackDir, 'skills', 'my-skill')
    fs.mkdirSync(agentsDir, { recursive: true })
    fs.mkdirSync(skillsDir, { recursive: true })

    const agentFile = path.join(agentsDir, 'test-agent.md')
    fs.writeFileSync(agentFile, '# Test Agent')

    const skillFile = path.join(skillsDir, 'SKILL.md')
    fs.writeFileSync(skillFile, '# Test Skill')

    const fakePack: ResolvedPack = {
      name: 'test-pack',
      version: '1.0.0',
      description: 'Test pack',
      category: 'testing',
      keywords: [],
      sourceDir: tmpPackDir,
      agents: [agentFile],
      commands: [],
      skills: [skillsDir],
      rules: [],
      hooks: [],
    }

    const result = installPack({
      pack: fakePack,
      tools: ['claude-code', 'cursor'],
      projectDir: tmpProjectDir,
    })

    expect(result.installed.agents).toBe(1)
    expect(result.installed.skills).toBe(1)
    expect(fs.existsSync(path.join(tmpProjectDir, '.claude', 'agents', 'test-agent.md'))).toBe(true)
    expect(fs.existsSync(path.join(tmpProjectDir, '.agents', 'skills', 'my-skill', 'SKILL.md'))).toBe(true)

    // Remove pack and check cleanup
    const removedCount = removePack(tmpProjectDir, result.files)
    expect(removedCount).toBeGreaterThan(0)
    expect(fs.existsSync(path.join(tmpProjectDir, '.claude', 'agents', 'test-agent.md'))).toBe(false)
  })

  it('installs hooks without tracking or deleting .claude/hooks.json on removal', () => {
    const hooksDir = path.join(tmpPackDir, 'hooks')
    fs.mkdirSync(hooksDir, { recursive: true })

    const hookScript = path.join(hooksDir, 'test-hook.sh')
    fs.writeFileSync(hookScript, '#!/bin/sh\necho "test"')

    const hooksJson = path.join(hooksDir, 'hooks.json')
    fs.writeFileSync(
      hooksJson,
      JSON.stringify({
        hooks: {
          SessionStart: [
            { command: '${CLAUDE_PLUGIN_ROOT}/hooks/test-hook.sh' },
          ],
        },
      }),
    )

    const fakePack: ResolvedPack = {
      name: 'hook-pack',
      version: '1.0.0',
      description: 'Hook pack',
      category: 'testing',
      keywords: [],
      sourceDir: tmpPackDir,
      agents: [],
      commands: [],
      skills: [],
      rules: [],
      hooks: [hooksJson],
    }

    const result = installPack({
      pack: fakePack,
      tools: ['claude-code'],
      projectDir: tmpProjectDir,
    })

    const projectHooksJson = path.join(tmpProjectDir, '.claude', 'hooks.json')
    expect(fs.existsSync(projectHooksJson)).toBe(true)
    // Verify hooks.json was NOT tracked in files
    expect(result.files.some(f => f.endsWith('hooks.json'))).toBe(false)

    // Verify removePack does not delete hooks.json
    removePack(tmpProjectDir, result.files)
    expect(fs.existsSync(projectHooksJson)).toBe(true)
  })
})
