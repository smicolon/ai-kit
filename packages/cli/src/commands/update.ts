import { Command } from 'commander'
import path from 'node:path'
import pc from 'picocolors'
import { findPack } from '../discovery.js'
import { readConfig, writeConfig, mergeInstall } from '../config.js'
import { updateGitignore } from '../gitignore.js'
import { installPack, removePack } from '../installer.js'
import { getRegistryOptions } from '../global-opts.js'
import { initCommand } from './init.js'

export const updateCommand = new Command('update')
  .description('Update installed packs')
  .argument('[pack]', 'Pack name (omit to update all)')
  .option('--cwd <dir>', 'Project directory')
export async function runUpdate(packName?: string, opts: { cwd?: string } = {}) {
  const projectDir = opts.cwd ? path.resolve(opts.cwd) : process.cwd()
    const config = readConfig(projectDir)

    if (!config || Object.keys(config.packs).length === 0) {
      console.log(pc.dim('No packs installed yet. Starting setup...\n'))
      await initCommand.parseAsync(['init', ...(opts.cwd ? ['--cwd', opts.cwd] : [])], { from: 'user' })
      return
    }

    // Force re-download to check for updates
    const registryOpts = { ...getRegistryOptions(), noCache: true }

    const packsToUpdate = packName
      ? [packName]
      : Object.keys(config.packs)

    let updated = 0
    let skipped = 0
    for (const name of packsToUpdate) {
      const installed = config.packs[name]
      if (!installed) {
        console.log(pc.yellow(`"${name}" is not installed, skipping.`))
        skipped++
        continue
      }

      const available = await findPack(name, registryOpts)
      if (!available) {
        console.log(pc.yellow(`"${name}" not found in marketplace, skipping.`))
        skipped++
        continue
      }

      if (available.version === installed.version) {
        console.log(pc.dim(`  ${name} v${installed.version} — already up to date`))
        skipped++
        continue
      }

      // Remove old files
      if (installed.files && installed.files.length > 0) {
        removePack(projectDir, installed.files)
      }

      // Reinstall
      const result = installPack({
        pack: available,
        tools: config.tools,
        projectDir,
      })

      const merged = mergeInstall(config, result)
      merged.packs[name].version = available.version
      Object.assign(config, merged)

      console.log(
        pc.green(`  ${name}`) +
        ` ${pc.dim(installed.version)} → ${pc.cyan(available.version)}`,
      )
      updated++
    }

    writeConfig(projectDir, config)
    updateGitignore(projectDir)

    if (updated > 0) {
      console.log(pc.green(`\nUpdated ${updated} pack(s).`))
    }
    if (skipped > 0 && updated === 0) {
      console.log(pc.dim('\nAll packs are up to date.'))
    }
}

updateCommand.action(runUpdate)
