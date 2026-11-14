# Figma Audit: Personal Weekly Timetable (task 1.4)

## 0. Status and method

**Revision v3 (task 1.4 closed out, pending your final check).** All decisions in section 7 are resolved by the user. Approved constants are in section 9 and the decision log is in section 10. `requirements.md` v5 and `design.md` v2 are updated. Earlier sections keep the audit as found, including the original 5-minute, 6-member and Calendar-dropdown findings, annotated where a decision resolved them. `tasks.md` and steering files are not edited.

Figma file `coord`, fileKey `NHvCejxPBnlcIIgXh4sJYn`, page node `0:1`. The whole page was read with `get_figma_data` (about 870k characters) and searched offline. Nothing was exported as an image, so no visual check of rendering was done; everything below comes from node data (layout, fills, strokes, text styles, component properties, text content).

Legend:
- **Figma**: value read directly from Figma.
- **Derived**: computed from Figma values (arithmetic, contrast).
- **Not in Figma / Proposal**: Figma does not define it. The proposed value is mine and needs your decision. No proposal is a design fact.

No document was changed except this file. `requirements.md` and `design.md` are untouched. The Figma API key is not copied here. It still sits in plaintext in `.kiro/settings/mcp.json` and should be rotated (design 9.6).

### 0.2 Revision v2 (palette and design-system components)

Triggered by your note that the primary colors are highlight colors for tags and shared-calendar member colors, and that the file has reusable design components. I re-read the page structure (single page `0:1`, 28 top-level frames), the palette frame `2:2`, Foundations `7:344`, Global components `7:352`, Calendar components `7:361`, Add Event reusable components `13:749` and Mobile extensions `20:3265`. Corrections are marked **[Corrected v2]**, additions **[New v2]**. A summary is in section 8.

Result of the re-check: the palette frame and the component sets were already in the file map and the earlier audit did record the five primaries. It missed several components (Tooltip, Popover / Actions, Popover / Select options, Overlap lanes, compact and narrow mobile blocks, Avatar, Loading indicator, pickers, `Show team` property) and did not apply your intended use of the colors. There is no other page and no frame outside those listed in 0.1.

### 0.1 Frames found on the page

| Node | Frame | Size | Notes |
|---|---|---|---|
| `2:2` | Primary colors, Light palette | 1120 wide | Brand palette: 5 families, each a Primary plus 5 tints (see section 4) |
| `6:2` | Personal Weekly Timetable, Desktop | 1440 x 900 | Source desktop screen |
| `7:344` | 01 Foundations | 1440 wide | Color, type, spacing, radius, icons |
| `7:352` | 02 Global components | 1440 wide | Buttons, fields, pickers, dialogs, toggles, toast |
| `7:361` | 03 Calendar components | 1440 wide | Header, day header, gutter, slot, event block, compact event, weekly grid, selection overlay, view states |
| `13:749` | Add Event, Reusable components | 3600 wide | Form parts and `EventEditorModal` set (560 x 960 per state) |
| `13:3047` to `13:3795` | A One-time, B Recurring, C Shared, D Validation error, E Multiple time slots, F Loading/saving | Add Event modal screens | |
| `13:5523` | Unsaved changes, Confirmation overlay | | Discard dialog |
| `20:3251` | Personal Weekly Timetable, Mobile | 390 x 844 | |
| `20:3257` | Add Event, Mobile Page | 390 x 844 | Full page, not a sheet |
| `20:3261` | Edit Event, Mobile Page | 390 x 844 | |
| `20:3265` | Mobile, Shared component extensions | 1340 wide | Mobile fields, `EventBlock Mobile`, dialogs |
| `20:4379`, `20:4610`, `20:4859` | Add Event Repeat On, Edit Event Recurring series, Add Event Multiple dates | 390 x 844 | |
| `20:5038`, `20:5076`, `20:5124`, `20:5182` | Unsaved changes, Delete Event, Recurrence scope Save, Recurrence scope Delete | 350 wide dialogs | |
| `20:5257` | Select date, Mobile | | Year / month / day pickers |
| `20:5411`, `20:6030`, `20:6655` | Timetable Previous week, Next week, Time-range selection | 390 x 844 | |

**Missing frames (important):**
- There is **no Timetable Settings screen** and **no desktop Edit Event modal** in the file. Settings exist only as a gear icon button (`6:29`, "Calendar settings") and a "Timetable settings" menu row inside a popover sample (`7:1202`). The desktop `EventEditorModal` has only create states (One-time, Recurring, Shared, Validation, Multiple slots, Saving, Empty form, Tag open, Participant results, No friends, One participant, Created, Single slot). Edit exists only on mobile (`20:3261`, `20:4610`) with "Edit Event", "Save Changes", "Delete Event".
- The brief says five screens (requirements 2.1). Two of them (desktop Edit modal and Timetable Settings) are not designed.

## 1. Frame to React component map (design 7.2)

