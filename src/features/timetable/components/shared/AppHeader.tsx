import type { ReactNode } from 'react'
import { Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppHeaderProps {
  onAddEvent: () => void
  onOpenSettings: () => void
  /** Slot for the future user menu or avatar (Authentication spec). */
  userMenu?: ReactNode
}

/** Top navigation (Figma `App header` 7:724; 72 px high, wordmark, Add Event, settings). */
export function AppHeader({ onAddEvent, onOpenSettings, userMenu }: AppHeaderProps) {
  return (
    <header className="flex h-nav items-center justify-between border-b border-[var(--divider)] bg-[var(--surface-page)] px-4 lg:px-8">
      <span className="text-lg font-semibold text-[var(--text-primary)]" aria-hidden="true">
        Coor:d
      </span>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={onAddEvent} aria-label="Add event">
          <Plus aria-hidden="true" />
          <span className="hidden sm:inline">Add Event</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={onOpenSettings}
          aria-label="Settings"
        >
          <Settings aria-hidden="true" />
        </Button>
        <div data-slot="user-menu">{userMenu}</div>
      </div>
    </header>
  )
}
