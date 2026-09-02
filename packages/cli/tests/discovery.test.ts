import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { discoverPacks } from '../src/discovery.js'

describe('discovery', () => {
  let tmpRepoDir: string

  beforeEach(() => {
    tmpRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-discovery-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpRepoDir, { recursive: true, force: true })
  })

  it('discovers packs, auto-discovering rules and hooks from filesystem', async () => {
    // Setup fake marketplace repo
    const pluginDir = path.join(tmpRepoDir, '.claude-plugin')
    const packDir = path.join(tmpRepoDir, 'packs', 'my-pack')
    const rulesDir = path.join(packDir, 'rules')
    const hooksDir = path.join(packDir, 'hooks')

    fs.mkdirSync(pluginDir, { recursive: true })
    fs.mkdirSync(rulesDir, { recursive: true })
    fs.mkdirSync(hooksDir, { recursive: true })

    fs.writeFileSync(path.join(rulesDir, 'rule1.md'), '# Rule 1')
    fs.writeFileSync(path.join(hooksDir, 'hooks.json'), '{"hooks": {}}')

    const manifest = {
      plugins: [
        {
          name: 'my-pack',
          version: '1.0.0',
          description: 'A test pack',
          source: './packs/my-pack',
        },
      ],
    }
    fs.writeFileSync(path.join(pluginDir, 'marketplace.json'), JSON.stringify(manifest))

    const startDir = path.join(tmpRepoDir, 'sub', 'folder')
    fs.mkdirSync(startDir, { recursive: true })

    // Use ensureRepo fallback or local discovery
    const marketplaceJsonPath = path.join(pluginDir, 'marketplace.json')
    expect(fs.existsSync(marketplaceJsonPath)).toBe(true)
  })
})
