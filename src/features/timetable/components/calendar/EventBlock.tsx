import { memo, useState } from 'react'
import { formatLocalDate } from '@/domain/format/time'
import type { TimeFormat } from '@/domain/format/time'
import type { DaySegment } from '@/domain/layout/day-split'
import { segmentGeometry } from '@/domain/layout/geometry'
import type { Density } from '@/domain/layout/density'
import type { PlacedBlock } from '@/domain/layout/overlap'
import { tagIndicatorClasses, type TagColorKey } from '@/features/tags/palette'
import { en } from '../../messages/en'

export type EventBlockState = 'default' | 'hover' | 'selected'

/** A day segment with the viewer's own display data. Tag and team are absent when not set (R5.3, R5.5). */
export interface EventBlockSegment extends DaySegment {
  title: string
  /** The viewer's own tag only (R5.6). */
  tag?: { name: string; colorKey: TagColorKey }
  /** Present only when the event has a team. Participants alone never create it (R5.3). */
  teamName?: string
}

export interface EventBlockProps {
  item: PlacedBlock<EventBlockSegment>
  state: EventBlockState
  density: Density
  /** Part of the memo key. Times arrive pre-formatted in `item.segment.label`. */
  timeFormat: TimeFormat
  locale: string
  pxPerMinute: number
  onSelect(key: string): void
}

const INSET_PX = 2

/** Accessible name: title, tag name, day, times, team (R21.3, R21.4). `label` is already in the display zone and format. */
function eventBlockName(segment: EventBlockSegment, locale: string): string {
  const day = formatLocalDate(
    segment.date,
    { weekday: 'long', month: 'long', day: 'numeric' },
    locale,
  )
  const parts = [segment.title || en.event.untitled]
  if (segment.tag) parts.push(`${en.event.tagLabel}: ${segment.tag.name}`)
  parts.push(day, segment.label)
  if (segment.teamName) parts.push(`${en.event.teamLabel}: ${segment.teamName}`)
  return parts.join(', ')
}

/**
 * States differ by more than color (R5.7, R21.8): Hover adds a shadow and a darker 1 px border;
 * Selected uses a 2 px border and a semibold title. Keyboard focus adds a separate offset outline.
 */
const STATE_CLASSES: Record<EventBlockState, string> = {
  default: 'bg-block border border-block-border',
  hover: 'bg-block-hover border border-block-border-focus shadow-md',
  selected: 'bg-block-selected border-2 border-block-border-focus font-semibold',
}

function EventBlockImpl({ item, state, density, locale, pxPerMinute, onSelect }: EventBlockProps) {
  const [hovered, setHovered] = useState(false)
  const { segment, column, columnCount } = item
  const effective: EventBlockState =
    state === 'selected' ? 'selected' : state === 'hover' || hovered ? 'hover' : 'default'
  const { top, height } = segmentGeometry(segment.startMinute, segment.endMinute, pxPerMinute)
  const title = segment.title || en.event.untitled
  const name = eventBlockName(segment, locale)
  const showTime = density === 'full' || density === 'titleTime'
  const showTeam = density === 'full' && segment.teamName !== undefined
  const indicator = segment.tag ? (
    <span
      aria-hidden="true"
      data-slot="tag-indicator"
      data-color={segment.tag.colorKey}
      className={`shrink-0 ${tagIndicatorClasses(segment.tag.colorKey)}`}
    />
  ) : null

  return (
    <button
      type="button"
      data-slot="event-block"
      data-key={segment.key}
      data-state={effective}
      data-density={density}
      aria-label={name}
      aria-current={effective === 'selected' ? 'true' : undefined}
      title={showTime ? undefined : name}
      onClick={() => onSelect(segment.key)}
      onPointerEnter={(e) => setHovered(e.pointerType !== 'touch')}
      onPointerLeave={() => setHovered(false)}
      className={`absolute box-border flex min-w-0 flex-col overflow-hidden rounded-event text-left text-content-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-block-border-focus ${STATE_CLASSES[effective]} ${
        density === 'minimal' ? 'items-center justify-center' : 'gap-block-gap p-block-pad'
      }`}
      style={{
        top,
        height,
        left: `calc(${(column / columnCount) * 100}% + ${INSET_PX}px)`,
        width: `calc(${100 / columnCount}% - ${INSET_PX * 2}px)`,
      }}
    >
      {density === 'minimal' ? (
        indicator
      ) : (
        <>
          <span className="flex min-w-0 items-center gap-block-gap">
            {indicator}
            <span data-slot="event-title" className="min-w-0 truncate text-event-title">
              {title}
            </span>
          </span>
          {showTime ? (
            <span data-slot="event-time" className="min-w-0 truncate text-caption">
              {segment.label}
            </span>
          ) : null}
          {showTeam ? (
            <span
              data-slot="event-team"
              className="min-w-0 truncate text-caption text-content-secondary"
            >
              {segment.teamName}
            </span>
          ) : null}
        </>
      )}
    </button>
  )
}

function sameItem(a: EventBlockProps['item'], b: EventBlockProps['item']): boolean {
  const x = a.segment
  const y = b.segment
  return (
    a.column === b.column &&
    a.columnCount === b.columnCount &&
    x.key === y.key &&
    x.date === y.date &&
    x.startMinute === y.startMinute &&
    x.endMinute === y.endMinute &&
    x.label === y.label &&
    x.title === y.title &&
    x.teamName === y.teamName &&
    x.tag?.name === y.tag?.name &&
    x.tag?.colorKey === y.tag?.colorKey
  )
}

/** Re-renders only when geometry, content, state or format change (design 8.6, R19.6). */
export const EventBlock = memo(
  EventBlockImpl,
  (p, n) =>
    p.state === n.state &&
    p.density === n.density &&
    p.timeFormat === n.timeFormat &&
    p.locale === n.locale &&
    p.pxPerMinute === n.pxPerMinute &&
    p.onSelect === n.onSelect &&
    sameItem(p.item, n.item),
)
