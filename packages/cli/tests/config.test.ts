import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  createDefaultConfig,
  readConfig,
  writeConfig,
  mergeInstall,
  removePack,
  configPath,
} from '../src/config.js'
import type { InstallResult } from '../src/types.js'

describe('config', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-config-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('creates default config with specified tools', () => {
    const config = createDefaultConfig(['claude-code', 'cursor'])
    expect(config.version).toBe('1')
    expect(config.tools).toEqual(['claude-code', 'cursor'])
    expect(config.packs).toEqual({})
  })

  it('reads and writes config file', () => {
    const config = createDefaultConfig(['antigravity'])
    writeConfig(tmpDir, config)
    expect(fs.existsSync(configPath(tmpDir))).toBe(true)

    const read = readConfig(tmpDir)
    expect(read).not.toBeNull()
    expect(read?.tools).toEqual(['antigravity'])
  })

  it('returns null if config does not exist', () => {
    expect(readConfig(tmpDir)).toBeNull()
  })

  it('merges install results with explicit pack version', () => {
    const config = createDefaultConfig(['claude-code'])
    const result: InstallResult = {
      pack: 'django',
      tools: ['claude-code'],
      installed: {
        agents: 5,
        skills: 8,
        commands: 3,
        rules: 6,
        hooks: 0,
      },
      files: ['.claude/agents/django-architect.md'],
    }

    const updated = mergeInstall(config, result, '2.1.2')
    expect(updated.packs['django']).toBeDefined()
    expect(updated.packs['django'].version).toBe('2.1.2')
    expect(updated.packs['django'].files).toEqual(['.claude/agents/django-architect.md'])
  })

  it('removes a pack from config without touching others', () => {
    let config = createDefaultConfig(['claude-code'])
    config.packs['pack1'] = {
      version: '1.0.0',
      installedAt: new Date().toISOString(),
      components: {},
      files: [],
    }
    config.packs['pack2'] = {
      version: '2.0.0',
      installedAt: new Date().toISOString(),
      components: {},
      files: [],
    }

    config = removePack(config, 'pack1')
    expect(config.packs['pack1']).toBeUndefined()
    expect(config.packs['pack2']).toBeDefined()
  })
})