| Figma frame or component (node) | React component | Requirements | Result |
|---|---|---|---|
| Top navigation `6:3` (72 high, wordmark "Coor:d", Add Event button, avatar). Component `App header` `7:724`, mobile `App header Mobile` | `AppHeader` | R6.14 | **Exists.** Design's `[unverified]` flag can be cleared. Contains an Add Event button, which satisfies R6.14 |
| Calendar controls `6:4` and `Calendar / Header` set `7:1386` (Device=Desktop 1296x120, Device=Mobile 375x156) | `CalendarHeader` | R1.3, R2 | Exists. Format differs from R1.3 (see section 5) |
| `Calendar / Week navigation` `7:1319`, `Calendar / Today` set `7:1318` (Default, Hover, Focus, Disabled) | part of `CalendarHeader` | R2.4 | Exists. **Disabled** state exists, matching "Today inactive" (R2.4) |
| Weekday header `6:5`, `Calendar / Day header` set `7:1409` (Default, Today, Hover, Selected, Disabled) | `DayHeader` | R1.8 | Exists. Weekday label plus date badge. Today = `#F7F7F7` column and black filled date badge |
| Time gutter `Calendar / Time gutter` set `7:1468` (24h/12h x 08-22/09-18) | `TimeGutter` | R1.1, R3.9 | Exists. On mobile the axis is pinned (`Time labels, pinned horizontal axis` `20:8286`) |
| `Calendar / Time slot` set `7:1484` (Interval 15/30/60 x Default, Hover, Selected, Disabled) | `TimeSlot` | D-10 | Exists. 5-minute interval is **not** designed |
| Grid lines and day columns in `08:00-22:00 timetable` `6:73`; `Calendar / Weekly grid` set `7:2315` (6 presets) | `DayColumn` | R3, R6 | Exists |
| `Calendar / Event block` set `7:1595` (Tag Work/Personal/Focus x Default, Hover, Focus, Selected, Disabled, Error) | `EventBlock` | R5.1 to R5.9 | Exists. See sections 2 and 5. **[Corrected v2]** the Tag axis (Work, Personal, Focus) is a sample of three palette colors; real tag colors come from the palette (4.3) |
| `Calendar / Compact event` set `7:2496` (15 min marker, 30 min title; Default, Focus) | `EventBlock` (density tiers) | R5.9, R5.12 | Exists |
| `EventBlock Mobile` `20:4244` (132x80) and `EventBlock Mobile narrow` `20:7176` (64 wide) | `EventBlock` | R4.6 | Exists. **[New v2]** `Calendar / Overlap lanes . Mobile` `20:7175` also exists: two 64 px blocks side by side. See 1.1 |
| `Calendar / Selection overlay` set `7:1607` (Valid "New event", Conflict "Time unavailable") | `TimeRangeSelection` | R6.4, R15.5 | Exists. Conflict state is explicit |
| `Calendar / View state` set `7:2358` (Empty, Loading, Error with "Try again") | grid empty/loading/error body | R15 | Exists |
| none | `OverflowIndicator` (`+N more` and list) | R4.6, R4.7 | **MISSING** (2.2 #7). Only a narrow-block variant exists, no `+N more` |
| none | `OutsideHoursIndicator` | R3.12 | **MISSING** (2.2 #8) |
| `EventEditorModal` set `13:3046`, 560 x 960: fixed header, scrollable body, fixed footer. Mobile: full pages | `EventEditorModal` (create, edit, readonly) | R7, R10 | Create exists on desktop. Edit exists on mobile only. **Read-only mode MISSING** (2.2 #10) |
| `EventTitleInput` `13:824` (Default, Empty, Error, Disabled; 100 characters hint) | field inside `EventEditorModal` | R7.2 to R7.4 | Exists |
| `EventTagSelector` `13:881` (No tag, Selected, Open, Disabled, Personal, Focus). Hint "Only you can see this tag, even when the event is shared." | tag selector | R7.1, R9 | **Exists** (2.2 #2 resolved). Options: No tag, Work, Personal, Focus |
| `Field / Timezone selector` `7:924`, timezone picker popover (search, IANA names with GMT offsets, "Timezone offsets shown for November 2026") | event timezone selector | R7.1, R14 | **Exists** (2.2 #1 resolved). Shows `Europe/London`, hint "GMT+00 local time" |
| `EventTimeSlotInput` set `13:1132` (Mode Date/Weekday x Default, Invalid, Overlap, Disabled, End of day) and mobile version `20:3423`; "Remove time slot" button; "+ Add time slot"; "n/20 slots" | `EventTimeSlotInput` | R7.5 to R7.12, R8 | Exists. 24:00 end, overlap and invalid states designed |
| `RepeatEventToggle` `13:1160`, `RecurrenceDateRange` `13:1235` (Default, Error, Disabled) | `RecurrenceSettings` | R8 | Exists. Hint "Both dates required, Default 3 months, Maximum 2 years" |
| `ParticipantSearch` `13:1322` (Default, Results, Empty "No friends found", Limit, Disabled), `ParticipantChip` `13:1259` (Invited, Creator, Disabled), counter "3/6 including you, Up to 5 invitations" | `ParticipantSelector` | R9 | Exists. Chip states are only **Invited, Creator, Disabled**: no accepted or declined (2.2 #11 partly MISSING) |
| `Delete Event Mobile` `20:5055`, text "Delete Event?", "permanently deleted. This cannot be undone." | delete confirmation | R12.1 | Exists (2.2 #5) |
| `Unsaved changes` `20:5017` / `13:5523`, "Discard changes?", Keep editing, Discard | discard confirmation | R10 | Exists (2.2 #5) |
| `Recurrence scope Save` `20:5093`, `Recurrence scope Delete` `20:5151`: This occurrence, This and following occurrences, Entire series, Cancel, Continue | scope chooser | R11.1, R12.2 | **Exists** (2.2 #3 resolved) |
| `Toast` `7:1277` ("Event saved", "Couldn't save event") | toast (sonner) | R15 | Exists. **No Undo action** (2.2 #6 MISSING) |
| `Dialog` `7:1190`, `Toggle` `7:1221`, `Segmented control` `7:1252` (24h / 12h) | shadcn Dialog, Switch, segmented control | R13 | Exist |
| Mobile layout `20:3251` | same component tree, responsive (design 8.1) | R16.2 | Exists. Behavior differs from the design's assumption (see 2.3) |
| Calendar footer `6:7` legend (Work, Personal, Focus dots; "08:00-22:00 . 15-minute intervals") | not in design 7.2 | none | **Not in requirements.** A tag legend and a settings summary line. **[Corrected v2]** Work, Personal, Focus are sample tags, so the legend must be generated from the user's own tags (or dropped). Needs a decision (section 5, #14) |

### 1.1 Complete reusable component inventory **[New v2]**

Variant counts and axes are read from the component sets. "Mapping" is the React component from design 7.2 (or the shadcn/ui primitive that renders it). "None" means no matching entry in design 7.2, so design 7.2 would need an entry or the part folds into another component.

**Global (frame `7:352`)**

| Figma component set or component (node) | Variants | Mapping | Notes |
|---|---|---|---|
| `Button / Primary` `7:641` | State: Default, Hover, Focus, Disabled | shadcn `Button` (default) | |
| `Button / Secondary` `7:663` | same 4 states | shadcn `Button` (outline) | |
| `Button / Icon` `7:681` | same 4 states | shadcn `Button` (icon) | 40 px |
| `Icon` `7:601` | 16 names: Plus, Previous, Next, Chevron, Close, Calendar, Clock, Globe, Settings, Check, Alert, Info, More, Link, Lock, Copy | lucide icons or inline SVG, 20 px, 1.6 px stroke | Info, More, Link, Copy have no designed use yet |
| `Avatar` `7:702` | Size 24, 34, 40 x State Default, Focus, Disabled | `Avatar` in `AppHeader`, `ParticipantChip` | No color variant (see 4.5) |
| `App header` `7:724` | Device: Desktop, Mobile | `AppHeader` | |
| `Field / Text input` `7:756` | Default, Hover, Focus, Disabled, Error | shadcn `Input` + `FormField` | |
| `Field / Dropdown select` `7:798` | same 5 | shadcn `Select` | |
| `Field / Date picker` `7:840` | same 5 | date field in `EventTimeSlotInput` | |
| `Field / Time picker` `7:882` | same 5 | time field in `EventTimeSlotInput` | |
| `Field / Timezone selector` `7:924` | same 5 | event timezone selector | |
| `Picker / Date`, `Picker / Time`, `Picker / Timezone` | single components | popover pickers | |
| `Select / Option` `7:2424` | Default, Hover, Focus, Selected, Disabled | shadcn `SelectItem` | |
| `Popover / Select options` | single (sample options "Work", "Shared") | shadcn `Select` content | |
| `Popover / Actions` | single ("Copy timetable link", "Manage sharing", "Timetable settings") | menu from the avatar or header | Shows where Settings is reached. Copy link and Manage sharing belong to team features |
| `Dialog` `7:1190` | Size Desktop, Mobile x State Default, Error | shadcn `Dialog`; discard, delete, scope dialogs | |
| `Modal / Desktop` | single, "scrim + dialog" composition | `EventEditorModal` shell | |
| `Toggle` `7:1221` | Value On, Off x Default, Hover, Focus, Disabled | shadcn `Switch` | |
| `Segmented control` `7:1252` | Value 24h, 12h x Default, Focus, Disabled | segmented control for 12/24 h | No Hover variant |
| `Toast` `7:1277` | Status: Success, Error | sonner toast | No Undo action |
| `Message / Error` | single, inline error text with alert icon | `FormValidationMessage` | |
| `Tooltip` | single | shadcn `Tooltip` | **Used for short events** (note `7:2377`): reveals full title and time of a 15 min block |

**Calendar (frame `7:361`)**

| Figma component set (node) | Variants | Mapping | Notes |
|---|---|---|---|
| `Calendar / Header` `7:1386` | Device: Desktop, Mobile | `CalendarHeader` | |
| `Calendar / Week navigation` `7:1319` | single | in `CalendarHeader` | Previous, Next buttons |
| `Calendar / Today` `7:1318` | Default, Hover, Focus, Disabled | Today button in `CalendarHeader` | Disabled = inactive today |
| `Calendar / Day header` `7:1409` | Default, Today, Hover, Selected, Disabled | `DayHeader` | |
| `Calendar / Time gutter` `7:1468` | Format 24h, 12h x Range 08-22, 09-18 | `TimeGutter` | |
| `Calendar / Time slot` `7:1484` | Interval 15, 30, 60 x Default, Hover, Selected, Disabled | `TimeSlot` | No 5 |
| `Calendar / Weekly grid` `7:2315` | Interval 15, 30, 60 x Range 08-22, 09-18 (6) | `DayColumn` set in grid | |
| `Calendar / Event block` `7:1595` | Tag Work, Personal, Focus x Default, Hover, Focus, Selected, Disabled, Error (18) | `EventBlock` | Tag axis is a sample; the real tag color comes from the palette (4.3) |
| `Calendar / Compact event` `7:2496` | Duration 15, 30 x Tag x Default, Focus (12) | `EventBlock` density tiers | |
| `Calendar / Selection overlay` `7:1607` | Valid, Conflict | `TimeRangeSelection` | Conflict text "Overlaps with Team workshop" |
| `Calendar / View state` `7:2358` | Empty, Loading, Error | grid state body | |

**Add Event (frame `13:749`)**

| Figma component set (node) | Variants | Mapping | Notes |
|---|---|---|---|
| `EventEditorModal` `13:3046` | 15 states: One-time, Recurring, Shared, Validation, Multiple slots, Saving, Empty form, Tag open, Participant results, No friends, One participant, Created, Single slot, Sam participant, Second participant results | `EventEditorModal` | Create only on desktop |
| `EventTitleInput` `13:824` | Default, Empty, Error, Disabled | title field | |
| `EventTagSelector` `13:881` | No tag, Selected, Open, Disabled, Personal, Focus | `TagSelector` | Select only; no create, no color picker |
| `EventTimeSlotInput` `13:1132` | Mode Date, Weekday x Default, Invalid, Overlap, Disabled, End of day | `EventTimeSlotInput` | Mobile twin `20:3423` (Mode Date, Weekday) |
| `RepeatEventToggle` `13:1160` | On, Off x Default, Disabled | `RecurrenceSettings` | |
| `RecurrenceDateRange` `13:1235` | Default, Error, Disabled | `RecurrenceSettings` | |
| `ParticipantSearch` `13:1322` | Default, Results, Empty, Limit, Disabled | `ParticipantSelector` | |
| `ParticipantChip` `13:1259` | Invited, Creator, Disabled | `ParticipantSelector` | No Accepted or Declined |
| `FormValidationMessage` | Required, Time range, Overlap, Recurrence, Limit | `FormValidationMessage` | Matches validation issue codes |
| `Loading indicator` | single | saving state | |

**Mobile extensions (frame `20:3265`)**

| Figma component (node) | Variants | Mapping | Notes |
|---|---|---|---|
| `Field / Text, Dropdown, Time . Mobile` | single each | mobile field variants | 44 px touch target |
| `MobileDatePicker` and `MobileDatePicker . Expanded` | Expanded: Standard, Month end, Leap year | date picker in slot input | Month-end and leap-year states are designed |
| `EventTimeSlotInput . Mobile` | Mode Date, Weekday | `EventTimeSlotInput` | |
| `EventBlock . Mobile` `20:4244` | single (132 x 80) | `EventBlock` | |
| `EventBlock . Mobile compact` | single | `EventBlock` density tier | **[New v2]** |
| `EventBlock . Mobile narrow` `20:8175` | single (64 wide), boolean property `Show team` (off in both samples) | `EventBlock` in overlap lanes | **[New v2]** has a Team text property |
| `Calendar / Overlap lanes . Mobile` `20:7175` | single (140 x 160): two narrow blocks side by side, offset in time | overlap layout (R4.6) | **[New v2]** the overlap layout is designed for 2 columns on mobile; no 3+ or `+N more` |
| `Calendar / Time gutter . Mobile` `20:8286` | single, pinned | `TimeGutter` mobile | |
| `Unsaved changes . Mobile`, `Delete Event . Mobile`, `Recurrence scope . Save`, `Recurrence scope . Delete` | single dialogs | confirmation and scope dialogs | |

## 2. Design constants `[F]`

### 2.1 Geometry

| Constant | Value | Source | Notes |
|---|---|---|---|
| Hour height, desktop | **64 px** | Figma (`7:540`, `7:1411`) | "One hour equals 64px, so placement stays independent of interval" |
| Hour height, mobile | **80 px** | Figma (`20:3826` name "80px per hour") | 15-minute row 20 px |
| `rowHeightPx[15]` desktop | **16** | Figma (`7:1472`) | |
| `rowHeightPx[30]` desktop | **32** | Figma (`7:1473`) | |
| `rowHeightPx[60]` desktop | **64** | Figma (`7:1474`) | Not used by requirements (60 is not a valid interval there) |
| `rowHeightPx[5]` | **Not in Figma** | | **Proposal:** `5.333` at 64 px/hour (`pxPerMinute` is fixed, so a 5-minute row is 5.33 px). Too small to hit; see R5.12 and the 44 px target rule. **Resolved (FC-4): one scale of 1 px per minute, so 5 min = 5 px internal only; 5 minutes is not a selectable interval** |
| `pxPerMinute` desktop | 64/60 = 1.0667 | Derived | Figma formula: top = 16 + minutes from visible start / 60 x 64; height = minutes / 60 x 64; "Do not round events to the grid interval". Matches design 207 (positions independent of interval) |
| `pxPerMinute` mobile | 80/60 = 1.333 | Derived | |
| Grid top offset | 16 px | Figma | First hour line at y=16; 08:00 label sits at y=9 |
| Desktop layout | Top nav 72, calendar controls 120, weekday header 64, scroll area 600, footer 44 (1440x900) | Figma | Gutter width 72, page padding 32. Day column about 186.29 px (1304/7) |
| Desktop block inset | 6 px each side (block x=78 in column starting at 72; width = column - 12) | Derived | |
| Mobile layout | 390 x 844. Pinned time axis 56 px. Scroll area 334 px. Seven columns of **140 px** (980 total). Weekday header 334x56 scrolls with the grid | Figma | Hint "Swipe to explore all 7 days" |
| Mobile block | 132 x 80 (column 140, inset 4), padding 8, gap 4 | Figma | |
| Mobile narrow block | **64 px wide**, padding 4, gap 4, title in 11 px "Day label" style | Figma (`20:7176`) | Two side by side (x=4 and x=72) in a 140 px column |
| `minBlockWidthPx` | **Not stated.** Smallest designed width is **64 px** | Derived | **Proposal:** 64 px. At desktop (about 174 px block) that gives 2 columns; at mobile (132 px) it gives 2. **Resolved: 64 px approved (FC-3)** |
| Min touch/click target | **44 px** on mobile; control height 40 px; icon 20 px, 1.6 px stroke | Figma (`7:540`, `7:1411`) | Matches R16.6. Figma says hit target is independent of slot geometry |
| `minTargetPx` for desktop blocks (R5.12) | **Not in Figma** | | **Proposal:** 24 px desktop, 44 px touch |

### 2.2 Density (R5.9)

Figma gives no height thresholds. It gives two rules and these designed sizes:

- Event block: padding 10 px, gap 5 px, title 13/18 (Event title style), time 11/15 (Caption). Resize the root vertically to match duration; "avoid shrinking text to fit short events" (`7:1596`).
- Compact event: a 15-minute event (16 px) is **a marker only** (tag dot); a 30-minute event (32 px) shows **title and dot on one row**; "reveal full title and time in the shared Tooltip or Popover" (`7:2459`). Padding 0 x 10, gap 7.

| Tier | Figma evidence | **Proposed threshold (proposal)** |
|---|---|---|
| `full` (title, time, team) | Block with details/"Show details" property. No team line designed | block height at least 20 + 18 + 5 + 15 + 5 + 15 = 78 px (derived: adds a third line) |
| `titleTime` | 64 px block (1 hour) shows title and time | at least 58 px (20 padding + 18 + 5 + 15), derived |
| `single` | 32 px compact event shows title and dot | at least 32 px |
| `minimal` | 16 px compact event shows dot only | below 32 px, with tooltip or popover |

These are derived proposals. They reproduce every height Figma shows (16, 32, 64, 96, 128). The 78 px `full` threshold depends on a team line that Figma does not design (section 5, #15).

### 2.3 Breakpoints and mobile behavior

| Constant | Figma value | Notes |
|---|---|---|
| `DESKTOP_MIN_WIDTH` | **Not specified.** Only two frame widths exist: 1440 (desktop) and 390 (mobile). The device property on `Calendar / Header` is only "Desktop" or "Mobile" | **Proposal:** 1024 px (Tailwind `lg`). **Resolved: 1024 px approved (FC-1).** 1024 is wide enough for 72 + 7 x about 130 px |
| `MOBILE_VISIBLE_DAYS` | **Not an integer in Figma.** 334 px viewport / 140 px column = **about 2.4 days**, all 7 reachable by horizontal swipe | **Resolved (FC-5, FD-7): fixed 140 px columns, about 2 to 3 visible, free horizontal scroll, no day-at-a-time.** Original proposal: express as column width (140 px) rather than a day count. Design says scroll-snap on `MOBILE_VISIBLE_DAYS` columns, so it needs a rewrite to "fixed 140 px columns, snap to day" |
| Contradiction **[Resolved FD-7: the frames win; no day-at-a-time]** | Figma note `7:2386` says "Use a day-at-a-time calendar viewport on mobile" but the mobile frames show a 7-column horizontal strip | See section 5, #16. The frames win (they are the visual spec). Approved FD-7 |
| Long-press delay (R6.11) | **Not specified in Figma** | **Proposal:** 400 ms. **Resolved: 400 ms approved (FC-2)** |
| Modals on mobile | Add/Edit are **full pages** (390 x 844), confirmations are 350 px dialogs | Design 8.1 says "full-height sheet"; a full page is close but is a route or full-screen dialog, not a bottom sheet |
| Modals on desktop | 560 px wide, 960 px tall, fixed header and footer, scrollable body, radius 12 | |
| Overflow list container | **Not designed** | Design says popover on desktop, sheet on mobile. Proposal only |
| Header separator | Figma shows three stacked texts: overline "PERSONAL TIMETABLE", heading "November 2026", small "Nov 9 - Nov 15, 2026" | No em-dash string. Differs from R1.3 (section 5, #10) |
| 12-hour end at midnight (R5.2) | **Not specified.** 12-hour gutter labels are "8 AM", "12 PM", "1 PM" (no minutes, no space-less form) | **Proposal:** `12:00 AM` as in R13.5 |

### 2.4 Block states (R5.7)

| State | Fill | Border | Distinguishable without color? |
|---|---|---|---|
| Default | `#FAFAFA` | 1 px `#DCDCDC`, radius 5 | baseline |
| Hover | `#F5F5F5` | 1 px `#DCDCDC` | **No.** Only a 4% lightness change. Weak |
| Focus | | 2 px `#171717` | Yes (border weight) |
| Selected | `#F5F5F5` | 2 px `#171717` | Same border as Focus. **Focus and Selected look identical** |
| Disabled | | 1 px `#DCDCDC`, reduced opacity | Yes |
| Error | `#FAFAFA` | 1 px `#171717`, 88 px high with message | Yes (message text, alert icon) |

R5.7 asks for Default, Hover, Selected. Figma adds Focus, Disabled, Error. Hover versus Default is nearly invisible and Focus equals Selected: needs a Figma fix or a design decision (section 5, #11). Selected overlapping block extent (R4.11), series marker (R5.16): **not designed**.

## 3. Tokens

All values are Figma. Block backgrounds are neutral (R5.4 holds): Figma states "Color is reserved for 5px event-tag indicators. Error, focus and selection stay grayscale." and "Never use tag colors as surfaces, text, borders or status colors."

### 3.1 Colors

| Token (Figma name) | Value | Use |
|---|---|---|
| `neutral/0` | `#FFFFFF` | page, surface/default, text/inverse |
| `neutral/25` | `#FAFAFA` | surface/subtle, event block default |
| `neutral/50` | `#F7F7F7` | surface/today (today column and day header) |
| `neutral/100` | `#F2F2F2` | 15-minute grid lines |
| `neutral/200` | `#E8E8E8` | dividers, column dividers, top border |
| `neutral/350` | `#DCDCDC` | border/default (blocks, buttons) |
| `neutral/500` | `#737373` | text/secondary, time text, day labels |
| `neutral/900` | `#171717` | text/primary, focus and error, selection, primary button |
| Hover surface (unnamed) | `#F5F5F5` | event block hover and selected, day header hover. **Not in the neutral ramp** |
| Hour grid line (unnamed) | `#E6E6E6` | hour lines. **Not in the neutral ramp** (close to `neutral/200` `#E8E8E8`) |
| Block title text (unnamed) | `#262626` | event title, body. **Not in the ramp** |
| Date-badge today | `#171717` fill, white text, radius 15 | |
| Unused stray fill | `#667085`, `#182230`, `#526071`, `#344054`, `#DEDEDE` | **[Corrected v2]** the first four are annotation colors on the palette sheet (`2:2`), not product colors. `#DEDEDE` is one stroke (Today button). Do not tokenize |
| Brand palette (5 families x 6 steps) | see section 4.1 | **[New v2]** highlight colors for tags and (per you) member colors. Not for surfaces or text |
| Busy pattern, outside-hours indicator, destructive | **Not in Figma** | Error and destructive are grayscale ("No red, green or tinted backgrounds"). Busy blocks are team scheduling, out of this feature |
| Focus ring | 2 px `#171717` | Figma ("Grayscale focus uses a 2px outline") |

### 3.2 Type scale (Inter)

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Display | 32 / 44 | 600 | doc headings only |
| Heading | 28 / 39 | 600 | week title ("November 2026") |
| Title | 20 / 28 | 600 | modal title |
| Subtitle | 16 / 22 | 600 | empty-state title |
| Body | 14 / 20 | 400 | fields |
| Button | 14 / 20 | 500 | buttons |
| Small | 13 / 18 | 400 | hints, date range |
| Label | 13 / 18 | 500 | field labels |
| Event title | 13 / 18 | 600 | block title |
| Caption | 11 / 15 | 400 | block time, errors, gutter labels |
| Day label | 11 / 15 | 500 | weekday name, narrow-block title |
| Overline | 10 / 14, letter-spacing 0.13em | 600 | "PERSONAL TIMETABLE", timezone offset |
| Wordmark | 23 / 32, letter-spacing -0.0348em | 600 | "Coor:d" |

Date number in the day header uses the Subtitle style in the component (`7:1396`). Gutter labels are Caption 11/15 in the component set; the desktop frame uses an unnamed local style for them that I did not read.

### 3.3 Spacing and radius

| Group | Values |
|---|---|
| Spacing scale | 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64 (Figma text; samples shown: 4, 8, 12, 16, 24, 32, 48, 64) |
| Block padding | desktop 10 (gap 5); mobile 8 (gap 4); mobile narrow 4 (gap 4); compact 0 x 10 (gap 7) |
| Header and layout | page padding 32; nav 72; controls 120; weekday header 64; gutter 72; footer 44 (left padding 104 aligns to grid) |
| Controls | height 40; mobile touch target at least 44; icon 20 (1.6 px stroke); icon button 40 |
| Radius | event 5, control 6, primary button 7, dialog 12, pill 999 (also today badge 15, card 8) |
| Modal | 560 wide, 960 high, radius 12 (internal padding not recorded) |
| Desktop event inset | 6 px |

Figma notes variables exist for font family, style, weight, size and line height (Figma text `7:492`), "Thirteen reusable text styles". Variable names for colors follow the pattern `neutral/<n>`, `tag/<name>`.

### 3.4 Contrast (feeds task 1.5)

Ratios computed against the block backgrounds (WCAG relative luminance):

| Pair | vs `#FAFAFA` | vs `#F5F5F5` (hover/selected) | Rule | Result |
|---|---|---|---|---|
| Text `#262626` | 14.5 | 13.9 | 4.5 | pass |
| Text `#171717` | 17.2 | 16.4 | 4.5 | pass |
| Secondary text `#737373` (time, hints) | 4.54 | **4.35** | 4.5 | **fails on hover and selected** (caption 11 px); passes on default and white (4.74) |
| Tag Work `#177EBC` | 4.24 | 4.06 | 3.0 | pass |
| Tag Personal `#8B0F4E` | 8.84 | 8.46 | 3.0 | pass |
| Tag Focus `#F59314` | **2.22** | **2.12** | 3.0 | **fails** (confirmed v2: it is the Orange primary) |
| Palette Yellow `#FFDE59` **[New v2]** | **1.27** | **1.22** | 3.0 | **fails**, worse than Orange |
| Palette Deep purple `#2C2557` **[New v2]** | 13.33 | 12.76 | 3.0 | pass |
| Secondary text `#737373` on today fill `#F7F7F7` **[New v2]** | | 4.43 on `#F7F7F7` | 4.5 | **fails** for 11 px day label and caption in the today column and header (4.74 on white) |

Full palette contrast, the text-on-fill table and the proposals are in section 4.2 and 4.3.

## 4. Color palette, tag palette and member colors **[Rewritten in v2]**

User input (not from Figma): the primary colors are highlight colors that differentiate components. Use them for **tags** and for the **shared team calendar (member colors)**. Figma itself only states the tag use. The member-color use is not drawn anywhere in the file (section 4.5).

### 4.1 Full palette (Figma, frame `2:2` "Primary colors . Light palette")

Five families, each with a Primary and five tints. Figma says tints are "mixed with white at the percentage shown" and "Check text contrast before pairing colors". Figma's own usage guide (`2:122`): Primary = brand accents, 20-40% = softer accents, 60-80% = supporting fills, 90% = subtle backgrounds.

| Family (Figma name) | Primary | Light 20% | Light 40% | Light 60% | Light 80% | Light 90% | Used in product frames |
|---|---|---|---|---|---|---|---|
| Blue | `#177EBC` | `#4598C9` | `#74B2D7` | `#A2CBE4` | `#D1E5F2` | `#E8F2F8` | `tag/work` |
| Deep purple | `#2C2557` | `#565179` | `#807C9A` | `#ABA8BC` | `#D5D3DD` | `#EAE9EE` | not used |
| Magenta | `#8B0F4E` | `#A23F71` | `#B96F95` | `#D19FB8` | `#E8CFDC` | `#F3E7ED` | `tag/personal` |
| Orange | `#F59314` | `#F7A943` | `#F9BE72` | `#FBD4A1` | `#FDE9D0` | `#FEF4E8` | `tag/focus` |
| Yellow | `#FFDE59` | `#FFE57A` | `#FFEB9B` | `#FFF2BD` | `#FFF8DE` | `#FFFCEE` | not used |

Notes:
- Node names read "Blue / Primary", "Blue / Light . 20%" and so on. The palette swatches are plain fills in the node data. The tool does not expose variable bindings, so I cannot confirm that named color variables exist for the palette. Only the labels `neutral/<n>` and `tag/work|personal|focus` are named in the file (Foundations `7:347`, `7:456`).
- The neutral ramp (section 3.1) is a separate system and stays for surfaces, borders and text. Figma rule (`7:391`, `7:466`): color is reserved for 5 px tag indicators; never use tag colors as surfaces, text, borders or status colors; do not use tag color as a permission signal (`7:2383`).
- Annotation colors in this frame (`#667085`, `#182230`, `#526071`, `#344054`, rgba `0.12` stroke) are labels on the palette sheet, not product tokens.
- **Re-inspection result:** the earlier audit did read this frame and the five primaries and tints were already recorded. What was missed was the intended use (now given by you) and the follow-on analysis below. The file has a single page (`0:1`), so there is no hidden palette or components page.

### 4.2 Contrast of the palette (WCAG 2.x relative luminance, **Derived**)

Backgrounds: `#FFFFFF` grid and page, `#FAFAFA` event block, `#F5F5F5` hovered or selected block, `#F7F7F7` today column. Rule for a tag dot or member indicator: 3:1 (non-text).

| Primary | vs `#FFFFFF` | vs `#FAFAFA` | vs `#F5F5F5` | vs `#F7F7F7` | 3:1 result |
|---|---|---|---|---|---|
| Blue `#177EBC` | 4.42 | 4.24 | 4.06 | 4.13 | pass |
| Deep purple `#2C2557` | 13.91 | 13.33 | 12.76 | 12.99 | pass |
| Magenta `#8B0F4E` | 9.23 | 8.84 | 8.46 | 8.61 | pass |
| Orange `#F59314` | 2.32 | 2.22 | 2.12 | 2.16 | **fail** |
| Yellow `#FFDE59` | 1.33 | 1.27 | 1.22 | 1.24 | **fail** |

Tints as indicator colors: Deep purple 20% and 40%, and Magenta 20% and 40%, pass 3:1 on all four backgrounds. Blue 20% (`#4598C9`) passes on white and `#FAFAFA` but fails on `#F5F5F5` (2.92) and `#F7F7F7` (2.98). Orange and Yellow tints are lighter than their primaries, so **no Orange or Yellow tint passes**. A lighter tint cannot fix them.

Text on a primary fill (for example initials in a member avatar, 13 px, not large text, 4.5:1):

| Primary | white text | `#171717` text | usable text color |
|---|---|---|---|
| Blue | 4.42 | 4.05 | **neither reaches 4.5** (white misses by 0.08) |
| Deep purple | 13.91 | 1.29 | white |
| Magenta | 9.23 | 1.94 | white |
| Orange | 2.32 | 7.74 | `#171717` |
| Yellow | 1.33 | 13.53 | `#171717` |

Distinguishing primaries from each other (non-text, 3:1 would be needed if color alone carried identity): Blue/Orange 1.91, Blue/Magenta 2.09, Deep purple/Magenta 1.51, Orange/Yellow 1.75, Blue/Deep purple 3.15. Several pairs are below 3:1 and the hue difference is the only cue for some people. So color cannot be the only identity cue (see 4.5).

### 4.3 Tag palette (`tags.color_key`) **[Revised in v2]**

**Proposal** (follows your statement that the primaries are for tags). The five primaries are the tag color choices. Keys are mine; Figma only names three sample tags.

| `color_key` (proposal) | Family | Hex (Figma) | Figma sample tag | Dot contrast vs `#FAFAFA` | 3:1 |
|---|---|---|---|---|---|
| `blue` | Blue | `#177EBC` | Work | 4.24 | pass |
| `deep_purple` | Deep purple | `#2C2557` | none | 13.33 | pass |
| `magenta` | Magenta | `#8B0F4E` | Personal | 8.84 | pass |
| `orange` | Orange | `#F59314` | Focus | 2.22 | **fail** |
| `yellow` | Yellow | `#FFDE59` | none | 1.27 | **fail** |

What changed against the earlier audit:
- **Corrected:** "Figma has three fixed tags" is now read as three **sample tags** that use three of five palette colors. The palette is the color choice set for user tags. Work, Personal and Focus are examples, not a built-in list. Figma still has **no UI to create, rename, recolor or delete a tag** (selector options are No tag, Work, Personal, Focus), and no color picker. That UI remains undesigned.
- **Not changed:** the "Focus orange fails contrast" finding stands. The palette confirms orange is an official primary, so the failure sits in the palette, not in one tag. **Yellow fails too, and worse (1.27:1).** Using the palette as is would put two of five tag colors below 3:1.
- Tints are not offered as tag colors (Figma uses them for fills and backgrounds, and none of the Orange or Yellow ones pass).
- The tag dot is the **only** per-block tag cue (blocks carry no tag name). The 3:1 rule therefore applies to the dot.

Options for Orange and Yellow (decision needed, all proposals):
1. **Outline ring (proposal A):** give every tag dot a 1 px `#171717` ring, so the dot edge is 17.2:1 against the block. Uniform for all colors, uses only Figma colors. Changes the 5 px dot to about 7 px overall, or a 5 px outer size with a 3 px fill. Needs a designer check.
2. **Darker Orange and Yellow for indicators (proposal B):** the designer adds darker shades to the palette. I do not invent hex values.
3. **Drop Orange and Yellow from the tag palette (proposal C):** leaves Blue, Deep purple, Magenta only.
4. Accessible name: whatever is chosen, expose the tag name as text (aria-label and tooltip). This helps but does not replace the 3:1 rule for the dot.

I recommend A as the default because it is implementable now with no new colors, and B as the visual improvement later.

### 4.4 Block and indicator specifics

- Dot size: 5 x 5 px in blocks and legend, 8 x 8 px in the modal selector (Figma).
- Tags are per user and private (selector hint "Only you can see this tag, even when the event is shared." and "Your personal tag: Work"). Matches tech.md: a participant never sees another user's tag color.
- "Personal" is still also a **Calendar** dropdown value (section 5.3, #9, #12).

### 4.5 Member colors for the shared team calendar **[New in v2, not designed in Figma]**

What Figma contains: `Avatar` (Size 24, 34, 40; State Default, Focus, Disabled) and `Calendar / Overlap lanes` (two narrow blocks side by side). The Foundations note (`7:2383`) says shared timetables reuse Event block, Avatar, Popover and Dialog, keep ownership and access labels explicit, and do not use tag color as a permission signal. **There is no shared-view frame, no member-color token, no member legend and no busy (gray) block.** Team scheduling is a separate feature, so nothing here blocks the personal timetable. The findings matter only for the palette decision:

- **Size:** teams have 2 to 6 members (tech.md). The palette has **5 primaries**. A sixth member needs a color. Options (proposals): a sixth family from the designer, or pairing the five colors with a fixed second cue (initials) and one neutral for the sixth. Needs a decision.
- **Contrast:** Orange and Yellow fail 3:1 as indicators (4.2). A member color used as a stripe, ring or avatar fill on white or gray busy blocks needs the same fix as tags, or must only be used behind `#171717` text.
- **Color is not enough:** several pairs are below 3:1 against each other (4.2). Steering requires member identity to carry initials or avatar, not only color. The `Avatar` component can carry that. The busy gray block also needs a pattern or label (steering).
- **No collision with tags:** tag colors appear only in the personal calendar and member colors only in the shared view (tech.md). Using the same palette for both is therefore safe, provided the two never appear on the same screen. A shared event drawn in the personal calendar uses the viewer's own tag color, not member colors.
- **Figma rule to relax:** "Color is reserved for 5px event-tag indicators" (`7:391`) does not allow member colors. If you want them, the Foundations rule needs an added case. This is a design-system edit, not a spec edit.
- **Assignment** (who gets which color, stable per team or per viewer) is a team-scheduling decision. Not decided here.

## 5. Discrepancies, missing states and open items for your review

Items are grouped by what you need to decide. "R" refers to `requirements.md`.

### 5.1 Resolved from the 2.2 list

| 2.2 item | Result |
|---|---|
| 1 Event timezone selector | **Found** (field, search popover, IANA names with offsets) |
| 2 Tag selector | **Found** (No tag, Work, Personal, Focus; private-tag hint) |
| 3 Recurring scope chooser, edit and delete | **Found** (mobile dialogs; desktop equivalent not drawn) |
| 5 Confirmation dialogs | Delete and discard **found**. **"Modifying past recurring occurrences" not found** |
| 12 Add Event control without dragging | **Found** (Add Event button in the header, mobile too) |
| 13 Validation, empty, loading, error | **Found** (form validation messages, saving state, empty/loading/error grid states, toast) |

### 5.2 Still missing in Figma (design before implementation)

| 2.2 item | Result |
|---|---|
| 4 Delete choice for a multi-date non-recurring event | Not found |
| 6 Undo after delete | Not found. Delete dialog says "cannot be undone"; toast has no action. **Conflicts with R12 undo** |
| 7 `+N more` indicator and list | Not found |
| 8 Outside visible hours indicator | Not found |
| 9 Reset to Defaults | Not found (no Settings screen at all) |
| 10 Read-only event view, Leave, viewer's own tag selector | Not found |
| 11 Participant status chips | Chip states only Invited, Creator, Disabled. No pending/accepted/declined. A text note says "Both invitations are pending. Participants will appear as confirmed only after accepting." and the created-state shows "Invitations sent". No "Pending" chip text (R9.28, R15.23) |
| Timetable Settings screen | Not found (desktop or mobile). Interval, 12h/24h, visible range and timezone controls exist as parts (segmented control, fields) but no screen |
| Desktop Edit Event modal | Not found. Edit exists on mobile only. Desktop edit presumably reuses the create modal with "Save Changes" and "Delete Event" |
| Modifying past recurring occurrences confirmation (R11) | Not found |
| Occurrence count preview when editing recurrence (R8.21, R11.11) | Not found |
| Series marker on block (R5.16) | Not found (optional per requirement) |
| Selected overlapping block extent (R4.11) | Not found |
| Midnight split segments (R5.15) | Not found (render-only; behavior is specified) |
| Block team-name line (R5.1) | **[Corrected v2]** Partly designed: `EventBlock . Mobile narrow` has a `Show team` boolean and a Team text property (off in samples). The desktop `Calendar / Event block` has no team line. Teams are another feature |

### 5.3 Conflicts between Figma and requirements or design

1. **Intervals:** Figma offers **15, 30, 60** minutes. R13.1/R13.3 say **5, 15, 30**. Figma has no 5-minute grid and no 60. R3.1 default 15 matches. Decision needed: add 5 to the design, or change R13.
2. **Visible range:** Figma presets are only **08-22 and 09-18**. R13.6 allows any whole-hour start and end (end up to 24:00). Figma's text says presets define structure; a custom range needs the same grid generated. Behavior is a superset of Figma. Confirm no UI constraint.
3. **Tags** **[Corrected v2: see 5.4 item 1]:** Figma has **three sample tags Work/Personal/Focus**. The product has user-owned named tags with a color per tag (tech.md). No create, rename, recolor or delete UI. Also the "Work" and "Focus" names are not user-defined.
4. **Participant limit:** Figma counter "n/6 including you, Up to 5 invitations". Consistent with team size 2 to 6.
5. **Slots:** Figma "n/20 slots", end can be 24:00, no overnight, overlap error "This time slot overlaps another slot". Matches R7.5, R7.9, R7.10, BR-7.
6. **Title:** Figma "Required, Up to 100 characters", counter "15/100". Matches R7.4.
7. **Repeat range:** Figma "Both dates required, Default 3 months, Maximum 2 years", "Repeat until must be within 2 years of Repeat from", leap-year note. Matches R8, BR-8.
8. **Time field:** Figma hint "15-minute intervals" under Start time in one sample and "Enter exact times to the minute" under the slot list in another. R3.6 and R7 want exact minutes. Figma is inconsistent; the "exact minutes" copy matches the requirements.
9. **Calendar field:** the Add Event form has a **"Calendar" dropdown** (value "Personal", hint "Choose where this event belongs"). **Not in requirements.** Teams or calendars are a later feature. Decision: remove from the first release, or keep a fixed "Personal".
10. **Week header format:** Figma shows "November 2026" and, on a separate line, "Nov 9 - Nov 15, 2026". R1.3 and design 3.10 want `<months and year> — <date range>` in one string (e.g. `November 2026 — Nov 9–15`). The Figma range repeats the month and year. Also Figma has an overline "PERSONAL TIMETABLE" that the design does not mention.
11. **Block states:** Hover is almost invisible and Focus equals Selected (section 2.4). R5.7 needs states distinguishable without color; Hover versus Default fails.
12. **Time range text:** Figma writes "09:00 – 10:00" (spaces around the en dash) in blocks; R5.2 says `12:20–13:15` (no spaces). 12-hour labels in the gutter are "8 AM" (no minutes); R13.5 shows "1:05 PM".
13. **Time zone label:** the weekday header shows "GMT+00" (offset only, no zone name) top-left of the day header; the mobile frames show "Europe/London . GMT+00". R14 needs the display timezone visible. Needs confirmation which one is the final.
14. **Calendar footer legend** (tag colors, "08:00-22:00 . 15-minute intervals") is not in requirements. Tags are per-user, so a fixed Work/Personal/Focus legend contradicts the private-tag model unless it is generated from the user's own tags.
15. **Team line in block** (R5.1) cannot be checked until team scheduling exists. The `full` density tier in design 3 depends on it.
16. **Mobile viewport:** Figma note says "day-at-a-time", frames show 7 columns of 140 px with horizontal swipe (about 2.4 days visible). The design's `MOBILE_VISIBLE_DAYS` assumes an integer count.
17. **Mobile modals:** full pages (390 x 844) in Figma; design 8.1 says "full-height sheet".
18. **Touch hit area:** Figma slot geometry is 20 px (80/4) on mobile. Figma says use a 44 px hit target independent of the row. Consistent with R5.12 and R16.6, but the empty-slot tap target in `20:3846` is 20 px high, not 44.
19. **Contrast** **[Corrected v2: see 5.4 item 2]:** Orange `#F59314` (tag Focus) fails 3:1 (2.22:1) and the palette Yellow `#FFDE59` fails worse (1.27:1). `#737373` fails 4.5:1 on the hover/selected fill (4.35) and on the today fill (4.43). Feeds task 1.5.
20. **Stray colors and unnamed neutrals** (`#F5F5F5`, `#E6E6E6`, `#262626`, `#DEDEDE`) are used in the design but are not named tokens. Decide whether to add them to the ramp.
21. **Tech stack text:** requirements 2.1 and some design text still mention FullCalendar while `tech.md` says custom grid. Not a Figma issue. Not edited.
22. **Scope dialogs and sample content** use sample data (Design critique, Alex Kim, Sam Rivera, "Studio 2", "Time conflict"). **[Corrected v2]** "Studio 2" is the value of a **Team** text property on `EventBlock . Mobile narrow`, shown through a `Show team` boolean that is off in both samples. It is not a location. "Time conflict" is still an unexplained third line. Event `notes` exist in the data model, `location` does not.

## 6. Requirements coverage

| Requirement | Covered by | Result |
|---|---|---|
| R5.4 monochrome blocks | sections 2.4, 3.1 | **Confirmed.** Blocks are neutral; only the 5 px tag dot is colored |
| R5.6 tag palette | section 4 | **[Corrected v2] Palette exists** (5 primaries, node `2:2`), intended for tags. Two of five (Orange, Yellow) fail 3:1 as a dot. No tag create or color-pick UI. Decision needed |
| R5.7 block states | section 2.4 | **Gap.** Hover barely differs from Default; Focus equals Selected |
| R5.9 density thresholds | section 2.2 | Figma gives sizes (16, 32, 64) and rules, no thresholds. Derived proposal given |
| R16.1 desktop breakpoint | section 2.3 | **Not specified.** Frames are 1440 and 390. Proposal 1024 |
| R16.2 mobile days visible | section 2.3 | **Not an integer.** 140 px columns, about 2.4 visible, all 7 by swipe |

## 7. Decisions (resolved v3)

Status of each open decision from the earlier review. All eight decisions below were approved by the user after reviewing v2. They are applied in `requirements.md` v5 and `design.md` v2. The decision log is in section 10, the approved constants in section 9.

| # | Decision (earlier question) | Status | Result |
|---|---|---|---|
| 1 | Orange and Yellow tag contrast (4.3 options A, B, C) | **Resolved (FD-1)** | Option A variant: 1 px `#171717` outline on Orange and Yellow indicators. Tag colors unchanged |
| 2 | Member colors, sixth color, extend the color rule (old items 9, 4.5) | **Resolved (FD-2)** | At most 5 people per event including the current user. The five primaries are the member colors. No sixth color. Small indicators only (avatar rings, small dots). Color rule extended to them |
| 3 | Tag UI: who designs create, rename, recolor, delete (old item 10, 4.3) | **Resolved (FD-3)** | Tag Management is designed in Figma before implementation. Reached from the Event Tag selector. Deleting a tag leaves events unchanged and only hides its indicator |
| 4 | Interval set, 5-minute option, 5-minute row height (old items 1, 11, part of 4) | **Resolved (FD-4)** | 15, 30, 60 minutes. Default 15. No 5-minute option. 1-minute event precision unchanged |
| 5 | Calendar dropdown in Add Event (old item 3, 5.3 #9) | **Resolved (FD-5)** | Removed for the MVP. Events belong to the creator's personal timetable |
| 6 | Breakpoint, long press, minimum block width (old item 4) | **Resolved (FD-6)** | 1024 px, 400 ms, 64 px. One time scale of 1 px per minute. Density thresholds kept as initial values. All pending visual QA |
| 7 | Mobile: 140 px columns or day-at-a-time (old item 5, 5.3 #16) | **Resolved (FD-7)** | Horizontally scrollable 140 px weekday columns. No day-at-a-time. Swipe never changes the week |
| 8 | Who designs the missing screens (old item 6) | **Resolved (FD-8)** | The user, with Figma AI, approved before implementation. See requirements 2.4 and design 7.5 |
| 9 | Fix block Hover and Focus/Selected states, `#737373` on `#F5F5F5` (4.35) and on `#F7F7F7` (4.43) (old item 7) | **Still open** | Not covered by the approved decisions. Needs a Figma fix or a decision (task 1.5 contrast work) |
| 10 | Update `requirements.md` section 2 and `design.md` (old item 8) | **Done** | Both updated in task 1.4 |
| 11 | `Segmented control` Hover variant (old item 11) | **Open, minor** | The 5-minute part is closed (no 5-minute option). The missing Hover variant remains a Figma polish item |

Open items that are not decisions: the minimum click target for tiny blocks (proposal 24 px desktop, 44 px touch) is not approved; Figma block Hover/Selected distinguishability; Figma participant counter "n/6" and the Calendar field must be edited in Figma.

## 8. Revision log v2: changes against the previous audit

### 8.1 Resolved or corrected

| Previous statement | v2 result |
|---|---|
| "Focus orange fails contrast" (tag Focus 2.22:1) | **Still fails.** Reason is now clear: Orange is a palette primary, so the palette is the source, not the Focus tag. Yellow also fails (1.27:1). Fix options A, B, C in 4.3 |
| "Figma has three fixed tags / footer legend" | **Corrected.** Three sample tags drawn with 3 of the 5 primaries. The palette is the user tag choice set. Fixed legend still conflicts with per-user tags |
| Palette "candidates" for a tag palette, not stated | **Resolved by your note:** primaries = tag colors and shared-calendar member colors (user-stated, not in Figma) |
| `color_key` from three keys | **Revised proposal:** `blue`, `deep_purple`, `magenta`, `orange`, `yellow` (4.3) |
| "Team line in block not designed" | **Partly designed**: `Show team` and Team property on `EventBlock . Mobile narrow` |
| "Studio 2" meaning undefined | It is the Team property value |
| Overlap layout not found | **Found:** `Calendar / Overlap lanes . Mobile` (2 lanes of 64 px). Still no 3+ lanes and no `+N more` |
| Short-event reveal | **Found:** shared `Tooltip` (and Popover) |
| Settings entry | `Popover / Actions` has "Timetable settings" row. The screen is still missing |
| Component list incomplete | Full inventory in 1.1 (every component set and component found in the file) |

### 8.2 Still not designed (unchanged)

Timetable Settings screen, desktop Edit modal, read-only event view, `+N more`, outside-hours indicator, Undo, Accepted and Declined chips, past-occurrence confirmation, tag create/rename/delete UI, 5-minute interval, member colors, busy gray block, shared view.

### 8.3 New findings

1. Palette contrast and the text-on-fill table (4.2): Blue fails 4.5:1 for both white and `#171717` text; Orange and Yellow need dark text.
2. `#737373` also fails 4.5:1 on the today fill `#F7F7F7` (4.43).
3. Six-member teams exceed the five primaries.
4. Figma rule "color only for 5 px tag dots" must be extended if member colors are wanted.
5. `Segmented control` has no Hover variant; `Avatar` has no color variant.

### 8.4 Not changed

`requirements.md`, `design.md`, `tasks.md` (task 1.4 stays open for your review). The Figma API key is not recorded here.

## 9. Approved `[F]` constants (initial values, pending visual QA against Figma)

Approved by the user in task 1.4. They are initial values and may be adjusted after visual QA. Each lives in one named constant in the design.

| ID | Constant | Approved value | Where used | Note |
|---|---|---|---|---|
| FC-1 | `DESKTOP_MIN_WIDTH` | 1024 px | R16.1, R16.2, design 8.1 | Figma frames are 1440 and 390 only |
| FC-2 | `LONG_PRESS_MS` | 400 ms | R6.11, design 8.2 | Not in Figma |
| FC-3 | `minBlockWidthPx` | 64 px | R4.6, design 3.8 | Smallest designed block width |
| FC-4 | `pxPerMinute` | 1 px per minute for every interval: 60 min = 60 px, 30 = 30 px, 15 = 15 px, 5 = 5 px (internal positioning only, not a selectable interval). Event position and height follow real duration | R3.15, design 3.6, D-15 | **Known deviation to QA:** Figma draws 64 px per hour on desktop (row heights 16, 32, 64) and 80 px per hour on mobile |
| FC-5 | Mobile column width | 140 px, Monday to Sunday, about 2 to 3 visible. Fixed time gutter on the left (Figma 56 px). Sticky day header on vertical scroll. Independent horizontal and vertical scroll. Swipe does not change the week | R16.9 to R16.14, design 8.1, D-16 | Matches Figma mobile frames |
| FC-6 | Density thresholds | full 78 px or more; titleTime 58 px or more; single 32 px or more; minimal below 32 px | R5.9, design 3.9 | Derived from Figma sizes at 64 px per hour. **At 1 px per minute a 30-minute block is 30 px and falls in `minimal`.** Check in QA whether `single` should start at 30 px |
| FC-7 | Tag indicator outline for Orange and Yellow | 1 px `#171717` | R5.6a, BR-20 | Dot size with outline (about 7 px overall or 5 px outer) is for the designer to confirm |
| FC-8 | Grid intervals | 15, 30, 60 minutes. Default 15 | R13.1, R13.3, R3.1 | Matches Figma `Calendar / Time slot` and `Weekly grid` sets |
| FC-9 | `MAX_EVENT_PEOPLE` | 5 including the creator (creator plus at most 4 invited) | R9.6, R9.7, BR-11, design D-17 | Figma counter reads "n/6, up to 5 invitations" and must change |

Not approved (still proposals): minimum click target for tiny blocks (24 px desktop, 44 px touch), the 12-hour midnight end label, the overflow list container, member-color assignment, treatment of Orange and Yellow member indicators (requirements A-19).

## 10. Decision log (task 1.4)

| ID | Decision | Applied in |
|---|---|---|
| FD-1 | Orange and Yellow tag indicators get a 1 px `#171717` outline. Tag colors unchanged | requirements R5.6a, BR-20, E81; design 7.2, 10.4 |
| FD-2 | Maximum 5 people per event including the current user. Existing five primaries are the member colors, no sixth. Member colors are small indicators in shared views only, the UI stays monochrome. The Figma color restriction (only the 5 px tag dot) is extended to these indicators | requirements R5.17, R9.6, R9.7, BR-11, BR-20, E14, E86, glossary; design D-17, 3.11 (`PARTICIPANT_LIMIT`), 4.3, 6.1, 9.4, 10.4 |
| FD-3 | Tag Management designed in Figma first: create, rename, change color, delete, view. MVP entry is the Event Tag selector. Deleting a tag leaves events unchanged and only hides its indicator (replaces "reassign or untag first") | requirements R7.19, R22, BR-21, E79, E80, S-14, 2.4 (P-2, P-3); design D-18, 4.3, 5.1, 7.2, 7.5, 9.2 |
| FD-4 | Intervals 15, 30, 60. Default 15. No 5-minute option. Event precision stays 1 minute | requirements R3.1, R13.1, R13.3, R19.5, BR-22, E84, E85; design 4.3, 10.3, 10.6 |
| FD-5 | No Calendar dropdown in Add Event for the MVP. Events belong to the creator's personal timetable. Shared events come from adding participants. Team scheduling is Team Management's | requirements R7.1, R7.27, BR-23, E87, 1.3 |
| FD-6 | Initial values: 1024 px, 400 ms, 64 px, 1 px per minute (Figma deviation recorded), density thresholds kept and labeled initial | section 9; requirements R3.15, R4.6, R5.9, R6.11, R16.1; design D-15, 3.6, 3.8, 3.9, 8.1, 8.2 |
| FD-7 | Mobile weekly layout: horizontally scrollable weekday columns about 140 px, fixed gutter, sticky header, independent scrolling, no day-at-a-time. Swipe does not change the week; week changes use explicit controls | requirements R16.2, R16.9 to R16.14, BR-24, E82, E83; design D-16, 8.1 |
| FD-8 | Missing screens (Timetable Settings, Tag Management, validation and confirmation dialogs, missing mobile states) are designed by the user with Figma AI and approved first. Approved components may proceed | requirements 2.4 (P-1 to P-13), `[P]` markers; design 7.5 |

Steering and `tasks.md` conflicts created by these decisions are reported to the user and not edited here: see requirements 2.3 (S-12 to S-15).
