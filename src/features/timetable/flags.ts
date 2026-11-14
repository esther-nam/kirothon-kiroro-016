/**
 * Feature flags as constants (no dependency). Recurrence and participant saving stay
 * off until M6 and M7 implement their behavior (tasks.md, decision 4).
 */
export const FEATURE_FLAGS = {
  recurrence: false,
  participants: false,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
