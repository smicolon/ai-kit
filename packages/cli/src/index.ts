import { Command } from 'commander'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { readConfig } from './config.js'
import { initCommand, runInit } from './commands/init.js'
import { installCommand, runInstall } from './commands/install.js'
import { addCommand, runAdd } from './commands/add.js'
import { listCommand, runList } from './commands/list.js'
import { removeCommand, runRemove } from './commands/remove.js'
import { updateCommand, runUpdate } from './commands/update.js'
import { searchCommand } from './commands/search.js'
import { cacheCommand } from './commands/cache.js'
import { setGlobalRegistryOptions } from './global-opts.js'
import { getCliVersion } from './version.js'

const program = new Command()
  .name('ai-kit')
  .description('AI coding tool pack manager')
  .version(getCliVersion())
  .option('--no-cache', 'Force re-download from GitHub (skip cache check)')
  .option('--branch <branch>', 'Use specific branch (default: main)')
  .hook('preAction', () => {
    const opts = program.opts()
    setGlobalRegistryOptions({
      noCache: opts.cache === false,
      branch: opts.branch,
    })
  })
  .action(async () => {
    const projectDir = process.cwd()
    const config = readConfig(projectDir)
    const isConfigured = Boolean(config && Object.keys(config.packs).length > 0)

    p.intro(`${pc.bgCyan(pc.black(' ai-kit '))} ${pc.dim(`v${getCliVersion()}`)} ${pc.cyan('— AI Coding Tool Conventions')}`)

    const choices = isConfigured
      ? [
          { value: 'add', label: 'Add packs', hint: 'select and install convention packs' },
          { value: 'install', label: 'Install / Restore packs', hint: 're-install all packs in .ai-kit.json' },
          { value: 'update', label: 'Update packs', hint: 'check for updates and bump versions' },
          { value: 'list', label: 'Browse available packs', hint: 'view all 16 packs by category' },
          { value: 'remove', label: 'Remove an installed pack', hint: 'uninstall a pack and clean up files' },
          { value: 'reconfigure', label: 'Reconfigure project', hint: 'run full setup wizard' },
          { value: 'exit', label: 'Exit' },
        ]
      : [
          { value: 'init', label: 'Initialize project (Recommended)', hint: 'detect AI tools & stack, setup conventions' },
          { value: 'add', label: 'Add packs', hint: 'choose from 16 available convention packs' },
          { value: 'list', label: 'Browse available packs', hint: 'view frameworks, workflows, and tools' },
          { value: 'exit', label: 'Exit' },
        ]

    const action = await p.select({
      message: 'What would you like to do?',
      options: choices,
    })

    if (p.isCancel(action) || action === 'exit') {
      p.outro(pc.dim('Goodbye!'))
      return
    }

    if (action === 'add') {
      await runAdd()
    } else if (action === 'init' || action === 'reconfigure') {
      await runInit()
    } else if (action === 'install') {
      await runInstall()
    } else if (action === 'update') {
      await runUpdate()
    } else if (action === 'list') {
      await runList()
    } else if (action === 'remove') {
      await runRemove()
    }
  })

program.addCommand(initCommand)
program.addCommand(installCommand)
program.addCommand(addCommand)
program.addCommand(listCommand)
program.addCommand(removeCommand)
program.addCommand(updateCommand)
program.addCommand(searchCommand)
program.addCommand(cacheCommand)
program.parse()


