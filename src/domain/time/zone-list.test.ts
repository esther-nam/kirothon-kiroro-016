import { filterZones, isListedZone, listIanaZones } from './zone-list'

describe('zone-list', () => {
  it('[R7.16] lists IANA identifiers including UTC', () => {
    const zones = listIanaZones()
    expect(zones).toContain('Asia/Seoul')
    expect(zones).toContain('UTC')
    expect(zones.every((z) => z === 'UTC' || z.includes('/'))).toBe(true)
  })
  it('[R13.8] rejects non-IANA values', () => {
    for (const bad of ['', 'Mars/Base', 'GMT+9', 'asia/seoul', 'KST']) {
      expect(isListedZone(bad)).toBe(false)
    }
    expect(isListedZone('America/New_York')).toBe(true)
  })
  it('filters case-insensitively, treating underscores as spaces', () => {
    expect(filterZones('new york')).toContain('America/New_York')
    expect(filterZones('SEOUL')).toEqual(['Asia/Seoul'])
    expect(filterZones('zzzz')).toEqual([])
  })
})
