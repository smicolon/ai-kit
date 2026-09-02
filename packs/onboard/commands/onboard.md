---
name: onboard
description: Interactive onboarding flow that assesses engineer skills, analyzes the project, and generates personalized guidance for getting productive fast
argument-hint: '[--quick] [--task "description"]'
allowed-tools: ["Read", "Write", "Glob", "Grep", "Bash", "AskUserQuestion"]
---

# Engineer Onboarding

Run a guided onboarding flow that personalizes project guidance based on the engineer's background and their first task.

---

## Steps

### 1. Parse Arguments

Extract from user input:
- **--quick**: Skip skill assessment, assume mid-level generalist (optional)
- **--task**: Pre-specify first task to skip task question (optional)

### 2. Introduction

Briefly explain what will happen:

```
Welcome! I'll get you up to speed on this project in a few minutes.

Here's how this works:
1. A few questions about your background (so I don't over-explain things you know)
2. I'll analyze the project automatically
3. You'll get personalized guidance + a cheat sheet

Let's start.
```

### 3. Engineer Assessment (skip if --quick)

Ask these core questions using AskUserQuestion:

**Question 1 - Primary Stack:**
"What's your primary language/framework and roughly how long have you been using it?"

**Question 2 - Other Skills:**
"What other languages or frameworks are you comfortable with?"

**Question 3 - New Territory:**
"Looking at this project, what feels completely new or unfamiliar to you?"

**Adaptive Follow-ups (only ask if gaps detected):**

After analyzing the answers, ask follow-ups ONLY for detected gaps:

- If the project uses frontend tech and engineer is backend-only:
  "Any experience with component-based UI frameworks (React, Vue, etc.)?"

- If the project uses backend tech and engineer is frontend-only:
  "Have you worked with ORMs, REST APIs, or database design?"

- If the project has tests and engineer didn't mention testing:
  "How comfortable are you with writing tests / TDD?"

- If the project uses TypeScript and engineer only mentioned JavaScript:
  "How's your TypeScript experience — types, generics, strict mode?"

Maximum 2 follow-up questions. Keep the assessment fast.

### 4. Project Analysis (automatic)

Analyze the project silently. Do NOT ask the engineer anything here.

**4a. Detect Project Type:**

```bash
# Frontend
[ -f "package.json" ] && grep -q '"next"' package.json && echo "nextjs"
[ -f "package.json" ] && grep -q '"nuxt"' package.json && echo "nuxtjs"
[ -f "package.json" ] && grep -q "@tanstack/react-router" package.json && echo "tanstack-router"
[ -f "package.json" ] && grep -q '"hono"' package.json && echo "hono"

# Backend
[ -f "manage.py" ] && echo "django"
[ -f "package.json" ] && grep -q "@nestjs/core" package.json && echo "nestjs"

# Mobile
[ -f "pubspec.yaml" ] && echo "flutter"

# Auth
[ -f "package.json" ] && grep -q '"better-auth"' package.json && echo "better-auth"
```

**4b. Read Key Files:**

