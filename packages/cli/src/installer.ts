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
 * Find files on disk that were installed by this pack but are not tracked
 * in .ai-kit.json. Used by `remove` to clean up orphans left behind when
 * the project manifest was reset or never tracked them (e.g. installed by
 * an older CLI version).
 *
 * SAFETY: only returns paths that provably came from this pack:
 *   - Files: byte-equal to the pack's source content (after applying the
 *     same install transform — e.g. convertToMdc for cursor rules).
 *   - Skill directories: every file inside matches a source file with the
 *     same content; extra files mean the user touched it — skip.
 *   - Symlinks: target resolves into the canonical .agents/skills/<name>
 *     dir we own.
 *
 * Hooks are skipped because they merge into a shared .claude/hooks.json
 * and can't be safely attributed to one pack.
 */
export function findOrphans(pack: ResolvedPack, projectDir: string): string[] {
  const orphans: string[] = []
  const canonicalBase = path.join(projectDir, CANONICAL_SKILLS_DIR)

  for (const sourceSkillDir of pack.skills) {
    const skillName = path.basename(sourceSkillDir)
    const canonicalDest = path.join(canonicalBase, skillName)

    if (skillDirMatchesSource(canonicalDest, sourceSkillDir)) {
      orphans.push(canonicalDest)
    }

    for (const toolId of TOOL_IDS) {
      const toolSkillsDir = TOOL_REGISTRY[toolId].components.skills
      if (!toolSkillsDir) continue
      const linkPath = path.join(projectDir, toolSkillsDir, skillName)
      if (path.resolve(linkPath) === path.resolve(canonicalDest)) continue
      if (symlinkPointsInto(linkPath, canonicalDest)) {
        orphans.push(linkPath)
      } else if (
        !isSymlink(linkPath) &&
        skillDirMatchesSource(linkPath, sourceSkillDir)
      ) {
        orphans.push(linkPath)
      }
    }
  }

  const collectFiles = (
    sourceFiles: string[],
    component: Exclude<ComponentType, 'skills' | 'hooks'>,
  ) => {
    for (const sourceFile of sourceFiles) {
      const base = path.basename(sourceFile)
      for (const toolId of TOOL_IDS) {
        const dir = TOOL_REGISTRY[toolId].components[component]
        if (!dir) continue

        let destPath: string
        let expected: Buffer

        if (component === 'rules' && toolId === 'cursor') {
          // Current install writes .mdc via convertToMdc.
          const mdcName = path.basename(sourceFile, '.md') + '.mdc'
          destPath = path.join(projectDir, dir, mdcName)
          expected = Buffer.from(convertToMdc(sourceFile, pack.name))
          if (fileContentEquals(destPath, expected)) orphans.push(destPath)

          // Legacy CLI versions (pre c0b8ba6) copied cursor rules as plain
          // .md without conversion. Catch those too.
          const legacyPath = path.join(projectDir, dir, base)
          try {
            const legacyExpected = fs.readFileSync(sourceFile)
            if (fileContentEquals(legacyPath, legacyExpected)) {
              orphans.push(legacyPath)
            }
          } catch { /* source unreadable — skip */ }
          continue
        }

        destPath = path.join(projectDir, dir, base)
        try { expected = fs.readFileSync(sourceFile) }
        catch { continue }

        if (fileContentEquals(destPath, expected)) {
          orphans.push(destPath)
        }
      }
    }
  }

  collectFiles(pack.agents, 'agents')
  collectFiles(pack.commands, 'commands')
  collectFiles(pack.rules, 'rules')

  return [...new Set(orphans)]
}

function fileContentEquals(filePath: string, expected: Buffer): boolean {
  try {
    if (!fs.existsSync(filePath) || isSymlink(filePath)) return false
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) return false
    return fs.readFileSync(filePath).equals(expected)
  } catch {
    return false
  }
}

function symlinkPointsInto(linkPath: string, expectedDir: string): boolean {
  try {
    if (!isSymlink(linkPath)) return false
    const resolved = path.resolve(path.dirname(linkPath), fs.readlinkSync(linkPath))
    return path.resolve(resolved) === path.resolve(expectedDir)
  } catch {
    return false
  }
}

function skillDirMatchesSource(destDir: string, sourceDir: string): boolean {
  if (!fs.existsSync(destDir) || isSymlink(destDir)) return false
  if (!fs.statSync(destDir).isDirectory()) return false

  const sourceFiles = collectRelativeFiles(sourceDir)
  const destFiles = collectRelativeFiles(destDir)

  if (sourceFiles.length !== destFiles.length) return false
  const sourceSet = new Set(sourceFiles)
  for (const f of destFiles) if (!sourceSet.has(f)) return false

  for (const rel of sourceFiles) {
    const src = fs.readFileSync(path.join(sourceDir, rel))
    const dst = fs.readFileSync(path.join(destDir, rel))
    if (!src.equals(dst)) return false
  }
  return true
}

function collectRelativeFiles(dir: string, base = dir): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...collectRelativeFiles(full, base))
    } else if (entry.isFile()) {
      out.push(path.relative(base, full))
    }
  }
  return out.sort()
}

