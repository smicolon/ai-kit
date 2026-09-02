export type ToolId =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'copilot'
  | 'codex'
  | 'cline'
  | 'continue'
  | 'gemini'
  | 'junie'
  | 'kiro'
  | 'amp'
  | 'antigravity'
  | 'augment'
  | 'roo-code'
  | 'amazon-q'
  | 'opencode'
  | 'goose'
  | 'zed'
  | 'trae'
  | 'devin'
  | 'openhands'
  | 'replit'
  | 'universal'

export type ComponentType = 'agents' | 'skills' | 'commands' | 'rules' | 'hooks'

export interface ToolConfig {
  label: string
  hint: string
  components: Partial<Record<ComponentType, string>>
  skillsDir: string
}

export interface MarketplacePlugin {
  name: string
  version: string
  description: string
  source: string
  category?: string
  keywords?: string[]
  agents?: string[]
  commands?: string[]
  skills?: string[]
  hooks?: string[]
  mcpServers?: string
}

export interface MarketplaceJson {
  plugins: MarketplacePlugin[]
}

export interface ResolvedPack {
  name: string
  version: string
  description: string
  category: string
  keywords: string[]
  sourceDir: string
  agents: string[]
  commands: string[]
  skills: string[]
  rules: string[]
  hooks: string[]
  mcpServers?: string
}

export type Pack = ResolvedPack

export interface AiKitConfig {
  version: string
  tools: ToolId[]
  packs: Record<string, PackConfig>
}

export interface PackConfig {
  version: string
  installedAt: string
  components: Partial<Record<ComponentType, string[]>>
  files?: string[]  // All files/symlinks created (relative to projectDir)
}

export interface InstallOptions {
  pack: ResolvedPack
  tools: ToolId[]
  filter?: ComponentType[]
  projectDir: string
}

export interface InstallResult {
  pack: string
  tools: ToolId[]
  installed: Record<ComponentType, number>
  files: string[]  // All files/symlinks created (relative to projectDir)
}
