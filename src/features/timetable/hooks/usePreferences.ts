import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  resolveEffectivePreferences,
  type EffectivePreferences,
} from '@/domain/preferences/effective'
import type { PreferencesRow } from '../data/types'
import { useRepository } from '../data/use-repository'

export const PREFERENCES_QUERY_KEY = ['timetable', 'preferences'] as const

/** Browser-detected timezone, read at render time. Never written back (R14.18). */
export function detectBrowserZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

export interface UsePreferencesResult {
  /** Always defined: defaults apply while loading or when the load fails (R13.14). */
  preferences: EffectivePreferences
  isLoading: boolean
  /** A failed load is an error state. Defaults are never saved over stored values (R13.16). */
  loadFailed: boolean
  /** True when the saved timezone is no longer recognized, so the UI can tell the user (R14.19). */
  savedTimeZoneUnrecognized: boolean
  /** Sends only the changed fields. Rolls back to the last saved value on failure (R13.15). */
  update(patch: Partial<PreferencesRow>): Promise<boolean>
  reset(): Promise<boolean>
  saving: boolean
  saveFailed: boolean
}

/** The only way components read preferences (design 7.3). */
export function usePreferences(
  browserZone: string | undefined = detectBrowserZone(),
): UsePreferencesResult {
  const repository = useRepository()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: async (): Promise<PreferencesRow> => {
      const result = await repository.getPreferences()
      if (!result.ok) throw new Error(result.error.code)
      return result.value
    },
  })

  const write = useMutation({
    mutationFn: async (patch: Partial<PreferencesRow> | 'reset'): Promise<PreferencesRow> => {
      const result =
        patch === 'reset'
          ? await repository.resetPreferences()
          : await repository.patchPreferences(patch)
      if (!result.ok) throw new Error(result.error.code)
      return result.value
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PREFERENCES_QUERY_KEY })
      const previous = queryClient.getQueryData<PreferencesRow>(PREFERENCES_QUERY_KEY)
      if (previous) {
        const next: PreferencesRow =
          patch === 'reset'
            ? {
                timeZone: null,
                timeFormat: null,
                intervalMinutes: null,
                wakeUpTime: null,
                bedtime: null,
              }
            : { ...previous, ...patch }
        queryClient.setQueryData(PREFERENCES_QUERY_KEY, next)
      }
      return { previous }
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(PREFERENCES_QUERY_KEY, context.previous)
    },
    onSuccess: (row) => queryClient.setQueryData(PREFERENCES_QUERY_KEY, row),
  })

  const preferences = useMemo(
    () => resolveEffectivePreferences(query.data ?? null, browserZone),
    [query.data, browserZone],
  )

  return {
    preferences,
    isLoading: query.isPending,
    loadFailed: query.isError,
    savedTimeZoneUnrecognized: preferences.savedTimeZoneUnrecognized,
    update: (patch) =>
      write.mutateAsync(patch).then(
        () => true,
        () => false,
      ),
    reset: () =>
      write.mutateAsync('reset').then(
        () => true,
        () => false,
      ),
    saving: write.isPending,
    saveFailed: write.isError,
  }
}
