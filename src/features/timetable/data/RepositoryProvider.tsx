import type { ReactNode } from 'react'
import type { TimetableRepository } from './repository'
import { RepositoryContext } from './repository-context'

interface RepositoryProviderProps {
  repository: TimetableRepository
  children: ReactNode
}

export function RepositoryProvider({ repository, children }: RepositoryProviderProps) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>
}
