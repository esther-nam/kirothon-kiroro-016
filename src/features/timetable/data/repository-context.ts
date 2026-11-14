import { createContext } from 'react'
import type { TimetableRepository } from './repository'

export const RepositoryContext = createContext<TimetableRepository | null>(null)
