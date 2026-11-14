import { AppHeader } from '@/features/timetable/components/shared/AppHeader'

/** Page frame. Add Event and Settings are wired in later tasks (editor, settings sheet). */
export default function App() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AppHeader
        onAddEvent={() => {
          /* wired by the event editor task */
        }}
        onOpenSettings={() => {
          /* wired by the settings task */
        }}
      />
      <main>
        <h1 className="sr-only">Personal Weekly Timetable</h1>
      </main>
    </div>
  )
}
