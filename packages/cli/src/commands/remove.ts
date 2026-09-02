import { Command } from 'commander'
import path from 'node:path'
import pc from 'picocolors'
import * as p from '@clack/prompts'
import { readConfig, writeConfig, removePack as removeFromConfig } from '../config.js'
import { findOrphans, removePack } from '../installer.js'
import { findPack } from '../discovery.js'

export const removeCommand = new Command('remove')
  .description('Remove a pack from your project')
  .argument('[pack]', 'Pack name to remove — omit for interactive picker')
  .option('--cwd <dir>', 'Project directory')
  .action(async (packName: string | undefined, opts: { cwd?: string }) => {
    const projectDir = opts.cwd ? path.resolve(opts.cwd) : process.cwd()
    let config = readConfig(projectDir)

    if (!packName) {
      if (!config || Object.keys(config.packs).length === 0) {
        console.log(pc.dim('No packs currently installed in this project.'))
        return
      }

      const installed = Object.keys(config.packs)
      const selection = await p.select({
        message: 'Which pack do you want to remove?',
        options: installed.map(name => ({
          value: name,
          label: name,
          hint: `v${config!.packs[name]?.version ?? '0.0.0'}`,
        })),
      })

      if (p.isCancel(selection)) {
        console.log(pc.dim('Cancelled.'))
        return
      }

      packName = selection as string
    }

    const packConfig = config?.packs[packName]
    const trackedFiles = packConfig?.files ?? []

    if (trackedFiles.length > 0) {
      const removed = removePack(projectDir, trackedFiles)
      console.log(pc.green(`Removed ${removed} file(s) for ${packName}`))
      writeConfig(projectDir, removeFromConfig(config!, packName))
      console.log(pc.dim('Config updated.'))
      return
    }

    // No tracked files — either pack isn't in .ai-kit.json at all, or the
    // entry predates file tracking. Either way, look the pack up in the
    // marketplace and clean any orphan files that provably came from it.
    const pack = await findPack(packName)
    if (!pack) {
      const installed = config && Object.keys(config.packs).length > 0
        ? '\nInstalled: ' + Object.keys(config.packs).join(', ')
        : ''
      console.error(
        pc.red(`Pack "${packName}" is not installed and not found in the marketplace.`) +
        installed,
      )
      process.exit(1)
    }

    const orphans = findOrphans(pack, projectDir)

    if (packConfig) {
      console.log(pc.yellow(
        `"${packName}" has no tracked files in .ai-kit.json (legacy install).`,
      ))
    }

    if (orphans.length === 0) {
      if (packConfig) {
        writeConfig(projectDir, removeFromConfig(config!, packName))
        console.log(pc.dim('Config entry removed; nothing to clean on disk.'))
      } else {
        console.log(pc.dim(`Nothing to remove for "${packName}" — no tracked entry and no orphan files found.`))
      }
      return
    }

    if (!packConfig) {
      console.log(pc.yellow(
        `"${packName}" not in .ai-kit.json — found ${orphans.length} orphan file(s) to clean up:`,
      ))
    } else {
      console.log(pc.yellow(`Found ${orphans.length} orphan file(s):`))
    }
    for (const p of orphans) {
      console.log(pc.dim('  ' + path.relative(projectDir, p)))
    }

    const relPaths = orphans.map(p => path.relative(projectDir, p))
    const removed = removePack(projectDir, relPaths)
    console.log(pc.green(`Removed ${removed} orphan file(s) for ${packName}`))

    if (packConfig) {
      writeConfig(projectDir, removeFromConfig(config!, packName))
      console.log(pc.dim('Config updated.'))
    }
  })
