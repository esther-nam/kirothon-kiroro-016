import { useContext } from 'react'
import type { TimetableRepository } from './repository'
import { RepositoryContext } from './repository-context'

/** The only way a component obtains a repository (R18.1). */
export function useRepository(): TimetableRepository {
  const repository = useContext(RepositoryContext)
  if (repository === null) {
    throw new Error('useRepository must be used inside a <RepositoryProvider>.')
  }
  return repository
}
