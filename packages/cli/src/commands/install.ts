import { Command } from 'commander'
import path from 'node:path'
import pc from 'picocolors'
import { findPack } from '../discovery.js'
import { readConfig, writeConfig, mergeInstall } from '../config.js'
import { updateGitignore } from '../gitignore.js'
import { installPack } from '../installer.js'
import { getRegistryOptions } from '../global-opts.js'
import { initCommand } from './init.js'

export const installCommand = new Command('install')
  .alias('i')
  .description('Install all packs declared in .ai-kit.json')
  .option('--cwd <dir>', 'Project directory')
export async function runInstall(opts: { cwd?: string } = {}) {
  const projectDir = opts.cwd ? path.resolve(opts.cwd) : process.cwd()
    const config = readConfig(projectDir)

    if (!config || Object.keys(config.packs).length === 0) {
      console.log(pc.dim('No packs configured in .ai-kit.json. Running setup...\n'))
      await initCommand.parseAsync(['init', ...(opts.cwd ? ['--cwd', opts.cwd] : [])], { from: 'user' })
      return
    }

    const registryOpts = getRegistryOptions()
    const packNames = Object.keys(config.packs)
    console.log(pc.bold(`Installing ${packNames.length} pack(s) for ${config.tools.join(', ')}...\n`))

    let installedCount = 0
    let updatedConfig = config

    for (const name of packNames) {
      const pack = await findPack(name, registryOpts)
      if (!pack) {
        console.log(pc.yellow(`  ⚠ Pack "${name}" not found in marketplace, skipping.`))
        continue
      }

      const result = installPack({
        pack,
        tools: config.tools,
        projectDir,
      })

      updatedConfig = mergeInstall(updatedConfig, result, pack.version)
      installedCount++

      const parts: string[] = []
      for (const [type, count] of Object.entries(result.installed)) {
        if (count > 0) parts.push(`${count} ${type}`)
      }

      console.log(
        `  ${pc.green('✓')} ${pc.cyan(pack.name)} ${pc.dim(`v${pack.version}`)}` +
        (parts.length ? ` ${pc.dim(`(${parts.join(', ')})`)}` : ''),
      )
    }

    writeConfig(projectDir, updatedConfig)
    updateGitignore(projectDir)

    console.log(pc.green(`\nDone! Successfully installed ${installedCount} pack(s).`))
}

installCommand.action(runInstall)
