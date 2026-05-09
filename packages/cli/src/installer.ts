import fs from 'node:fs'
import path from 'node:path'
import type { ComponentType, InstallOptions, InstallResult, ResolvedPack, ToolId } from './types.js'
import { TOOL_REGISTRY, TOOL_IDS, CANONICAL_SKILLS_DIR } from './tools.js'
import { convertToMdc } from './converters/cursor-mdc.js'

/** Tracks all created files relative to projectDir */
let trackedFiles: string[] = []
let currentProjectDir = ''

function trackFile(absPath: string): void {
  trackedFiles.push(path.relative(currentProjectDir, absPath))
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

function copyFile(src: string, dest: string): void {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
  trackFile(dest)
}

function copyDir(src: string, dest: string): void {
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      trackFile(destPath)
    }
  }
}

function createSymlink(target: string, linkPath: string): void {
  ensureDir(path.dirname(linkPath))
  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath)
    if (stat.isSymbolicLink()) fs.unlinkSync(linkPath)
    else return
  }
  const type = process.platform === 'win32' ? 'junction' : undefined
  fs.symlinkSync(target, linkPath, type)
  trackFile(linkPath)
}

function installSkills(
  skillDirs: string[],
  tools: ToolId[],
  projectDir: string,
): number {
  if (skillDirs.length === 0 || tools.length === 0) return 0

  const skillTools = tools.filter(t => TOOL_REGISTRY[t].components.skills)
  if (skillTools.length === 0) return 0

  const canonicalBase = path.join(projectDir, CANONICAL_SKILLS_DIR)
  let count = 0

  for (const skillDir of skillDirs) {
    const skillName = path.basename(skillDir)
    const canonicalDest = path.join(canonicalBase, skillName)

    if (!fs.existsSync(canonicalDest)) {
      copyDir(skillDir, canonicalDest)
      count++
    }
  }

  for (const toolId of skillTools) {
    const toolSkillsDir = path.join(projectDir, TOOL_REGISTRY[toolId].skillsDir)
    if (path.resolve(toolSkillsDir) === path.resolve(canonicalBase)) continue

    ensureDir(toolSkillsDir)

    for (const skillDir of skillDirs) {
      const skillName = path.basename(skillDir)
      const canonicalDest = path.join(canonicalBase, skillName)
      const linkPath = path.join(toolSkillsDir, skillName)
      const relTarget = path.relative(path.dirname(linkPath), canonicalDest)
      createSymlink(relTarget, linkPath)
    }
  }

  return count
}

function installMdFiles(
  files: string[],
  componentType: ComponentType,
  tools: ToolId[],
  projectDir: string,
  packName?: string,
): number {
  if (files.length === 0) return 0

  for (const toolId of tools) {
    const targetDir = TOOL_REGISTRY[toolId].components[componentType]
    if (!targetDir) continue

    const dest = path.join(projectDir, targetDir)
    ensureDir(dest)

    for (const file of files) {
      // Convert rules to .mdc for Cursor
      if (componentType === 'rules' && toolId === 'cursor') {
        const mdcContent = convertToMdc(file, packName ?? 'unknown')
        const mdcName = path.basename(file, '.md') + '.mdc'
        const destPath = path.join(dest, mdcName)
        ensureDir(path.dirname(destPath))
        fs.writeFileSync(destPath, mdcContent)
        trackFile(destPath)
      } else {
        copyFile(file, path.join(dest, path.basename(file)))
      }
    }
  }

  return files.length
}

interface HooksJson {
  hooks: Record<string, unknown[]>
  [key: string]: unknown
}

function installHooks(
  hookFiles: string[],
  tools: ToolId[],
  projectDir: string,
): number {
  if (hookFiles.length === 0) return 0
  if (!tools.includes('claude-code')) return 0

  let count = 0
  const targetHooksDir = path.join(projectDir, '.claude', 'hooks')

  for (const hookFile of hookFiles) {
    if (!fs.existsSync(hookFile)) continue

    const raw = JSON.parse(fs.readFileSync(hookFile, 'utf-8')) as HooksJson
    if (!raw.hooks || Object.keys(raw.hooks).length === 0) continue

    const hookSourceDir = path.dirname(hookFile)

    const scriptFiles = findScriptFiles(hookSourceDir)
    for (const script of scriptFiles) {
      const relPath = path.relative(hookSourceDir, script)
      const destPath = path.join(targetHooksDir, relPath)
      copyFile(script, destPath)
      fs.chmodSync(destPath, 0o755)
    }

    const rewritten = JSON.stringify(raw.hooks)
      .replace(/\$\{CLAUDE_PLUGIN_ROOT\}\/hooks/g, '.claude/hooks')

    const projectHooksPath = path.join(projectDir, '.claude', 'hooks.json')
    let existing: Record<string, unknown[]> = {}

    if (fs.existsSync(projectHooksPath)) {
      const parsed = JSON.parse(fs.readFileSync(projectHooksPath, 'utf-8'))
      existing = parsed.hooks ?? parsed
    }

    const newHooks = JSON.parse(rewritten) as Record<string, unknown[]>
    for (const [event, handlers] of Object.entries(newHooks)) {
      if (!existing[event]) existing[event] = []
      existing[event].push(...handlers)
    }

    ensureDir(path.dirname(projectHooksPath))
    fs.writeFileSync(
      projectHooksPath,
      JSON.stringify({ hooks: existing }, null, 2) + '\n',
    )
    trackFile(projectHooksPath)

    count++
  }

  return count
}

