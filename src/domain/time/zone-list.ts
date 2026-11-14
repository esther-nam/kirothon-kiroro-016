import { isValidZone } from './zone'

const EXTRA_ZONES = ['UTC']

let cached: readonly string[] | null = null

/** Canonical IANA identifiers supported by the runtime, sorted, including UTC. */
export function listIanaZones(): readonly string[] {
  if (cached) return cached
  const supported =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
  const set = new Set<string>([...supported, ...EXTRA_ZONES])
  cached = [...set].filter(isValidZone).sort((a, b) => a.localeCompare(b))
  return cached
}

/** True only for an exact (case-sensitive) IANA identifier from the list. */
export function isListedZone(value: string): boolean {
  return listIanaZones().includes(value)
}

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\s_]+/g, ' ')
    .trim()

/** Case-insensitive substring filter; underscores and spaces are interchangeable. */
export function filterZones(query: string, zones: readonly string[] = listIanaZones()): string[] {
  const q = normalize(query)
  if (q === '') return [...zones]
  return zones.filter(
    (z) => normalize(z.replace(/\//g, ' ')).includes(q) || normalize(z).includes(q),
  )
}
