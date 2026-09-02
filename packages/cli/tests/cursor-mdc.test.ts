import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { convertToMdc } from '../src/converters/cursor-mdc.js'

describe('cursor-mdc converter', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-mdc-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('converts rule markdown with paths to cursor .mdc format', () => {
    const rulePath = path.join(tmpDir, 'model-convention.md')
    fs.writeFileSync(
      rulePath,
      `---
paths:
  - "**/models.py"
  - "**/models/*.py"
---

# Django Model Conventions
Follow these guidelines when creating models.
`,
    )

    const mdc = convertToMdc(rulePath, 'django')
    expect(mdc).toContain('description: Django Model Conventions')
    expect(mdc).toContain('globs: **/models.py, **/models/*.py')
    expect(mdc).toContain('# Django Model Conventions')
  })

  it('handles markdown without frontmatter gracefully', () => {
    const rulePath = path.join(tmpDir, 'plain.md')
    fs.writeFileSync(
      rulePath,
      `# Plain Rule Without Frontmatter
Just guidelines here.
`,
    )

    const mdc = convertToMdc(rulePath, 'my-pack')
    expect(mdc).toContain('description: Plain Rule Without Frontmatter')
    expect(mdc).toContain('# Plain Rule Without Frontmatter')
  })
})
