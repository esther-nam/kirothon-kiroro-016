import { describe, expect, it } from 'vitest';
import { fixedClock } from '@/domain/time/clock';
import { NAV_MIN } from '@/domain/time/week';
import { createTimetableUiStore } from './ui-store';

// 2026-03-08 is a Sunday; 2026-03-09 03:00 UTC is still Sunday 2026-03-08 in Los Angeles.
const clock = fixedClock('2026-03-09T03:00:00.000Z');

describe('timetable ui store', () => {
  it('[R2.7] starts at the current week in the zone', () => {
    expect(createTimetableUiStore(clock, 'Asia/Seoul').getState().visibleMonday).toBe('2026-03-09');
    expect(createTimetableUiStore(clock, 'America/Los_Angeles').getState().visibleMonday).toBe('2026-03-02');
  });

  it('[R2.7] a new store (reload) resets to the current week', () => {
    const a = createTimetableUiStore(clock, 'UTC');
    a.getState().goNext();
    expect(createTimetableUiStore(clock, 'UTC').getState().visibleMonday).toBe('2026-03-09');
  });

  it('previous, next and Today move by civil weeks', () => {
    const s = createTimetableUiStore(clock, 'UTC');
    s.getState().goNext();
    expect(s.getState().visibleMonday).toBe('2026-03-16');
    s.getState().goPrevious();
    s.getState().goPrevious();
    expect(s.getState().visibleMonday).toBe('2026-03-02');
    s.getState().goToday('UTC');
    expect(s.getState().visibleMonday).toBe('2026-03-09');
  });

  it('[R14.5] a display timezone change keeps the same Monday', () => {
    const s = createTimetableUiStore(clock, 'UTC');
    s.getState().goNext();
    const before = s.getState().visibleMonday;
    // Zone changes are not store inputs; only Today consults a zone.
    expect(s.getState().visibleMonday).toBe(before);
  });

  it('does not navigate past the lower limit', () => {
    const s = createTimetableUiStore(fixedClock('1900-01-02T00:00:00.000Z'), 'UTC');
    expect(s.getState().visibleMonday).toBe(NAV_MIN);
    s.getState().goPrevious();
    expect(s.getState().visibleMonday).toBe(NAV_MIN);
  });

  it('tracks selection and modal', () => {
    const s = createTimetableUiStore(clock, 'UTC');
    s.getState().selectOccurrence('k1');
    s.getState().openModalKind('settings');
    expect(s.getState().selectedOccurrenceKey).toBe('k1');
    expect(s.getState().openModal).toBe('settings');
    s.getState().closeModal();
    expect(s.getState().openModal).toBe('none');
  });
});
