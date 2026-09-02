import fs from 'node:fs'
import path from 'node:path'
import type { AiKitConfig, InstallResult } from './types.js'

const CONFIG_FILE = '.ai-kit.json'

export function configPath(projectDir: string): string {
  return path.join(projectDir, CONFIG_FILE)
}

export function readConfig(projectDir: string): AiKitConfig | null {
  const fp = configPath(projectDir)
  if (!fs.existsSync(fp)) return null
  return JSON.parse(fs.readFileSync(fp, 'utf-8')) as AiKitConfig
}

export function writeConfig(projectDir: string, config: AiKitConfig): void {
  fs.writeFileSync(configPath(projectDir), JSON.stringify(config, null, 2) + '\n')
}

export function mergeInstall(
  config: AiKitConfig,
  result: InstallResult,
  version?: string,
): AiKitConfig {
  const components: Record<string, string[]> = {}

  for (const [type, count] of Object.entries(result.installed)) {
    if (count > 0) {
      components[type] = [`${count} files`]
    }
  }

  const existingPack = config.packs[result.pack]
  const resolvedVersion = version ?? existingPack?.version ?? '0.0.0'

  return {
    ...config,
    packs: {
      ...config.packs,
      [result.pack]: {
        version: resolvedVersion,
        installedAt: new Date().toISOString(),
        components,
        files: result.files,
      },
    },
  }
}


export function removePack(config: AiKitConfig, packName: string): AiKitConfig {
  const { [packName]: _, ...rest } = config.packs
  return { ...config, packs: rest }
}

export function createDefaultConfig(tools: AiKitConfig['tools']): AiKitConfig {
  return {
    version: '1',
    tools,
    packs: {},
  }
}
