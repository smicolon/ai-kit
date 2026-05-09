import { Command } from 'commander'
import path from 'node:path'
import pc from 'picocolors'
import { readConfig, writeConfig, removePack as removeFromConfig } from '../config.js'
import { findOrphans, removePack } from '../installer.js'
import { findPack } from '../discovery.js'

export const removeCommand = new Command('remove')
  .description('Remove a pack from your project')
  .argument('<pack>', 'Pack name to remove')
  .option('--cwd <dir>', 'Project directory')
  .action(async (packName: string, opts: { cwd?: string }) => {
    const projectDir = opts.cwd ? path.resolve(opts.cwd) : process.cwd()
    const config = readConfig(projectDir)
    const packConfig = config?.packs[packName]

    if (packConfig) {
      const files = packConfig.files ?? []
      if (files.length === 0) {
        console.log(pc.yellow(`No tracked files for "${packName}". Removing from config only.`))
      } else {
        const removed = removePack(projectDir, files)
        console.log(pc.green(`Removed ${removed} file(s) for ${packName}`))
      }
      writeConfig(projectDir, removeFromConfig(config!, packName))
      console.log(pc.dim('Config updated.'))
      return
    }

    // Fallback: pack isn't tracked in .ai-kit.json (older install or manifest
    // reset). Look up the pack in the marketplace and clean up anything on
    // disk that matches the install layout.
    const pack = await findPack(packName)
    if (!pack) {
      console.error(
        pc.red(`Pack "${packName}" is not installed and not found in the marketplace.`) +
        (config && Object.keys(config.packs).length > 0
          ? '\nInstalled: ' + Object.keys(config.packs).join(', ')
          : ''),
      )
      process.exit(1)
    }

    const orphans = findOrphans(pack, projectDir)
    if (orphans.length === 0) {
      console.log(pc.dim(`Nothing to remove for "${packName}" — no tracked entry and no orphan files found.`))
      return
    }

    console.log(pc.yellow(
      `"${packName}" not in .ai-kit.json — found ${orphans.length} orphan file(s) to clean up:`,
    ))
    for (const p of orphans) {
      console.log(pc.dim('  ' + path.relative(projectDir, p)))
    }

    const relPaths = orphans.map(p => path.relative(projectDir, p))
    const removed = removePack(projectDir, relPaths)
    console.log(pc.green(`Removed ${removed} orphan file(s) for ${packName}`))
  })
