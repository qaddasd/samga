'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSchedule } from '@/lib/hooks/useSchedule'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { WarningCircle } from '@phosphor-icons/react/dist/ssr'
import ScheduleCard from '@/widgets/schedule/ScheduleCard'
import DateSwitcher from '@/components/ui/date-switcher'

// helpers for day names mapping
const RU = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'] as const
const EN = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const
const normalize = (s?: string) => (s ?? '').trim().toLowerCase()
const dayIndexToCandidates = (idx: number): string[] => [RU[idx] ?? '', EN[idx] ?? '']
const jsIndexFromName = (name: string): number => {
  const n = normalize(name)
  let i = RU.findIndex((x) => x === n)
  if (i >= 0) return i
  i = EN.findIndex((x) => x === n)
  return i >= 0 ? i : -1
}
const mondayWeekStart = (d: Date) => {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const js = base.getDay() // 0..6, 0=Sun
  const diff = (js + 6) % 7 // to Monday
  base.setDate(base.getDate() - diff)
  return base
}

const Page = () => {
  const { data, isLoading, isError } = useSchedule()

  const days = data?.days ?? []

  // Choose UI labels language (RU or EN) and render Monday–Friday only
  const LABELS_RU = ['Понедельник','Вторник','Среда','Четверг','Пятница'] as const
  const LABELS_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday'] as const
  const hasCyr = useMemo(() => days.some((d) => /[\u0400-\u04FF]/.test(String(d?.name || ''))), [days])
  const labelsUI = hasCyr ? LABELS_RU : LABELS_EN

  // date switcher state
  const [date, setDate] = useState<Date>(() => {
    const d = new Date()
    return d
  })

  // selected tab (day label)
  const [tab, setTab] = useState<string>('')

  // when data or date changes, pick proper tab label matching the weekday
  useEffect(() => {
    const idx = (date.getDay() + 6) % 7 // Monday-first index 0..6
    const clamped = Math.min(idx, labelsUI.length - 1) // clamp Sat/Sun -> Friday
    setTab(labelsUI[clamped] ?? labelsUI[0] ?? '')
  }, [date, hasCyr])

  const content = useMemo(() => {
    // Map incoming days (RU/EN, any order/length) to Monday-first labels
    const lessonsByLabel: Record<string, any[]> = {}
    for (const d of days) {
      const idx = jsIndexFromName(d?.name || '')
      if (idx < 0) continue
      const monIdx = (idx + 6) % 7
      const label = labelsUI[monIdx]
      if (label) lessonsByLabel[label] = d.lessons || []
    }
    return lessonsByLabel[tab] ?? []
  }, [tab, days, labelsUI])

  // date shift logic now lives inside DateSwitcher

  const handleDateChange = (next: Date) => {
    setDate((prev) => {
      const dir = next.getTime() - prev.getTime()
      const js = next.getDay() // 0=Sun,6=Sat
      let out = next
      if (js === 6) out = new Date(next.getFullYear(), next.getMonth(), next.getDate() + (dir >= 0 ? 2 : -1))
      else if (js === 0) out = new Date(next.getFullYear(), next.getMonth(), next.getDate() + (dir >= 0 ? 1 : -2))
      return out
    })
  }

  if (isLoading)
    return (
      <div className="w-full">
        <Skeleton className="mb-2 h-10 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="mb-2 h-24 w-full" key={i} />
        ))}
      </div>
    )

  if (isError)
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <p className="mb-2 font-medium">Не удалось загрузить расписание</p>
        <p>Попробуйте позже.</p>
      </div>
    )

  if (!data || days.length === 0)
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-yellow-600">
          <WarningCircle size={20} />
          <b>Расписание недоступно</b>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Раздел временно недоступен.
        </p>
      </div>
    )

  return (
    <div className="sm:mb-[3.5rem]">
      {/* Date switcher */}
      <DateSwitcher date={date} onChange={handleDateChange} className="mb-2" />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v)
          const monIdx = (labelsUI as readonly string[]).indexOf(v)
          if (monIdx >= 0) {
            const start = mondayWeekStart(date)
            const currentMonIdx = (date.getDay() + 6) % 7
            const weekOffset = monIdx < currentMonIdx ? 7 : 0
            const next = new Date(
              start.getFullYear(),
              start.getMonth(),
              start.getDate() + monIdx + weekOffset,
            )
            setDate(next)
          }
        }}
        className="w-full"
      >
        <TabsList
          className="mb-2.5 flex w-full select-none items-center gap-1 rounded-2xl border border-border bg-neutral-900 px-1 py-1 text-white/70 dark:bg-neutral-900"
        >
          {labelsUI.map((name) => (
            <TabsTrigger
              key={name}
              value={name}
              className="flex-1 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm capitalize transition-colors hover:text-white/90 data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        {labelsUI.map((name) => (
          <TabsContent key={name} value={name} className="tab-content">
            {content.length === 0 && tab === name ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Нет уроков
              </div>
            ) : (
              <div>
                {tab === name && content.map((l, i) => (
                  <ScheduleCard
                    key={`${name}-${i}`}
                    subject={l.subject}
                    time={l.time}
                    teacher={l.teacher}
                    classroom={l.classroom}
                    period={
                      l.numberStart === l.numberEnd
                        ? String(l.numberStart ?? '?')
                        : `${l.numberStart}-${l.numberEnd}`
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* bottom note removed by request */}
    </div>
  )
}

export default Page
