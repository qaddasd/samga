import React, { FC } from 'react'
import { cn } from '@/lib/utils'
import classes from '@/widgets/journal/journal.module.scss'

type ScheduleCardProps = {
  subject: string
  time?: string
  teacher?: string
  classroom?: string
  period?: string
}

const ScheduleCard: FC<ScheduleCardProps> = ({ subject, time, teacher, classroom, period }) => {
  return (
    <div
      className={cn(
        'my-2.5 h-fit min-h-24 flex-col overflow-hidden rounded-xl bg-card shadow transition-colors hover:text-primary dark:shadow-none dark:hover:brightness-125 card-animation',
        classes.card,
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className={cn('flex w-10/12 scroll-m-20 text-xl', classes.subject)}>
            {subject}
          </h2>
          {period && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {period}
            </span>
          )}
        </div>
        {time && <div className="mt-1 text-sm text-muted-foreground">{time}</div>}
        {(teacher || classroom) && (
          <div className="mt-1 text-sm text-muted-foreground">
            {teacher}
            {teacher && classroom ? ' · ' : ''}
            {classroom ? `каб. ${classroom}` : ''}
          </div>
        )}
      </div>
      <div className="relative bottom-0 h-[4px] w-full overflow-hidden rounded-b-xl" style={{ background: 'linear-gradient(to right, hsl(var(--primary)) 100%, transparent 100%)' }} />
    </div>
  )
}

export default ScheduleCard
