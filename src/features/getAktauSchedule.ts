import { getAdditionalUserInfo } from '@/features/getAdditionalUserInfo'

export type AktauScheduleLesson = {
  numberStart: number | null
  numberEnd: number | null
  time: string
  subject: string
  teacher: string
  classroom: string
}

export type AktauSchedule = {
  days: {
    name: string
    lessons: AktauScheduleLesson[]
  }[]
}

const URL =
  'https://nisaktau.edupage.org/timetable/server/regulartt.js?__func=regularttGetData'
const PAYLOAD = { __args: [null, '115'], __gsh: '00000000' }

// Helpers to work with edupage data format
const findTable = (tables: any[], id: string) =>
  tables.find((t) => t?.id === id) || null

const makeLookup = (tables: any[], id: string, key = 'id') => {
  const t = findTable(tables, id)
  if (!t) return {} as Record<string, any>
  const out: Record<string, any> = {}
  for (const row of t.data_rows || []) out[String(row?.[key])] = row
  return out
}

const teacherName = (row?: any) => {
  if (!row) return '—'
  if (row.name) return row.name
  const fn = (row.firstname || '').trim()
  const ln = (row.lastname || '').trim()
  const s = `${fn} ${ln}`.trim()
  return s || row.short || '—'
}

const detectMaskDirection = (cards: any[], daysCount: number) => {
  const left = new Array(daysCount).fill(0)
  const right = new Array(daysCount).fill(0)
  let singles = 0

  for (const c of cards) {
    let m = String(c.days || c.daysmask || c.daysdefid || '').trim()
    m = [...m].filter((ch) => ch === '0' || ch === '1').join('')
    if (!m) continue
    if (m.split('1').length - 1 === 1) {
      singles += 1
      const mLeft = m.length < daysCount ? m.padEnd(daysCount, '0') : m.slice(-daysCount)
      const mRight = m.length < daysCount ? m.padStart(daysCount, '0') : m.slice(-daysCount)
      const iLeft = mLeft.indexOf('1')
      if (iLeft >= 0) left[iLeft] += 1
      const iRight = mRight.lastIndexOf('1')
      if (iRight >= 0) right[daysCount - 1 - iRight] += 1
    }
  }

  if (singles === 0) return 'left'
  const leftMax = Math.max(...left)
  const rightMax = Math.max(...right)
  return leftMax >= rightMax ? 'left' : 'right'
}

const maskToDays = (mask: string, daysOrder: string[], direction: 'left' | 'right') => {
  const m = [...String(mask).trim()].filter((ch) => ch === '0' || ch === '1').join('')
  if (!m) return [] as string[]
  const n = daysOrder.length
  if (direction === 'left') {
    const m2 = m.length < n ? m.padEnd(n, '0') : m.slice(-n)
    return m2.split('').flatMap((ch, i) => (ch === '1' ? [daysOrder[i]!] : []))
  } else {
    const m2 = m.length < n ? m.padStart(n, '0') : m.slice(-n)
    const rev = m2.split('').reverse().join('')
    return rev.split('').flatMap((ch, i) => (ch === '1' ? [daysOrder[i]!] : []))
  }
}

const periodTimeStringRange = (
  periodsLookup: Record<string, any>,
  startPeriod?: number | null,
  endPeriod?: number | null,
) => {
  if (startPeriod == null || endPeriod == null) return ''
  const find = (p: any) => {
    const pid = String(p)
    if (periodsLookup[pid]) return periodsLookup[pid]
    for (const r of Object.values(periodsLookup)) {
      const rr: any = r
      if (String(rr.period) === pid || String(rr.short) === pid) return rr
    }
    return null
  }
  const p1 = find(startPeriod)
  const p2 = find(endPeriod)
  if (!p1 || !p2) return ''
  const s = p1.starttime || p1.start || ''
  const e = p2.endtime || p2.end || ''
  return `${s}-${e}`.replace(/^-|-$|^-/g, '')
}

