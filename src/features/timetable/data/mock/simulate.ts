import type { RepositoryError } from '../types'

/** Per-test switches for the mock data source (design 5.1, R18.3). */
export interface Simulation {
  /** Delay applied to every call. 0 means no timer is used. */
  latencyMs: number
  /** Every call fails with `UNAVAILABLE`. */
  fail: boolean
  /** Every write fails with `STALE_VERSION`. */
  staleVersion: boolean
}

export function createSimulation(initial: Partial<Simulation> = {}): Simulation {
  return { latencyMs: 0, fail: false, staleVersion: false, ...initial }
}

export type CallKind = 'read' | 'write'

/** Waits for the configured latency, then returns the simulated error, if any. */
export async function applySimulation(
  simulation: Simulation,
  kind: CallKind,
): Promise<RepositoryError | null> {
  if (simulation.latencyMs > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, simulation.latencyMs))
  }
  if (simulation.fail) return { code: 'UNAVAILABLE', message: 'Simulated failure' }
  if (kind === 'write' && simulation.staleVersion) {
    return { code: 'STALE_VERSION', message: 'Simulated stale version' }
  }
  return null
}
