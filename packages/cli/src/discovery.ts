import fs from 'node:fs'
import path from 'node:path'
import type { MarketplaceJson, ResolvedPack } from './types.js'
import { ensureRepo, type EnsureRepoOptions } from './registry.js'

/**
 * Find marketplace.json by walking up from a starting directory.
 * Looks for `.claude-plugin/marketplace.json` in each ancestor.
 */
function findMarketplaceJson(startDir: string): string | null {
  let dir = startDir
  while (true) {
    const candidate = path.join(dir, '.claude-plugin', 'marketplace.json')
    if (fs.existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/**
 * Resolve a single pack from its marketplace entry.
 * Converts relative paths to absolute, discovers rules from filesystem.
 */
function resolvePack(
  plugin: MarketplaceJson['plugins'][number],
  marketplaceDir: string,
): ResolvedPack {
  const sourceDir = path.resolve(marketplaceDir, plugin.source)

  const resolveFiles = (files: string[] | undefined): string[] =>
    (files ?? []).map(f => path.resolve(sourceDir, f))

  // Discover rules from filesystem (not in marketplace.json)
  let rules: string[] = []
  const rulesDir = path.join(sourceDir, 'rules')
  if (fs.existsSync(rulesDir)) {
    rules = fs.readdirSync(rulesDir)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(rulesDir, f))
  }

  // Skills entries point at the skill directory (containing SKILL.md).
  const skills = (plugin.skills ?? []).map(s => path.resolve(sourceDir, s))

  // Discover hooks from filesystem or marketplace.json
  let hooks: string[] = []
  const hooksFile = path.join(sourceDir, 'hooks', 'hooks.json')
  if (fs.existsSync(hooksFile)) {
    hooks.push(hooksFile)
  }
  if (plugin.hooks) {
    for (const h of plugin.hooks) {
      const resolved = path.resolve(sourceDir, h)
      if (!hooks.includes(resolved)) {
        hooks.push(resolved)
      }
    }
  }

  // MCP servers from plugin config or .mcp.json in pack
  let mcpServers = plugin.mcpServers
    ? path.resolve(sourceDir, plugin.mcpServers)
    : undefined
  if (!mcpServers && fs.existsSync(path.join(sourceDir, '.mcp.json'))) {
    mcpServers = path.join(sourceDir, '.mcp.json')
  }

  return {
    name: plugin.name,
    version: plugin.version,
    description: plugin.description,
    category: plugin.category ?? '',
    keywords: plugin.keywords ?? [],
    sourceDir,
    agents: resolveFiles(plugin.agents),
    commands: resolveFiles(plugin.commands),
    skills,
    rules,
    hooks,
    mcpServers,
  }
}

/**
 * Resolve packs from a given marketplace.json path.
 */
function resolvePacksFromPath(marketplacePath: string): ResolvedPack[] {
  const marketplaceDir = path.dirname(path.dirname(marketplacePath))
  const raw = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8')) as MarketplaceJson

  return raw.plugins
    .map(p => resolvePack(p, marketplaceDir))
    .filter(p => fs.existsSync(p.sourceDir))
}

/**
 * Discover all packs from marketplace.json.
 * Tries local discovery first (dev mode), falls back to GitHub cache.
 */
export async function discoverPacks(
  registryOptions?: EnsureRepoOptions,
): Promise<ResolvedPack[]> {
  // Try local first (for development when running from the repo)
  const start = path.dirname(new URL(import.meta.url).pathname)
  const localPath = findMarketplaceJson(start)

  if (localPath) {
    return resolvePacksFromPath(localPath)
  }

  // Fall back to cached GitHub repo
  const repoDir = await ensureRepo(registryOptions)
  const remotePath = path.join(repoDir, '.claude-plugin', 'marketplace.json')

  if (!fs.existsSync(remotePath)) {
    throw new Error(
      'Could not find .claude-plugin/marketplace.json in cached repo. ' +
      'Try running: ai-kit cache clear',
    )
  }

  return resolvePacksFromPath(remotePath)
}

/**
 * Find a single pack by name.
 */
export async function findPack(
  name: string,
  registryOptions?: EnsureRepoOptions,
): Promise<ResolvedPack | undefined> {
  const packs = await discoverPacks(registryOptions)
  return packs.find(p => p.name === name)
}
