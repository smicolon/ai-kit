import { createRequire } from 'node:module'

declare const __CLI_VERSION__: string | undefined

export function getCliVersion(): string {
  if (typeof __CLI_VERSION__ !== 'undefined' && __CLI_VERSION__) {
    return __CLI_VERSION__
  }
  try {
    const require = createRequire(import.meta.url)
    const pkg = require('../package.json') as { version?: string }
    return pkg.version ?? '0.5.2'
  } catch {
    return '0.5.2'
  }
}
