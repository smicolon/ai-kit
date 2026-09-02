import { Command } from 'commander'
import path from 'node:path'
import pc from 'picocolors'
import * as p from '@clack/prompts'
import { findPack, discoverPacks } from '../discovery.js'
import { readConfig, writeConfig, mergeInstall, createDefaultConfig } from '../config.js'
import { updateGitignore } from '../gitignore.js'
import { installPack } from '../installer.js'
import { getGlobalTools, saveGlobalTools } from '../global-config.js'
import { getRegistryOptions } from '../global-opts.js'
import { TOOL_REGISTRY, TOOL_IDS } from '../tools.js'
import type { ToolId, ComponentType } from '../types.js'

/**
 * Resolve which tools to use. Priority:
 * 1. --tools flag
 * 2. Local .ai-kit.json config
 * 3. Global ~/.config/ai-kit/config.json
 * 4. Interactive prompt (saved to global config)
 */
async function resolveTools(
  toolsFlag: string | undefined,
  projectDir: string,
): Promise<ToolId[] | null> {
  // 1. Explicit flag
  if (toolsFlag) {
    return toolsFlag.split(',').map(t => t.trim()) as ToolId[]
  }

  // 2. Local config
  const config = readConfig(projectDir)
  if (config?.tools?.length) {
    return config.tools
  }

  // 3. Global config
  const globalTools = getGlobalTools()
  if (globalTools?.length) {
    return globalTools
  }

  // 4. Prompt
  const selection = await p.autocompleteMultiselect({
    message: 'Which AI coding tools do you use? (type to filter)',
    options: TOOL_IDS.map(id => ({
      value: id,
      label: TOOL_REGISTRY[id].label,
      hint: TOOL_REGISTRY[id].hint,
    })),
    required: true,
  })

  if (p.isCancel(selection)) return null

  const tools = selection as ToolId[]
  saveGlobalTools(tools)
  return tools
}

export const addCommand = new Command('add')
  .description('Add a pack to your project')
  .argument('<pack>', 'Pack name (e.g., django, nextjs)')
  .option('--skills-only', 'Only install skills')
  .option('--agents-only', 'Only install agents')
  .option('--rules-only', 'Only install rules')
  .option('--commands-only', 'Only install commands')
  .option('--hooks-only', 'Only install hooks')
  .option('--tools <tools>', 'Comma-separated tool IDs (overrides config)')
  .option('--cwd <dir>', 'Project directory (for monorepo sub-packages)')
  .action(async (packName: string, opts: Record<string, unknown>) => {
    const projectDir = opts.cwd ? path.resolve(opts.cwd as string) : process.cwd()
    const registryOpts = getRegistryOptions()

    // Resolve pack
    const pack = await findPack(packName, registryOpts)
    if (!pack) {
      const available = (await discoverPacks(registryOpts)).map(p => p.name)
      console.error(
        pc.red(`Pack "${packName}" not found.`) +
        '\nAvailable: ' + available.join(', '),
      )
      process.exit(1)
    }

    // Resolve tools (auto-configures if needed)
    const tools = await resolveTools(opts.tools as string | undefined, projectDir)
    if (!tools) {
      console.log(pc.dim('Cancelled.'))
      return
    }

    // Determine filter
    let filter: ComponentType[] | undefined
    if (opts.skillsOnly) filter = ['skills']
    else if (opts.agentsOnly) filter = ['agents']
    else if (opts.rulesOnly) filter = ['rules']
    else if (opts.commandsOnly) filter = ['commands']
    else if (opts.hooksOnly) filter = ['hooks']

    // Install
    const result = installPack({ pack, tools, filter, projectDir })

    // Read or create local config
    let config = readConfig(projectDir) ?? createDefaultConfig(tools)
    config.tools = tools

    const updated = mergeInstall(config, result, pack.version)
    writeConfig(projectDir, updated)

    updateGitignore(projectDir)

    // Summary
    const parts: string[] = []
    for (const [type, count] of Object.entries(result.installed)) {
      if (count > 0) parts.push(`${count} ${type}`)
    }

    console.log(
      pc.green(`+ ${pack.name}`) +
      pc.dim(` v${pack.version}`) +
      (parts.length ? ` (${parts.join(', ')})` : ''),
    )
    console.log(pc.dim(`  → ${tools.map(t => t).join(', ')}`))
  })
