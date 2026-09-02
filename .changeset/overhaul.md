---
"@smicolon/ai-kit": minor
---

Comprehensive overhaul and modernization of ai-kit:
- Added dynamic version resolution (fixes hardcoded version)
- Added `ai-kit install` (`ai-kit i`) to restore all packs from `.ai-kit.json`
- Added smart workspace project stack and AI tool auto-detection
- Fixed `ai-kit init` recording packs as v0.0.0
- Auto-discover hooks from packs without deleting `.claude/hooks.json` on remove
- Added cross-platform copy fallback for Windows symlink failures
- Added `.mcp.json` installation and merging support
- Aligned Antigravity tool to canonical `.agents/skills` standard
- Added comprehensive Bun unit test suite (15 tests across 5 suites)
- Modernized framework standards for React 19, Tailwind CSS v4, Nuxt 4, and TanStack Start
