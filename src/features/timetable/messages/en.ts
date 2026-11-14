// English message catalogue (R20.1). Dates and times are never built here;
// they come from src/domain/format (R20.2).

export const en = {
  calendar: {
    today: 'Today',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    weekHeaderLabel: 'Week',
  },
  event: {
    untitled: 'Untitled event',
    untagged: 'No tag',
    teamLabel: 'Team',
  },
  dialog: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
  },
  settings: {
    timeFormat: 'Time format',
    format12h: '12-hour',
    format24h: '24-hour',
  },
} as const;

export type Messages = typeof en;
