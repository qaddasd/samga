'use client'

import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretLeft, CaretRight, Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr'

type DateSwitcherProps = {
  date: Date
  onChange: (d: Date) => void
  className?: string
}

const monthRu = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
]

const weekRu = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const pad = (n: number) => String(n).padStart(2, '0')
const fmtRu = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`

// Convert JS Sunday-based (0..6, 0=Sun) to Monday-based index (0..6, 0=Mon)
const monIndex = (jsIndex: number) => (jsIndex + 6) % 7

const DateSwitcher: FC<DateSwitcherProps> = ({ date, onChange, className }) => {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<Date>(date)
  const ref = useRef<HTMLDivElement>(null)

  const headerTitle = useMemo(() => {
    return `${monthRu[view.getMonth()]} ${view.getFullYear()} г.`
  }, [view])

  const daysGrid = useMemo(() => {
    const y = view.getFullYear()
    const m = view.getMonth()
    const first = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0).getDate()
    const blanks = monIndex(first.getDay()) // number of leading blanks

    const cells: Array<{ day?: number; date?: Date }> = []
    for (let i = 0; i < blanks; i++) cells.push({})
    for (let d = 1; d <= lastDay; d++) {
      cells.push({ day: d, date: new Date(y, m, d) })
    }
    return cells
  }, [view])

  const isSameDate = (a?: Date, b?: Date) =>
    !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  // Sync internal calendar view with external date changes
  useEffect(() => {
    setView(date)
    // keep popover open state as-is, but ensure grid updates
  }, [date])

  // Close on outside click & Esc
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`relative ${className ?? ''}`} ref={ref}>
      <div className="flex items-center gap-2">
        <button
          aria-label="Предыдущий день"
          onClick={() => onChange(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1))}
          className="rounded-full border border-border p-1.5 hover:bg-accent"
        >
          <CaretLeft className="h-5 w-5" />
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-border bg-neutral-900 px-3.5 py-1.5 text-xs text-white/90 shadow-sm hover:bg-black sm:text-sm"
        >
          <span suppressHydrationWarning>{fmtRu(date)}</span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          aria-label="Следующий день"
          onClick={() => onChange(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))}
          className="rounded-full border border-border p-1.5 hover:bg-accent"
        >
          <CaretRight className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="dropdown-animation absolute z-50 mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="rounded-md p-1 hover:bg-accent"
              aria-label="Предыдущий месяц"
            >
              <CaretLeft className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium capitalize">{headerTitle}</div>
            <button
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="rounded-md p-1 hover:bg-accent"
              aria-label="Следующий месяц"
            >
              <CaretRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {weekRu.map((w) => (
              <div key={w} className="py-1 uppercase">
                {w}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 text-center">
            {daysGrid.map((cell, idx) => (
              <button
                key={idx}
                disabled={!cell.date}
                onClick={() => {
                  if (!cell.date) return
                  onChange(cell.date)
                  setView(cell.date)
                  setOpen(false)
                }}
                className={`h-7 rounded-md text-xs sm:text-sm transition-colors ${
                  cell.date
                    ? isSameDate(cell.date, date)
                      ? 'bg-primary text-white'
                      : 'hover:bg-accent'
                    : 'opacity-0'
                }`}
              >
                {cell.day ?? ''}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent"
              onClick={() => {
                setOpen(false)
                onChange(new Date())
                setView(new Date())
              }}
            >
              Сегодня
            </button>
            <button className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent" onClick={() => setOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateSwitcher
