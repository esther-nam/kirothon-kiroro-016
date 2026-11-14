import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PREFERENCES,
  isRecognizedZone,
  resolveEffectivePreferences,
  resolveTimeZone,
} from './effective'

describe('resolveTimeZone', () => {
  it('[R14.17] uses the saved zone when valid', () => {
    expect(resolveTimeZone('Asia/Seoul', 'America/New_York')).toBe('Asia/Seoul')
  })
  it('[R14.17][R14.18] a different browser zone never replaces the saved zone', () => {
    expect(resolveTimeZone('Europe/Paris', 'Asia/Tokyo')).toBe('Europe/Paris')
  })
  it('[R14.17] uses the browser zone when nothing is saved', () => {
    expect(resolveTimeZone(null, 'Asia/Tokyo')).toBe('Asia/Tokyo')
    expect(resolveTimeZone(undefined, 'Asia/Tokyo')).toBe('Asia/Tokyo')
  })
  it('[R14.17][R14.19] unrecognized saved zone falls back to the browser zone', () => {
    expect(resolveTimeZone('Mars/Olympus', 'Asia/Tokyo')).toBe('Asia/Tokyo')
  })
  it('[R14.17] invalid or missing browser zone gives UTC', () => {
    expect(resolveTimeZone(null, 'Mars/Olympus')).toBe('UTC')
    expect(resolveTimeZone(null, undefined)).toBe('UTC')
    expect(resolveTimeZone('Nope/Zone', '')).toBe('UTC')
  })
  it('[R13.8] recognizes IANA names and rejects others', () => {
    expect(isRecognizedZone('Asia/Kathmandu')).toBe(true)
    expect(isRecognizedZone('UTC')).toBe(true)
    expect(isRecognizedZone('Mars/Olympus')).toBe(false)
    expect(isRecognizedZone(42)).toBe(false)
    expect(isRecognizedZone('')).toBe(false)
  })
})

describe('resolveEffectivePreferences', () => {
  it('[R3.1][R13.12] applies the defaults to a missing or empty row', () => {
    const expected = {
      timeZone: 'Asia/Seoul',
      timeFormat: '24h',
      intervalMinutes: 15,
      wakeUpTime: '07:00',
      bedtime: '23:00',
      savedTimeZoneUnrecognized: false,
    }
    expect(resolveEffectivePreferences(null, 'Asia/Seoul')).toEqual(expected)
    expect(resolveEffectivePreferences({}, 'Asia/Seoul')).toEqual(expected)
    expect(DEFAULT_PREFERENCES.intervalMinutes).toBe(15)
  })

  it('[R13.12] keeps valid saved values', () => {
    const result = resolveEffectivePreferences(
      { timeZone: 'Europe/Paris', timeFormat: '12h', intervalMinutes: 60, wakeUpTime: '09:00', bedtime: '01:30' },
      'Asia/Tokyo',
    )
    expect(result).toEqual({
      timeZone: 'Europe/Paris',
      timeFormat: '12h',
      intervalMinutes: 60,
      wakeUpTime: '09:00',
      bedtime: '01:30',
      savedTimeZoneUnrecognized: false,
    })
  })

  it('[R13.14] a partly corrupt row falls back per field only', () => {
    const result = resolveEffectivePreferences(
      { timeZone: 'Asia/Seoul', timeFormat: 'bogus', intervalMinutes: 5, wakeUpTime: '24:00', bedtime: '22:15' },
      'UTC',
    )
    expect(result.timeZone).toBe('Asia/Seoul')
    expect(result.timeFormat).toBe('24h')
    expect(result.intervalMinutes).toBe(15)
    expect(result.wakeUpTime).toBe('07:00')
    expect(result.bedtime).toBe('22:15')
  })

  it.each([5, 20, '30', null, 0])('[R13.3] rejects interval %j', (value) => {
    expect(resolveEffectivePreferences({ intervalMinutes: value }, 'UTC').intervalMinutes).toBe(15)
  })

  it.each(['7:00', '07:60', '', '07:00:00', 700, null])('[R13.7] rejects time %j', (value) => {
    expect(resolveEffectivePreferences({ wakeUpTime: value }, 'UTC').wakeUpTime).toBe('07:00')
  })

  it('[R14.19] flags an unrecognized saved zone and falls back', () => {
    const result = resolveEffectivePreferences({ timeZone: 'Mars/Olympus' }, 'Asia/Tokyo')
    expect(result.timeZone).toBe('Asia/Tokyo')
    expect(result.savedTimeZoneUnrecognized).toBe(true)
  })

  it('[R14.17] invalid browser zone with nothing saved gives UTC', () => {
    expect(resolveEffectivePreferences(null, 'Mars/Olympus').timeZone).toBe('UTC')
  })
})
