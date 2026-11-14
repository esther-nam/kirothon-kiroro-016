import { isValidZone } from '../time/zone'

/** Grid intervals in minutes (R13.3). 5 is not offered. */
export const INTERVALS = [15, 30, 60] as const
export type IntervalMinutes = (typeof INTERVALS)[number]
export type TimeFormat = '12h' | '24h'

export const DEFAULT_PREFERENCES = {
  timeFormat: '24h',
  intervalMinutes: 15,
  wakeUpTime: '07:00',
  bedtime: '23:00',
} as const satisfies {
  timeFormat: TimeFormat
  intervalMinutes: IntervalMinutes
  wakeUpTime: string
  bedtime: string
}

/** Last resort for the display timezone (R14.17). */
export const FALLBACK_TIME_ZONE = 'UTC'

/** A stored row as it may arrive: any field can be missing or corrupt (R13.14). */
export interface StoredPreferences {
  timeZone?: unknown
  timeFormat?: unknown
  intervalMinutes?: unknown
  wakeUpTime?: unknown
  bedtime?: unknown
}

export interface EffectivePreferences {
  timeZone: string
  timeFormat: TimeFormat
  intervalMinutes: IntervalMinutes
  /** 'HH:mm' */
  wakeUpTime: string
  /** 'HH:mm' */
  bedtime: string
  /** True when a saved timezone exists but is not a recognized IANA name (R14.19). */
  savedTimeZoneUnrecognized: boolean
}

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/

/** A whole-minute time of day, 00:00 to 23:59 (R13.6, R13.7). */
export function isTimeOfDay(value: unknown): value is string {
  return typeof value === 'string' && HH_MM.test(value)
}

/** True for a recognized IANA identifier. Rejects values such as `Mars/Olympus` (R14.17). */
export function isRecognizedZone(value: unknown): value is string {
  return typeof value === 'string' && value !== '' && isValidZone(value)
}

function pickInterval(value: unknown): IntervalMinutes {
  return INTERVALS.find((i) => i === value) ?? DEFAULT_PREFERENCES.intervalMinutes
}

function pickFormat(value: unknown): TimeFormat {
  return value === '12h' || value === '24h' ? value : DEFAULT_PREFERENCES.timeFormat
}

/**
 * Display timezone: saved if valid, else browser if valid, else UTC (R14.17).
 * Pure: a differing browser zone never replaces the saved one (R14.18).
 */
export function resolveTimeZone(saved: unknown, browser: unknown): string {
  if (isRecognizedZone(saved)) return saved
  if (isRecognizedZone(browser)) return browser
  return FALLBACK_TIME_ZONE
}

/**
 * Merges a stored row with the defaults (R13.12). Each invalid field falls back
 * on its own, so a partly corrupt row still renders (R13.14).
 */
export function resolveEffectivePreferences(
  stored: StoredPreferences | null | undefined,
  browserZone: unknown,
): EffectivePreferences {
  const row = stored ?? {}
  const hasSavedZone = row.timeZone !== null && row.timeZone !== undefined
  return {
    timeZone: resolveTimeZone(row.timeZone, browserZone),
    timeFormat: pickFormat(row.timeFormat),
    intervalMinutes: pickInterval(row.intervalMinutes),
    wakeUpTime: isTimeOfDay(row.wakeUpTime) ? row.wakeUpTime : DEFAULT_PREFERENCES.wakeUpTime,
    bedtime: isTimeOfDay(row.bedtime) ? row.bedtime : DEFAULT_PREFERENCES.bedtime,
    savedTimeZoneUnrecognized: hasSavedZone && !isRecognizedZone(row.timeZone),
  }
}