function findScriptFiles(dir: string): string[] {
  const scripts: string[] = []
  if (!fs.existsSync(dir)) return scripts

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      scripts.push(...findScriptFiles(fullPath))
    } else if (/\.(sh|js|ts)$/.test(entry.name)) {
      scripts.push(fullPath)
    }
  }
  return scripts
}

/**
 * Core install function. Copies pack components to the correct
 * tool-specific directories in the user's project.
 */
export function installPack(options: InstallOptions): InstallResult {
  const { pack, tools, filter, projectDir } = options

  // Reset file tracker
  trackedFiles = []
  currentProjectDir = projectDir

  const installed: Record<ComponentType, number> = {
    agents: 0,
    skills: 0,
    commands: 0,
    rules: 0,
    hooks: 0,
  }

  const should = (type: ComponentType) => !filter || filter.includes(type)

  if (should('agents')) {
    installed.agents = installMdFiles(pack.agents, 'agents', tools, projectDir)
  }

  if (should('commands')) {
    installed.commands = installMdFiles(pack.commands, 'commands', tools, projectDir)
  }

  if (should('rules')) {
    installed.rules = installMdFiles(pack.rules, 'rules', tools, projectDir, pack.name)
  }

  if (should('skills')) {
    installed.skills = installSkills(pack.skills, tools, projectDir)
  }

  if (should('hooks')) {
    installed.hooks = installHooks(pack.hooks, tools, projectDir)
  }

  return { pack: pack.name, tools, installed, files: [...trackedFiles] }
}

/**
 * Remove all files installed by a pack.
 * Deletes tracked files and cleans up empty parent directories.
 */
export function removePack(projectDir: string, files: string[]): number {
  let removed = 0

  for (const relFile of files) {
    const absPath = path.join(projectDir, relFile)
    if (!fs.existsSync(absPath) && !isSymlink(absPath)) continue

    if (isSymlink(absPath)) {
      fs.unlinkSync(absPath)
    } else if (fs.statSync(absPath).isDirectory()) {
      fs.rmSync(absPath, { recursive: true })
    } else {
      fs.unlinkSync(absPath)
    }
    removed++

    // Clean up empty parent dirs (up to projectDir)
    let parent = path.dirname(absPath)
    while (parent !== projectDir && parent.length > projectDir.length) {
      try {
        const entries = fs.readdirSync(parent)
        if (entries.length === 0) {
          fs.rmdirSync(parent)
        } else {
          break
        }
      } catch {
        break
      }
      parent = path.dirname(parent)
    }
  }

  return removed
}

function isSymlink(p: string): boolean {
  try {
    return fs.lstatSync(p).isSymbolicLink()
  } catch {
    return false
  }
}

/**
 * Find files on disk that look like they were installed by this pack but
 * are not tracked in .ai-kit.json. Used by `remove` to clean up orphans
 * left behind when the project manifest was reset or never tracked them
 * (e.g. installed by an older CLI version).
 *
 * Returns absolute paths. Hooks are skipped because they merge into a
 * shared .claude/hooks.json and can't be safely attributed to one pack.
 */
export function findOrphans(pack: ResolvedPack, projectDir: string): string[] {
  const candidates = new Set<string>()

  for (const skillDir of pack.skills) {
    const skillName = path.basename(skillDir)
    candidates.add(path.join(projectDir, CANONICAL_SKILLS_DIR, skillName))
    for (const toolId of TOOL_IDS) {
      const toolSkillsDir = TOOL_REGISTRY[toolId].components.skills
      if (toolSkillsDir) {
        candidates.add(path.join(projectDir, toolSkillsDir, skillName))
      }
    }
  }

  const addPerTool = (
    files: string[],
    component: Exclude<ComponentType, 'skills' | 'hooks'>,
  ) => {
    for (const file of files) {
      const base = path.basename(file)
      for (const toolId of TOOL_IDS) {
        const dir = TOOL_REGISTRY[toolId].components[component]
        if (!dir) continue
        if (component === 'rules' && toolId === 'cursor') {
          const mdcName = path.basename(file, '.md') + '.mdc'
          candidates.add(path.join(projectDir, dir, mdcName))
        } else {
          candidates.add(path.join(projectDir, dir, base))
        }
      }
    }
  }

  addPerTool(pack.agents, 'agents')
  addPerTool(pack.commands, 'commands')
  addPerTool(pack.rules, 'rules')

  return [...candidates].filter(p => fs.existsSync(p) || isSymlink(p))
}

