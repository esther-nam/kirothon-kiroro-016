import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepositoryProvider } from '@/features/timetable/data/RepositoryProvider'
import type { TimetableRepository } from '@/features/timetable/data/repository'
import { MockRepository } from '@/features/timetable/data/mock/mock-repository'

interface AppProvidersProps {
  /** Defaults to a seeded `MockRepository` (development and tests, R18.1). */
  repository?: TimetableRepository
  children: ReactNode
}

export function AppProviders({ repository, children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [defaultRepository] = useState<TimetableRepository>(() => new MockRepository())
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repository={repository ?? defaultRepository}>
        {children}
      </RepositoryProvider>
    </QueryClientProvider>
  )
}
