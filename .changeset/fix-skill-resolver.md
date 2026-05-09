---
"@smicolon/ai-kit": patch
---

Fix skill resolver after marketplace skill entries became directory-shaped. Previously `discovery.ts` ran `path.dirname()` on each entry assuming it ended with `SKILL.md`; with the new shape this stripped the actual skill name and `installer.ts` collided every skill in a pack at `.claude/skills/skills`.
