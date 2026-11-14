import { useId, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { filterZones, isListedZone } from '@/domain/time/zone-list'

export interface TimezoneSelectProps {
  value: string
  onChange(zone: string): void
  disabled?: boolean
  id?: string
  'aria-label'?: string
}

const MAX_OPTIONS = 100

/** Searchable IANA timezone combobox. onChange only ever receives a listed IANA identifier (R7.16, R13.8). */
export function TimezoneSelect({
  value,
  onChange,
  disabled = false,
  id,
  'aria-label': ariaLabel = 'Timezone',
}: TimezoneSelectProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState<string | null>(null) // null = show the value
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = text ?? ''
  const options = useMemo(() => filterZones(query).slice(0, MAX_OPTIONS), [query])
  const activeIndex = Math.min(active, Math.max(options.length - 1, 0))

  const close = () => {
    setOpen(false)
    setText(null)
    setActive(0)
  }

  const choose = (zone: string) => {
    if (!isListedZone(zone)) return
    if (zone !== value) onChange(zone)
    close()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setActive(Math.min(activeIndex + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(activeIndex - 1, 0))
    } else if (e.key === 'Enter') {
      if (open) {
        e.preventDefault()
        const zone = options[activeIndex]
        if (zone) choose(zone)
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        e.stopPropagation()
        close()
      }
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[activeIndex] ? `${listId}-${activeIndex}` : undefined
        }
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={text ?? value}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setText(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        onBlur={close}
      />
      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Timezones"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md"
        >
          {options.length === 0 ? (
            <li role="presentation" className="px-2 py-1.5 text-muted-foreground">
              No matching timezone
            </li>
          ) : (
            options.map((zone, i) => (
              <li
                key={zone}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={zone === value}
                data-active={i === activeIndex || undefined}
                className="cursor-pointer rounded-sm px-2 py-1.5 data-[active]:bg-accent aria-selected:font-medium"
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(zone)
                }}
                onMouseEnter={() => setActive(i)}
              >
                {zone}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
