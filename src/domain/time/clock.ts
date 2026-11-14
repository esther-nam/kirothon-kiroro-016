import type { Instant } from './types';

/** Injectable source of "now" so tests control time (design 3.2, R14.20). */
export interface Clock {
  now(): Instant;
}

/** Real clock. Returns a UTC instant truncated to whole minutes. */
export const systemClock: Clock = {
  now: () => new Date(Math.floor(Date.now() / 60_000) * 60_000).toISOString(),
};

/** Clock fixed at one instant, for tests. */
export function fixedClock(instant: Instant): Clock {
  return { now: () => instant };
}
