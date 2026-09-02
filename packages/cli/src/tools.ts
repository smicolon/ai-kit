import type { ToolId, ToolConfig } from './types.js'

export const TOOL_REGISTRY: Record<ToolId, ToolConfig> = {
  'claude-code': {
    label: 'Claude Code',
    hint: 'agents, skills, commands, rules, hooks',
    skillsDir: '.claude/skills',
    components: {
      agents: '.claude/agents',
      skills: '.claude/skills',
      commands: '.claude/commands',
      rules: '.claude/rules',
      hooks: '.claude/hooks',
    },
  },
  cursor: {
    label: 'Cursor',
    hint: 'skills, rules',
    skillsDir: '.cursor/skills',
    components: {
      skills: '.cursor/skills',
      rules: '.cursor/rules',
    },
  },
  windsurf: {
    label: 'Windsurf',
    hint: 'skills, rules',
    skillsDir: '.windsurf/skills',
    components: {
      skills: '.windsurf/skills',
      rules: '.windsurf/rules',
    },
  },
  copilot: {
    label: 'GitHub Copilot',
    hint: 'agents, skills',
    skillsDir: '.github/skills',
    components: {
      agents: '.github/agents',
      skills: '.github/skills',
    },
  },
  codex: {
    label: 'OpenAI Codex',
    hint: 'agents, skills',
    skillsDir: '.codex/skills',
    components: {
      agents: '.codex/agents',
      skills: '.codex/skills',
    },
  },
  cline: {
    label: 'Cline',
    hint: 'skills, rules',
    skillsDir: '.cline/skills',
    components: {
      skills: '.cline/skills',
      rules: '.cline/rules',
    },
  },
  continue: {
    label: 'Continue',
    hint: 'skills, rules',
    skillsDir: '.continue/skills',
    components: {
      skills: '.continue/skills',
      rules: '.continue/rules',
    },
  },
  gemini: {
    label: 'Gemini Code Assist',
    hint: 'agents, skills',
    skillsDir: '.gemini/skills',
    components: {
      agents: '.gemini/agents',
      skills: '.gemini/skills',
    },
  },
  junie: {
    label: 'Junie',
    hint: 'skills, rules',
    skillsDir: '.junie/skills',
    components: {
      skills: '.junie/skills',
      rules: '.junie/rules',
    },
  },
  kiro: {
    label: 'Kiro',
    hint: 'skills, rules',
    skillsDir: '.kiro/skills',
    components: {
      skills: '.kiro/skills',
      rules: '.kiro/rules',
    },
  },
  amp: {
    label: 'Amp',
    hint: 'agents, skills',
    skillsDir: '.amp/skills',
    components: {
      agents: '.amp/agents',
      skills: '.amp/skills',
    },
  },
  antigravity: {
    label: 'Antigravity',
    hint: 'skills, rules',
    skillsDir: '.agents/skills',
    components: {
      skills: '.agents/skills',
      rules: '.agents/rules',
    },
  },
  augment: {
    label: 'Augment',
    hint: 'skills, rules',
    skillsDir: '.augment/skills',
    components: {
      skills: '.augment/skills',
      rules: '.augment/rules',
    },
  },
  'roo-code': {
    label: 'Roo Code',
    hint: 'skills, rules',
    skillsDir: '.roo-code/skills',
    components: {
      skills: '.roo-code/skills',
      rules: '.roo-code/rules',
    },
  },
  'amazon-q': {
    label: 'Amazon Q',
    hint: 'skills, rules',
    skillsDir: '.amazon-q/skills',
    components: {
      skills: '.amazon-q/skills',
      rules: '.amazon-q/rules',
    },
  },
}

export const TOOL_IDS = Object.keys(TOOL_REGISTRY) as ToolId[]

/** Canonical directory for shared skills (used when multiple tools need the same files) */
export const CANONICAL_SKILLS_DIR = '.agents/skills'
