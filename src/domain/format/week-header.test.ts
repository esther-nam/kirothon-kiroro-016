import { describe, expect, it } from 'vitest';
import { formatWeekHeader } from './week-header';

describe('formatWeekHeader', () => {
  it('formats a week within one month (R1.4)', () => {
    expect(formatWeekHeader('2026-11-09', 'en-US')).toBe('November 2026 — Nov 9–15');
  });

  it('formats a week spanning two months (R1.5)', () => {
    expect(formatWeekHeader('2026-11-30', 'en-US')).toBe('Nov–Dec 2026 — Nov 30–Dec 6');
  });

  it('formats a week spanning two years (R1.6)', () => {
    expect(formatWeekHeader('2026-12-28', 'en-US')).toBe('Dec 2026–Jan 2027 — Dec 28–Jan 3');
  });

  it('never includes a week number (R1.7)', () => {
    expect(formatWeekHeader('2026-11-09', 'en-US')).not.toMatch(/\bW(eek)?\s*\d+/i);
    // Only the year, the two range days and no extra digit run.
    expect(formatWeekHeader('2026-11-09', 'en-US').match(/\d+/g)).toEqual(['2026', '9', '15']);
  });

  it('uses locale month names (R1.10)', () => {
    const text = formatWeekHeader('2026-11-30', 'de-DE');
    expect(text).toContain('Dez');
    expect(text).not.toContain('Dec');
    expect(formatWeekHeader('2026-12-07', 'de-DE')).toContain('Dezember');
  });
});
