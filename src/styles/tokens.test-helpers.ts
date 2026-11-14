/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Vitest runs from the project root.
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

/** Parses `--name: value;` declarations from tokens.css. */
export function parseTokens(css: string = tokensCss): Map<string, string> {
  const map = new Map<string, string>()
  for (const m of css.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    if (m[1] && m[2]) map.set(m[1], m[2].trim())
  }
  return map
}

/** Resolves a token to a literal value, following `var(--other)` references. */
export function resolveToken(name: string, tokens: Map<string, string>): string {
  let value = tokens.get(name)
  for (let i = 0; i < 10 && value !== undefined; i++) {
    const ref = /^var\((--[a-z0-9-]+)\)$/.exec(value)
    if (!ref?.[1]) return value
    value = tokens.get(ref[1])
  }
  throw new Error(`Cannot resolve token ${name}`)
}
