import { describe, expect, it } from 'vitest'
import { MockFriendDirectory } from './mock-friends'
import { MockStore, type MockStoreData, type MockUser } from './mock-store'
import { MockTagDirectory } from './mock-tags'

function storeWith(users: MockUser[]): MockStore {
  const data: MockStoreData = {
    users,
    events: [],
    tags: { me: [{ id: 't1', name: 'Work', colorKey: 'blue' }] },
    preferences: {},
  }
  return new MockStore(data)
}

const me: MockUser = { id: 'me', displayName: 'Me Myself', username: 'me' }

describe('MockFriendDirectory', () => {
  it('returns nothing for a 1-character query (R9.1)', async () => {
    const dir = new MockFriendDirectory({
      store: storeWith([me, { id: 'u1', displayName: 'Ana', username: 'ana' }]),
      userId: 'me',
    })
    const res = await dir.search('a')
    expect(res).toEqual({ ok: true, value: [] })
  })

  it('matches display name or username, ignoring case', async () => {
    const dir = new MockFriendDirectory({
      store: storeWith([
        me,
        { id: 'u1', displayName: 'Ana Kim', username: 'akim' },
        { id: 'u2', displayName: 'Ben', username: 'anchor' },
        { id: 'u3', displayName: 'Cleo', username: 'cleo' },
      ]),
      userId: 'me',
    })
    const res = await dir.search('AN')
    expect(res.ok && res.value.map((u) => u.id)).toEqual(['u1', 'u2'])
  })

  it('returns at most 10 of 11 matches', async () => {
    const users = Array.from({ length: 11 }, (_, i) => ({
      id: `u${i}`,
      displayName: `Sam ${i}`,
      username: `sam${i}`,
    }))
    const dir = new MockFriendDirectory({ store: storeWith([me, ...users]), userId: 'me' })
    const res = await dir.search('sam')
    expect(res.ok && res.value).toHaveLength(10)
  })

  it('exposes only id, display name, username and avatar URL (R9.2)', async () => {
    const leaky = {
      id: 'u1',
      displayName: 'Ana',
      username: 'ana',
      avatarUrl: 'https://x/a.png',
      email: 'a@x.com',
      phone: '123',
    }
    const dir = new MockFriendDirectory({
      store: storeWith([me, leaky as MockUser]),
      userId: 'me',
    })
    const res = await dir.search('ana')
    if (!res.ok) throw new Error('expected ok')
    expect(Object.keys(res.value[0] ?? {}).sort()).toEqual([
      'avatarUrl',
      'displayName',
      'id',
      'username',
    ])
  })

  it('never returns the signed-in user', async () => {
    const dir = new MockFriendDirectory({ store: storeWith([me]), userId: 'me' })
    expect(await dir.search('me')).toEqual({ ok: true, value: [] })
  })
})

describe('MockTagDirectory', () => {
  it('lists own tags with name and colorKey (R18.9)', async () => {
    const dir = new MockTagDirectory({ store: storeWith([me]), userId: 'me' })
    expect(await dir.listMine()).toEqual({
      ok: true,
      value: [{ id: 't1', name: 'Work', colorKey: 'blue' }],
    })
  })

  it('rejects empty and case-insensitive duplicate names', async () => {
    const dir = new MockTagDirectory({ store: storeWith([me]), userId: 'me' })
    const empty = await dir.create({ name: '  ', colorKey: 'orange' })
    const dup = await dir.create({ name: ' work ', colorKey: 'orange' })
    expect(!empty.ok && empty.error).toMatchObject({ issues: [{ code: 'TAG_NAME_REQUIRED' }] })
    expect(!dup.ok && dup.error).toMatchObject({ issues: [{ code: 'TAG_NAME_TAKEN' }] })
  })

  it('creates, renames, recolors and removes; remove is idempotent', async () => {
    const dir = new MockTagDirectory({ store: storeWith([me]), userId: 'me' })
    const created = await dir.create({ name: 'Gym', colorKey: 'orange' })
    if (!created.ok) throw new Error('expected ok')
    const updated = await dir.update(created.value.id, { name: 'Fitness', colorKey: 'yellow' })
    expect(updated.ok && updated.value).toMatchObject({ name: 'Fitness', colorKey: 'yellow' })
    expect((await dir.remove(created.value.id)).ok).toBe(true)
    expect((await dir.remove(created.value.id)).ok).toBe(true)
    const list = await dir.listMine()
    expect(list.ok && list.value.map((t) => t.name)).toEqual(['Work'])
  })

  it('returns NOT_FOUND when updating a missing tag', async () => {
    const dir = new MockTagDirectory({ store: storeWith([me]), userId: 'me' })
    expect(await dir.update('nope', { name: 'X' })).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND' },
    })
  })
})
