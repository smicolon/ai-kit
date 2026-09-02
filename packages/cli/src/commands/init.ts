import { Command } from 'commander'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import path from 'node:path'
import { TOOL_REGISTRY, TOOL_IDS } from '../tools.js'
import { discoverPacks } from '../discovery.js'
import { readConfig, writeConfig, createDefaultConfig, mergeInstall } from '../config.js'
import { updateGitignore } from '../gitignore.js'
import { installPack } from '../installer.js'
import { getGlobalTools, saveGlobalTools } from '../global-config.js'
import { getRegistryOptions } from '../global-opts.js'
import { detectProject } from '../detect.js'
import type { ToolId, ComponentType } from '../types.js'


export const initCommand = new Command('init')
  .description('Interactive first-time setup')
  .option('--cwd <dir>', 'Project directory (for monorepo sub-packages)')
  .action(async (opts: { cwd?: string }) => {
    p.intro(pc.bgCyan(pc.black(' ai-kit ')))

    const projectDir = opts.cwd ? path.resolve(opts.cwd) : process.cwd()
    const existing = readConfig(projectDir)

    if (existing) {
      const action = await p.select({
        message: 'ai-kit is already configured. What would you like to do?',
        options: [
          { value: 'reconfigure', label: 'Reconfigure from scratch' },
          { value: 'add', label: 'Add more packs' },
          { value: 'cancel', label: 'Cancel' },
        ],
      })

      if (p.isCancel(action) || action === 'cancel') {
        p.outro('Cancelled.')
        return
      }

      if (action === 'add') {
        // Show interactive pack selector with already-installed packs excluded
        const s = p.spinner()
        let packs
        try {
          s.start('Fetching available packs...')
          packs = await discoverPacks(getRegistryOptions())
          s.stop('Packs loaded.')
        } catch {
          s.stop('Failed.')
          p.log.error('Could not fetch packs.')
          p.outro('Failed.')
          return
        }

        const installedNames = Object.keys(existing.packs)
        const available = packs.filter(pk => !installedNames.includes(pk.name))

        if (available.length === 0) {
          p.outro('All packs are already installed!')
          return
        }

        const packSelection = await p.autocompleteMultiselect({
          message: 'Which packs do you want to add? (type to filter)',
          options: available.map(pk => ({
            value: pk.name,
            label: pk.name,
            hint: pk.description,
          })),
          required: true,
        })

        if (p.isCancel(packSelection)) {
          p.outro('Cancelled.')
          return
        }

        const selectedNames = packSelection as string[]
        const installSpinner = p.spinner()
        installSpinner.start('Installing packs...')

        let config = existing
        const selectedPacks = packs.filter(pk => selectedNames.includes(pk.name))
        for (const pack of selectedPacks) {
          const result = installPack({
            pack,
            tools: existing.tools,
            projectDir,
          })
          config = mergeInstall(config, result)
          config.packs[pack.name].version = pack.version
        }

        writeConfig(projectDir, config)
        updateGitignore(projectDir)
        installSpinner.stop('Done!')

        for (const pack of selectedPacks) {
          p.log.message(`  ${pc.green('+')} ${pack.name} ${pc.dim(`v${pack.version}`)}`)
        }

        p.outro(`Added ${selectedPacks.length} pack(s).`)
        return
      }
    }

    // Scan workspace
    const detected = detectProject(projectDir)
    if (detected.tools.length > 0) {
      p.log.info(`Detected workspace AI tools: ${detected.tools.map(t => TOOL_REGISTRY[t].label).join(', ')}`)
    }
    if (detected.packs.length > 0) {
      const details = detected.packs
        .map(pk => `${pk} (${detected.reasons[pk]})`)
        .join(', ')
      p.log.info(`Detected project stack: ${details}`)
    }

    // Step 1: Select AI coding tools (pre-select from global config or detection)
    const savedTools = getGlobalTools()
    const initialTools = savedTools && savedTools.length > 0
      ? savedTools
      : (detected.tools.length > 0 ? detected.tools : [])

    const toolSelection = await p.autocompleteMultiselect({
      message: 'Which AI coding tools do you use? (type to filter)',
      options: TOOL_IDS.map(id => ({
        value: id,
        label: TOOL_REGISTRY[id].label,
        hint: TOOL_REGISTRY[id].hint,
      })),
      initialValues: initialTools,
      required: true,
    })

    if (p.isCancel(toolSelection)) {
      p.outro('Cancelled.')
      return
    }

    const selectedTools = toolSelection as ToolId[]

    // Save tools globally for future use
    saveGlobalTools(selectedTools)

    // Step 2: Discover and select packs
    const s = p.spinner()
    let packs
    try {
      s.start('Fetching available packs...')
      packs = await discoverPacks(getRegistryOptions())
      s.stop('Packs loaded.')
    } catch {
      s.stop('Failed.')
      p.log.error('Could not find marketplace.json. Is ai-kit installed correctly?')
      p.outro('Setup failed.')
      return
    }

    const defaultPacks = detected.packs.filter(dp => packs.some(pk => pk.name === dp))
    const packSelection = await p.autocompleteMultiselect({
      message: 'Which packs do you want to install? (type to filter)',
      options: packs.map(pack => ({
        value: pack.name,
        label: pack.name,
        hint: pack.description,
      })),
      initialValues: defaultPacks.length > 0 ? defaultPacks : undefined,
      required: true,
    })

    if (p.isCancel(packSelection)) {
      p.outro('Cancelled.')
      return
    }

    const selectedPackNames = packSelection as string[]

    // Step 3: Component filter
    const componentChoice = await p.select({
      message: 'What components should be installed?',
      options: [
        { value: 'all', label: 'Everything', hint: 'agents, skills, commands, rules, hooks' },
        { value: 'skills', label: 'Skills only', hint: 'auto-enforcing convention skills' },
        { value: 'pick', label: 'Let me pick' },
      ],
    })

    if (p.isCancel(componentChoice)) {
      p.outro('Cancelled.')
      return
    }

    let filter: ComponentType[] | undefined
    if (componentChoice === 'skills') {
      filter = ['skills']
    } else if (componentChoice === 'pick') {
      const components = await p.multiselect({
        message: 'Select component types:',
        options: [
          { value: 'agents', label: 'Agents', hint: 'specialized AI agents' },
          { value: 'skills', label: 'Skills', hint: 'auto-enforcing conventions' },
          { value: 'commands', label: 'Commands', hint: 'slash commands' },
          { value: 'rules', label: 'Rules', hint: 'path-specific rules' },
          { value: 'hooks', label: 'Hooks', hint: 'lifecycle hooks (Claude Code only)' },
        ],
        required: true,
      })

      if (p.isCancel(components)) {
        p.outro('Cancelled.')
        return
      }
      filter = components as ComponentType[]
    }

    // Step 4: Install
    const installSpinner = p.spinner()
    installSpinner.start('Installing packs...')

    let config = createDefaultConfig(selectedTools)
    const selectedPacks = packs.filter(p => selectedPackNames.includes(p.name))
    for (const pack of selectedPacks) {
      const result = installPack({
        pack,
        tools: selectedTools,
        filter,
        projectDir,
      })

      config = mergeInstall(config, result, pack.version)
    }


    // Step 5: Write config + gitignore
    writeConfig(projectDir, config)
    updateGitignore(projectDir)

    installSpinner.stop('Done!')

    // Summary
    p.log.success(`Installed ${selectedPacks.length} pack(s) for ${selectedTools.length} tool(s):`)
    for (const pack of selectedPacks) {
      p.log.message(`  ${pc.green('+')} ${pack.name} ${pc.dim(`v${pack.version}`)}`)
    }

    p.outro(pc.dim('Run ai-kit add <pack> to add more packs anytime.'))
  })
