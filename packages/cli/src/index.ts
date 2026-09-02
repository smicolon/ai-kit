import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { installCommand } from './commands/install.js'
import { addCommand } from './commands/add.js'
import { listCommand } from './commands/list.js'
import { removeCommand } from './commands/remove.js'
import { updateCommand } from './commands/update.js'
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

program.addCommand(initCommand)
program.addCommand(installCommand)
program.addCommand(addCommand)
program.addCommand(listCommand)
program.addCommand(removeCommand)
program.addCommand(updateCommand)
program.addCommand(searchCommand)
program.addCommand(cacheCommand)
program.parse()

