import type { Result, Tag, TagColorKey, UserSummary } from './types'

/** Contract for the Friend Management spec. */
export interface FriendDirectory {
  search(query: string): Promise<Result<UserSummary[]>>
}

/** Contract for Tag Management (R22). Removing a tag removes assignments only (D-18). */
export interface TagDirectory {
  listMine(): Promise<Result<Tag[]>>
  create(input: { name: string; colorKey: TagColorKey }): Promise<Result<Tag>>
  update(id: string, patch: { name?: string; colorKey?: TagColorKey }): Promise<Result<Tag>>
  remove(id: string): Promise<Result<void>>
}