// Resolve a numeric period index from a card/lesson "period" value using periods table
const resolvePeriodNumber = (
  periodsLookup: Record<string, any>,
  raw: unknown,
): number | null => {
  if (raw == null) return null
  const key = String(raw)
  // direct id hit
  const byId = periodsLookup[key]
  if (byId) {
    const n = Number(byId.period ?? byId.short ?? byId.id)
    return Number.isFinite(n) ? n : null
  }
  // try by number/short match
  for (const r of Object.values(periodsLookup)) {
    const rr: any = r
    if (String(rr.id) === key || String(rr.short) === key) {
      const n = Number(rr.period ?? rr.short ?? rr.id)
      return Number.isFinite(n) ? n : null
    }
  }
  // fallback parse numeric
  const n = Number(key)
  return Number.isFinite(n) ? n : null
}

export const getAktauSchedule = async (
  token: string,
): Promise<AktauSchedule> => {
  // 1) Determine student's class name
  const {
    data: { Klass: className },
  } = await getAdditionalUserInfo(token)

  // 2) Fetch remote edupage dataset
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(PAYLOAD),
    // Avoid Next caching for dynamic content
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('EDUPAGE_UNAVAILABLE')
  }

  const data = (await response.json()) as any

  const tables = data?.r?.dbiAccessorRes?.tables || []
  const subjects = makeLookup(tables, 'subjects')
  const teachers = makeLookup(tables, 'teachers')
  const classrooms = makeLookup(tables, 'classrooms')
  const periods = makeLookup(tables, 'periods')

  const daysTable = findTable(tables, 'days')
  let daysOrder: string[] = (daysTable?.data_rows || []).map(
    (r: any) => r.name || r.short || `Day ${r.id}`,
  )
  if (!daysOrder || daysOrder.length === 0)
    daysOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница']

  const lessonsTable = findTable(tables, 'lessons') || findTable(tables, 'ttitems')
  if (!lessonsTable) throw new Error('LESSONS_NOT_FOUND')

  const cardsTable = findTable(tables, 'cards')
  const cardsRows: any[] = cardsTable?.data_rows || []

  const direction = detectMaskDirection(cardsRows, daysOrder.length)

  const cardsByLesson: Record<string, any[]> = {}
  for (const c of cardsRows) {
    const lid = c?.lessonid
    if (lid != null) {
      const arr = cardsByLesson[lid] || (cardsByLesson[lid] = [])
      arr.push(c)
    }
  }

  // Find class id by class name from contingent API
  const classesTable = findTable(tables, 'classes')
  const classRows: any[] = classesTable?.data_rows || []
  const classRow = classRows.find(
    (r) =>
      String(r?.name || '').trim().toLowerCase() ===
        String(className || '').trim().toLowerCase() ||
      String(r?.short || '').trim().toLowerCase() ===
        String(className || '').trim().toLowerCase(),
  )
  if (!classRow) throw new Error('CLASS_NOT_FOUND')
  const classId = String(classRow.id)

  // Build raw entries
  const tmpSchedule: Record<string, any[]> = {}
  for (const d of daysOrder) tmpSchedule[d] = []
  tmpSchedule['Unknown'] = []

  for (const lesson of lessonsTable.data_rows || []) {
    const cls = lesson.classids || []
    const hasClass = Array.isArray(cls)
      ? cls.map(String).includes(classId)
      : String(cls) === classId
    if (!hasClass) continue

    const subjRow = subjects[String(lesson.subjectid)] || {}
    const subjName =
      subjRow.name || subjRow.short || String(lesson.subjectid || '—')

    const teacherIds: any[] = lesson.teacherids || []
    const teacherNames = (Array.isArray(teacherIds) ? teacherIds : [teacherIds])
      .map((tid) => teacherName(teachers[String(tid)]))
      .filter(Boolean)
      .join(', ') || '—'

    const cards = cardsByLesson[lesson.id] || []

    if (!cards || cards.length === 0) {
      const period = lesson.period || lesson.durationperiods || null
      let roomids: any[] = lesson.classroomids || lesson.classroomid || []
      if (!Array.isArray(roomids)) roomids = [roomids]
      const roomNames = roomids
        .map((cid) => {
          const row = classrooms[String(cid)] || {}
          return row.name || row.short || String(cid)
        })
        .filter(Boolean)
        .join(', ') || '—'

      tmpSchedule['Unknown'].push({
        period,
        subject: subjName,
        teacher: teacherNames,
        room: roomNames,
        mask: '',
      })
      continue
    }

    for (const c of cards) {
      const period: any = c.period ?? c.periodid
      const duration = Number(
        c.durationperiods ?? c.duration ?? lesson.durationperiods ?? lesson.duration ?? 1,
      )
      let roomids: any[] = c.classroomids || c.classroomid || []
      if (!Array.isArray(roomids)) roomids = [roomids]
      const roomNames = roomids
        .map((cid) => {
          const row = classrooms[String(cid)] || {}
          return row.name || row.short || String(cid)
        })
        .filter(Boolean)
        .join(', ') || '—'

      const rawMask = String(c.days || c.daysmask || c.daysdefid || '')
      let days = maskToDays(rawMask, daysOrder, direction as 'left' | 'right')
      if (!days || days.length === 0) {
        const rawLessonMask = String(
          (lesson as any)?.days || (lesson as any)?.daysmask || (lesson as any)?.daysdefid || '',
        )
        const alt = maskToDays(rawLessonMask, daysOrder, direction as 'left' | 'right')
        if (alt.length) days = alt
      }

      const startNum = resolvePeriodNumber(periods, period)

      // expand double/triple lessons into separate periods so they merge into ranges later
      const periodsToAdd: (number | null)[] = []
      if (startNum == null) periodsToAdd.push(null)
      else {
        const count = isFinite(duration) && duration > 0 ? Math.floor(duration) : 1
        for (let k = 0; k < count; k++) periodsToAdd.push(startNum + k)
      }

      for (const pNum of periodsToAdd) {
        const entry = {
          period: pNum,
          subject: String(subjName),
          teacher: String(teacherNames),
          room: String(roomNames),
          mask: rawMask,
        }

        if (days.length > 0) {
          for (const d of days) tmpSchedule[d]?.push({ ...entry })
        } else tmpSchedule['Unknown'].push({ ...entry })
      }
    }
  }

  // Deduplicate and merge consecutive periods
  const mergedByDay: Record<string, AktauScheduleLesson[]> = {}

  for (const d of Object.keys(tmpSchedule)) {
    const items = tmpSchedule[d] || []

    // Deduplicate
    const seen = new Set<string>()
    const uniq = [] as typeof items
    for (const it of items) {
      const key = [String(it.period), it.subject, it.teacher, it.room].join('|')
      if (seen.has(key)) continue
      seen.add(key)
      uniq.push(it)
    }

    // Split into numeric/non-numeric
    const numeric = uniq.filter((x) => typeof x.period === 'number')
    const nonNumeric = uniq.filter((x) => typeof x.period !== 'number')

    numeric.sort((a, b) => (a.period as number) - (b.period as number))

    const merged: AktauScheduleLesson[] = []
    let i = 0
    while (i < numeric.length) {
      const cur = numeric[i]
      const subj = cur.subject
      const teacher = cur.teacher
      const room = cur.room
      let start = cur.period as number
      let end = start
      let j = i + 1
      while (j < numeric.length) {
        const nxt = numeric[j]
        if (
          nxt.subject === subj &&
          nxt.teacher === teacher &&
          nxt.room === room &&
          typeof nxt.period === 'number' &&
          nxt.period === end + 1
        ) {
          end = nxt.period
          j += 1
        } else break
      }
      const time = periodTimeStringRange(periods, start, end)
      merged.push({
        numberStart: start,
        numberEnd: end,
        time,
        subject: subj,
        teacher,
        classroom: room,
      })
      i = j
    }

    for (const it of nonNumeric) {
      merged.push({
        numberStart: it.period ?? null,
        numberEnd: it.period ?? null,
        time: '',
        subject: it.subject,
        teacher: it.teacher,
        classroom: it.room,
      })
    }

    mergedByDay[d] = merged
  }

  const result: AktauSchedule = {
    days: daysOrder.map((name) => ({ name, lessons: mergedByDay[name] || [] })),
  }

  return result
}