Read these files if they exist (silently, don't dump contents to user):
- `CLAUDE.md` — project conventions and instructions
- `README.md` — project overview
- `package.json` or `pyproject.toml` — dependencies and scripts
- `docker-compose.yml` or `Dockerfile` — infrastructure setup
- `.env.example` or `.env.template` — required environment variables

**4c. Analyze Code Patterns:**

Examine 3-5 actual source files to detect:
- Import style (relative vs absolute, aliases, barrel exports)
- File naming convention (kebab-case, camelCase, PascalCase)
- Component/view patterns (class-based, functional, hooks)
- Test location (co-located `__tests__/`, separate `tests/`)
- State management approach
- Error handling patterns

**4d. Detect Installed Convention Packs:**

Check if the project uses any ai-kit marketplace packs by looking for pack-related patterns in code (import aliases like `_users_models`, BaseModel inheritance, etc.).

### 5. Knowledge Gap Analysis (automatic)

Cross-reference engineer's skills with project requirements:

```
Engineer Skills: [what they said in assessment]
Project Stack: [what was detected in analysis]

For each project technology:
  - FAMILIAR: Engineer mentioned it → skip detailed explanation
  - TRANSFERABLE: Engineer knows something similar → explain differences
  - NEW: Engineer has no related experience → explain from scratch

Prioritize by criticality:
  - HIGH: Core to daily work (e.g., the main framework)
  - MEDIUM: Used regularly but not the core (e.g., testing framework)
  - LOW: Used occasionally (e.g., deployment tools)
```

**Personalization Strategy:**

Map new concepts to the engineer's existing knowledge. Examples:

| Engineer Knows | Project Uses | Analogy |
|---------------|-------------|---------|
| Django views | Next.js Server Components | "Like Django views but written in JSX" |
| React state | Django ORM | "Like useState but for database records" |
| REST APIs | GraphQL | "Same data, different query language" |
| unittest | pytest | "Same idea, better syntax and fixtures" |
| JavaScript | TypeScript | "Your JS + type annotations" |

### 6. Task Context (skip if --task provided)

Ask using AskUserQuestion:

**Question:** "What will you be working on first? (Feature, bug fix, or task description)"

**Follow-up** (only if helpful): "Is there an existing feature in the codebase similar to what you need to build?"

### 7. Generate Personalized Briefing

Present the onboarding briefing directly in conversation. Structure:

```markdown
## Project Overview
[1-2 sentences about what this project is, from README/CLAUDE.md]

## Tech Stack
[List detected technologies, mark which ones are NEW for this engineer]

## What You Need to Know
[Personalized explanations for knowledge gaps, using analogies to their background]
[Only explain what they DON'T already know]

## Project Conventions
[Key conventions from CLAUDE.md, focused on ones relevant to their task]
[Import patterns, file structure, naming conventions]

## Your First Task: [task name]
[Step-by-step breakdown:]
1. Start by reading: [2-3 key files to understand the pattern]
2. Create/modify: [what files they'll work on]
3. Follow this pattern: [code example from the codebase]
4. Test with: [how to run tests]

## Getting Started
[Setup commands: install deps, run dev server, run tests]
[Environment variables needed]
```

### 8. Generate Artifacts

Save three files to `.claude/` (local only, gitignored):

**8a. Engineer Profile** — `.claude/onboard-profile.local.md`

```markdown
---
engineer_name: "{{NAME_OR_ANONYMOUS}}"
onboarded_at: "{{ISO_TIMESTAMP}}"
experience_level: "{{junior|mid|senior}}"
---

# Onboarding Profile

## Background
- **Primary Stack**: {{PRIMARY_SKILLS}}
- **Also Knows**: {{SECONDARY_SKILLS}}
- **New To**: {{NEW_SKILLS}}

## Project: {{PROJECT_NAME}}
- **Tech Stack**: {{DETECTED_STACK}}
- **Architecture**: {{ARCHITECTURE_PATTERN}}

## Knowledge Gaps
{{For each gap:}}
- [ ] {{TECHNOLOGY}} ({{HIGH|MEDIUM|LOW}} priority) — {{one-line explanation}}

## Current Task
{{TASK_DESCRIPTION}}

## Key Files for This Task
{{LIST_OF_FILES}}
```

**8b. Cheat Sheet** — `.claude/onboard-cheatsheet.local.md`

```markdown
# {{PROJECT_NAME}} Cheat Sheet

## Quick Commands
| Action | Command |
|--------|---------|
| Install deps | {{INSTALL_CMD}} |
| Run dev server | {{DEV_CMD}} |
| Run tests | {{TEST_CMD}} |
| Lint | {{LINT_CMD}} |

## Import Patterns
{{DETECTED_IMPORT_STYLE_WITH_EXAMPLES}}

## File Structure
{{KEY_DIRECTORIES_AND_WHAT_GOES_WHERE}}

## Where to Add Things
| What | Where |
|------|-------|
| New API route | {{PATH}} |
| New component | {{PATH}} |
| New test | {{PATH}} |
| New model/entity | {{PATH}} |

## Conventions Quick Reference
{{TOP_5_CONVENTIONS_FROM_CLAUDE_MD}}
```

**8c. Task Plan** — `.claude/onboard-task-plan.local.md`

```markdown
# Task Plan: {{TASK_NAME}}

## Similar Existing Code
{{REFERENCE_FILES_THAT_FOLLOW_SAME_PATTERN}}

## Steps
### 1. {{STEP_NAME}}
- File: {{FILE_PATH}}
- What to do: {{DESCRIPTION}}
- Pattern to follow: {{REFERENCE_FILE}}

### 2. {{STEP_NAME}}
...

## Testing
- Run: {{TEST_COMMAND}}
- Check: {{WHAT_TO_VERIFY}}

## When Stuck
- Ask `@onboard-guide` for project-specific questions
- Reference `.claude/onboard-cheatsheet.local.md` for conventions
```

### 9. Wrap Up

After generating everything:

```
Onboarding complete! Here's what I created:

- .claude/onboard-profile.local.md — Your background + knowledge gaps
- .claude/onboard-cheatsheet.local.md — Quick reference for conventions
- .claude/onboard-task-plan.local.md — Step-by-step plan for your task

Next steps:
1. Skim the cheat sheet
2. Read the 2-3 files mentioned in your task plan
3. Start implementing — use @onboard-guide for questions as you go
```

---

## Quick Mode (--quick)

When `--quick` flag is present:
1. Skip Step 3 (engineer assessment)
2. Assume mid-level generalist developer
3. Explain everything at moderate detail
4. Still do full project analysis and task planning
5. Still generate all artifacts

---

## Error Handling

- **No CLAUDE.md**: Fall back to README.md and code analysis. Note that conventions may be incomplete.
- **No README.md**: Extract project purpose from package.json description and code structure.
- **Monorepo detected**: Ask which package/app the engineer will work in, then scope analysis to that directory.
- **No clear tech stack**: Ask the engineer what the project uses.
- **Engineer says "I know everything"**: Skip explanations, focus on conventions and task planning only.
