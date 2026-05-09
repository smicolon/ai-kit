---
"@smicolon/ai-kit": patch
---

`ai-kit remove <pack>` now cleans up orphan files when the pack is missing from `.ai-kit.json` (e.g. installed by an older CLI that didn't track files, or after the project manifest was reset). Falls back to looking up the pack in the marketplace and removing any matching files in canonical and per-tool component directories. Errors only when the pack is also unknown to the marketplace.
