import React, { FC, useMemo } from 'react'
import { type Journal } from '@/shared/types'
import JournalElement from '@/widgets/journal/JournalElement'
import JournalNotFound from '@/widgets/journal/JournalNotFound'
import useSettingsStore from '@/lib/hooks/store/useSettingsStore'

type JournalProps = {
  journal: Journal[number]
}

const compareFunction =
  (sort: string) =>
  (
    a: Journal[number]['subjects'][number],
    b: Journal[number]['subjects'][number],
  ) => {
    switch (sort) {
      case 'asc':
        return a.name.ru.localeCompare(b.name.ru)
      case 'score-up':
        return a.currScore - b.currScore
      default:
        return b.currScore - a.currScore
    }
  }

const JournalList: FC<JournalProps> = ({ journal }) => {
  const sort = useSettingsStore((state) => state.sort)

  const sortedJournal = useMemo(() => {
    if (!journal.subjects || journal.subjects.length === 0) return []
    return [...journal.subjects].sort(compareFunction(sort))
  }, [journal.subjects, sort])

  return (
    <div className="page-transition">
      {sortedJournal.length > 0 ? (
        sortedJournal.map((subject, index) => (
          <div 
            key={`journal-element-${index}`} 
            className="list-item-animation" 
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <JournalElement
              subject={subject.name.ru}
              subjectId={subject.id}
              quarter={journal.number.toString()}
              currentScore={subject.currScore}
              mark={subject.mark}
            />
          </div>
        ))
      ) : (
        <JournalNotFound description="По данной четверти информации не найдено" />
      )}
    </div>
  )
}

export default JournalList
