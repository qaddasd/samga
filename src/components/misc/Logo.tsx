import React, { FC } from 'react'
import { cn } from '@/lib/utils'

const Logo: FC<{ width?: number; height?: number; className?: string; withText?: boolean }> = ({
  width = 38,
  height = 42,
  className = 'mb-3 ml-px mt-2',
  withText = false,
}) => {
  return (
    <div className="flex items-center">
      <svg
        width={width}
        height={height}
        viewBox="0 0 38 42"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className, 'fill-primary')}
      >
        <path d="M19 0L0 10.5V31.5L19 42L38 31.5V10.5L19 0ZM30.4 26.25L19 32.55L7.6 26.25V15.75L19 9.45L30.4 15.75V26.25ZM19 23.1L24.7 19.95V13.65L19 10.5L13.3 13.65V19.95L19 23.1Z" />
      </svg>
      {withText && (
        <div className="ml-2 flex flex-col">
          <span className="text-xl font-bold text-primary">samga.nis</span>
          <span className="text-xs text-muted-foreground">Взлетай к знаниям!</span>
        </div>
      )}
    </div>
  )
}

export default Logo
