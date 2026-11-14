import { useState } from 'react'
import { formatRange, type TimeFormat } from '@/domain/format/time'
import type { OverflowEntry } from '@/domain/layout/overlap'
import { segmentGeometry } from '@/domain/layout/geometry'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DESKTOP_MIN_WIDTH } from '../../constants/layout'
import { en } from '../../messages/en'
import type { EventBlockSegment } from './EventBlock'

export interface OverflowIndicatorProps {
  entry: OverflowEntry<EventBlockSegment>
  pxPerMinute: number
  timeFormat: TimeFormat
  locale: string
  onSelect(key: string): void
  /** Popover on desktop, sheet on mobile. Defaults to the viewport width (FC-1). */
  variant?: 'popover' | 'sheet'
}

function defaultVariant(): 'popover' | 'sheet' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'popover'
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches ? 'popover' : 'sheet'
}

/** `+N more` control that takes the last slot of a crowded cluster and lists the hidden occurrences (R4.6, R4.7, R21.9). */
export function OverflowIndicator({
  entry,
  pxPerMinute,
  timeFormat,
  locale,
  onSelect,
  variant,
}: OverflowIndicatorProps) {
  const [open, setOpen] = useState(false)
  const [resolved] = useState(() => variant ?? defaultVariant())
  const mode = variant ?? resolved
  const { top, height } = segmentGeometry(entry.startMinute, entry.endMinute, pxPerMinute)
  const range = formatRange(entry.startMinute, entry.endMinute, timeFormat, locale)
  const title = en.overflow.listTitle(entry.count)

  const trigger = (
    <button
      type="button"
      data-slot="overflow-indicator"
      aria-label={en.overflow.triggerName(entry.count, range)}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="absolute box-border flex items-center justify-center rounded-event border border-dashed border-block-border bg-block text-caption font-semibold text-content-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-block-border-focus"
      style={{
        top,
        height,
        left: `calc(${(entry.column / entry.columnCount) * 100}% + 2px)`,
        width: `calc(${100 / entry.columnCount}% - 4px)`,
      }}
    >
      {en.overflow.label(entry.count)}
    </button>
  )

  const list = (
    <ul data-slot="overflow-list" className="flex flex-col gap-1">
      {entry.hidden.map((segment) => (
        <li key={segment.key}>
          <button
            type="button"
            data-slot="overflow-item"
            data-key={segment.key}
            className="flex w-full flex-col rounded-event border border-block-border bg-block p-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-block-border-focus"
            onClick={() => {
              setOpen(false)
              onSelect(segment.key)
            }}
          >
            <span className="truncate text-event-title">{segment.title || en.event.untitled}</span>
            <span className="text-caption">{segment.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )

  if (mode === 'sheet') {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="p-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">{range}</SheetDescription>
          {list}
        </SheetContent>
      </Sheet>
    )
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        aria-label={title}
        className="flex max-h-80 flex-col gap-2 overflow-y-auto p-2"
      >
        {list}
      </PopoverContent>
    </Popover>
  )
}
