# Product Overview

## Concept
A collaborative weekly scheduling web app. Each user keeps a personal Monday-to-Sunday timetable and shares *availability* (not details) with small teams to find times when everyone is free.

## Target users
- Small groups (study groups, project teams, friends, families) of 2 to 6 members.
- Each user may belong to multiple teams.

## Core capabilities (full vision)
1. Personal weekly timetable (Mon-Sun)
2. Customizable grid interval: 5, 15, or 30 minutes
3. Customizable 12/24-hour display and visible time range
4. Team creation and member invitations
5. Shared weekly availability view
6. Gray "busy" blocks whenever any visible member is unavailable
7. Per-member colors and multi-member filtering
8. Drag-to-select mutually free slots
9. Team-confirmed group events appear on every member's personal calendar (subject to the Team Scheduling spec; participant events need acceptance)
10. Display preferences are private to each user

## MVP scope (build first)
Auth, personal weekly timetable, team create/join, shared availability view with gray busy blocks, drag-select a free slot and confirm a group event that appears on every member's calendar.

Deferred until after MVP: member colors and filtering polish, 5-minute interval, per-week overrides, notifications, event editing/cancellation flows beyond the basics.

## Task principles
- Each calendar entry is an event with one or more time slots. The same event on several days is one event, so a user can see at a glance where their time goes.
- Event blocks are monochrome. Only the tag indicator is colored.
- Tags and their colors are per user, personal organization tools, and stay private. Participants see an event's title and time, never each other's tags.

## Timezone principles
- Each user picks their own display timezone (default: auto-detected from the browser).
- Changing timezone changes how times are shown, never when events actually happen.
- Teams may span timezones; availability is computed on absolute instants.

## Product principles
- Availability sharing is the product. Sharing is busy/free only. Block titles and notes are never visible to teammates.
- Minimal and fast: the grid must feel instant on interaction.
- Preferences (interval, 12/24h, visible range) change only how *the viewer* sees data, never the data.
- Correctness over features: no double bookings, no silent timezone shifts.

## Non-goals (for now)
- Integration with Google/Outlook calendars
- Teams larger than 6
- Recurring group events created through team scheduling (events with participants may recur)
- Native mobile apps
