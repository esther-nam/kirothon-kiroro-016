import { WeeklyCalendar } from '@/features/timetable/components/calendar/WeeklyCalendar'
import { AppHeader } from '@/features/timetable/components/shared/AppHeader'

/** Page frame. Add Event and Settings are wired in later tasks (editor, settings sheet). */
export default function App() {
  return (
    <div className="flex h-screen flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AppHeader
        onAddEvent={() => {
          /* wired by the event editor task */
        }}
        onOpenSettings={() => {
          /* wired by the settings task */
        }}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Personal Weekly Timetable</h1>
        <WeeklyCalendar />
      </main>
    </div>
  )
}
