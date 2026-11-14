import type { FriendDirectory } from '../directories'
import type { Result, UserSummary } from '../types'
import type { MockStore } from './mock-store'
import { applySimulation, createSimulation, type Simulation } from './simulate'

export const FRIEND_SEARCH_MIN_CHARS = 2
export const FRIEND_SEARCH_MAX_RESULTS = 10

export interface MockFriendDirectoryOptions {
  store: MockStore
  /** The signed-in user. Never returned in results. */
  userId: string
  simulation?: Simulation
}

/**
 * Mock of the Friend Management search (R9.1, R9.2, R18.7).
 * Matches display name or username, needs 2 characters, returns at most 10 users.
 * Eligibility is not decided here.
 */
export class MockFriendDirectory implements FriendDirectory {
  private readonly store: MockStore
  private readonly userId: string
  private readonly simulation: Simulation

  constructor(options: MockFriendDirectoryOptions) {
    this.store = options.store
    this.userId = options.userId
    this.simulation = options.simulation ?? createSimulation()
  }

  async search(query: string): Promise<Result<UserSummary[]>> {
    const failure = await applySimulation(this.simulation, 'read')
    if (failure) return { ok: false, error: failure }
    const needle = query.trim().toLocaleLowerCase()
    if ([...needle].length < FRIEND_SEARCH_MIN_CHARS) return { ok: true, value: [] }
    const value = this.store.users
      .filter((u) => u.id !== this.userId)
      .filter(
        (u) =>
          u.displayName.toLocaleLowerCase().includes(needle) ||
          u.username.toLocaleLowerCase().includes(needle),
      )
      .slice(0, FRIEND_SEARCH_MAX_RESULTS)
      .map(toUserSummary)
    return { ok: true, value }
  }
}

/** Copies only the allowed fields, so no other user data can leak (R9.2). */
function toUserSummary(user: {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
}): UserSummary {
  const summary: UserSummary = {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
  }
  if (user.avatarUrl) summary.avatarUrl = user.avatarUrl
  return summary
}
