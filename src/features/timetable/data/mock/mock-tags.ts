import { TAG_COLOR_KEYS } from '@/features/tags/palette'
import type { TagDirectory } from '../directories'
import type { Result, Tag, TagColorKey, ValidationIssue } from '../types'
import type { MockStore } from './mock-store'
import { applySimulation, createSimulation, type Simulation } from './simulate'

export interface MockTagDirectoryOptions {
  store: MockStore
  userId: string
  simulation?: Simulation
}

const invalid = <T>(...issues: ValidationIssue[]): Result<T> => ({
  ok: false,
  error: { code: 'VALIDATION', issues },
})

const isColorKey = (value: string): value is TagColorKey =>
  (TAG_COLOR_KEYS as readonly string[]).includes(value)

/**
 * Mock of Tag Management (R22, R18.9). Tags are private to the signed-in user (R22.8).
 * Names are trimmed, non-empty and unique ignoring case (R22.3). Deleting removes the tag
 * and its assignments only (R22.6). Repeated requests give the same result (R22.11).
 */
export class MockTagDirectory implements TagDirectory {
  private readonly store: MockStore
  private readonly userId: string
  private readonly simulation: Simulation
  private nextId = 1

  constructor(options: MockTagDirectoryOptions) {
    this.store = options.store
    this.userId = options.userId
    this.simulation = options.simulation ?? createSimulation()
  }

  async listMine(): Promise<Result<Tag[]>> {
    const failure = await applySimulation(this.simulation, 'read')
    if (failure) return { ok: false, error: failure }
    return { ok: true, value: this.store.tagsOf(this.userId) }
  }

  async create(input: { name: string; colorKey: TagColorKey }): Promise<Result<Tag>> {
    const failure = await applySimulation(this.simulation, 'write')
    if (failure) return { ok: false, error: failure }
    const issues = this.validate(input.name, input.colorKey, null)
    if (issues.length > 0) return invalid(...issues)
    const tag: Tag = {
      id: `tag-${this.userId}-new-${this.nextId++}`,
      name: input.name.trim(),
      colorKey: input.colorKey,
    }
    this.store.addTag(this.userId, tag)
    return { ok: true, value: { ...tag } }
  }

  async update(id: string, patch: { name?: string; colorKey?: TagColorKey }): Promise<Result<Tag>> {
    const failure = await applySimulation(this.simulation, 'write')
    if (failure) return { ok: false, error: failure }
    const current = this.store.tagsOf(this.userId).find((t) => t.id === id)
    if (!current) return { ok: false, error: { code: 'NOT_FOUND' } }
    const issues: ValidationIssue[] = []
    if (patch.name !== undefined) {
      issues.push(...this.validate(patch.name, current.colorKey, id).filter(nameIssue))
    }
    if (patch.colorKey !== undefined) {
      issues.push(...this.validate('x', patch.colorKey, id).filter(colorIssue))
    }
    if (issues.length > 0) return invalid(...issues)
    const next: Tag = {
      id,
      name: patch.name !== undefined ? patch.name.trim() : current.name,
      colorKey: patch.colorKey ?? current.colorKey,
    }
    this.store.replaceTag(this.userId, next)
    return { ok: true, value: { ...next } }
  }

  async remove(id: string): Promise<Result<void>> {
    const failure = await applySimulation(this.simulation, 'write')
    if (failure) return { ok: false, error: failure }
    // Removing a tag that is already gone succeeds (R22.11).
    this.store.removeTag(this.userId, id)
    return { ok: true, value: undefined }
  }

  private validate(name: string, colorKey: string, ignoreId: string | null): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      issues.push({ code: 'TAG_NAME_REQUIRED', path: 'name' })
    } else {
      const key = trimmed.toLocaleLowerCase()
      const taken = this.store
        .tagsOf(this.userId)
        .some((t) => t.id !== ignoreId && t.name.toLocaleLowerCase() === key)
      if (taken) issues.push({ code: 'TAG_NAME_TAKEN', path: 'name' })
    }
    if (!isColorKey(colorKey)) issues.push({ code: 'TAG_COLOR_INVALID', path: 'colorKey' })
    return issues
  }
}

const nameIssue = (i: ValidationIssue): boolean => i.path === 'name'
const colorIssue = (i: ValidationIssue): boolean => i.path === 'colorKey'
