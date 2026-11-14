import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { FEATURE_FLAGS } from '../flags'
import type { FriendDirectory, TagDirectory } from './directories'
import { RepositoryProvider } from './RepositoryProvider'
import type { TimetableRepository } from './repository'
import { ERROR_CODES } from './types'
import type {
  ChangePreview,
  EventBundle,
  EventInput,
  PreferencesRow,
  Result,
  UpdateRequest,
} from './types'
import { useRepository } from './use-repository'

function stubRepository(): TimetableRepository {
  const fail = vi.fn(() => Promise.resolve({ ok: false, error: { code: 'UNAVAILABLE' } } as const))
  return {
    getEventsInRange: fail,
    getEvent: fail,
    createEvent: fail,
    updateEvent: fail,
    previewUpdate: fail,
    deleteEvent: fail,
    setMyTag: fail,
    respondToInvitation: fail,
    listPendingInvitations: fail,
    getPreferences: fail,
    patchPreferences: fail,
    resetPreferences: fail,
  }
}

describe('useRepository', () => {
  it('[R18.1] throws a clear error outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => useRepository())).toThrow(/inside a <RepositoryProvider>/)
    spy.mockRestore()
  })

  it('[R18.1] returns the provided repository inside the provider', () => {
    const repository = stubRepository()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RepositoryProvider repository={repository}>{children}</RepositoryProvider>
    )
    const { result } = renderHook(() => useRepository(), { wrapper })
    expect(result.current).toBe(repository)
  })
})

describe('contract types', () => {
  it('[R18.1] exposes the six error codes of design 5.1', () => {
    expect([...ERROR_CODES]).toEqual([
      'VALIDATION',
      'FORBIDDEN',
      'NOT_FOUND',
      'STALE_VERSION',
      'LIMIT_EXCEEDED',
      'UNAVAILABLE',
    ])
  })

  it('[R18.1] types compile with the shapes of design 5.1', () => {
    expectTypeOf<Result<number>>().toEqualTypeOf<
      { ok: true; value: number } | { ok: false; error: import('./types').RepositoryError }
    >()
    expectTypeOf<UpdateRequest['scope']>().toEqualTypeOf<
      'event' | 'occurrence' | 'following' | 'series'
    >()
    expectTypeOf<ChangePreview>().toHaveProperty('completedAffected').toBeNumber()
    expectTypeOf<EventBundle>().toHaveProperty('myTagId')
    expectTypeOf<EventInput>().toHaveProperty('participantIds').toEqualTypeOf<string[]>()
    expectTypeOf<PreferencesRow>().toHaveProperty('timeZone').toEqualTypeOf<string | null>()
    expectTypeOf<TimetableRepository['deleteEvent']>().returns.toEqualTypeOf<
      Promise<Result<void>>
    >()
    expectTypeOf<FriendDirectory['search']>().parameters.toEqualTypeOf<[string]>()
    expectTypeOf<TagDirectory['remove']>().returns.toEqualTypeOf<Promise<Result<void>>>()
  })
})

describe('feature flags', () => {
  it('[R18.1] recurrence and participants default to off', () => {
    expect(FEATURE_FLAGS).toEqual({ recurrence: false, participants: false })
  })
})
