'use client'

import React, { memo } from 'react'
import Logo from '@/components/misc/Logo'
import { useContingent } from '@/lib/hooks/useContingent'
import { Skeleton } from '@/components/ui/skeleton'
import RefreshButton from '@/widgets/navbar/RefreshButton'
import Logout from '@/components/Logout'

const Header = () => {
  const { data: contingent, isLoading, isError, isStale } = useContingent()

  return (
    <header className="my-2 flex flex-row justify-between items-center">
      <div className="flex flex-row">
        <Logo />
        <div className="mx-3 py-2">
          <h2 className="text-ellipsis text-[18px] font-semibold tracking-tight sm:text-xl">
            {!isError && contingent
              ? `${contingent.lastName} ${contingent.firstName}`
              : isError
                ? <div>
                    <span>samga.nis</span>
                    <p className="text-xs text-muted-foreground italic">Взлетай к знаниям!</p>
                  </div>
                : null}
          </h2>
          {isLoading ||
            (isStale && (
              <>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="my-2 h-4 w-64" />
              </>
            ))}
          {!isError && contingent && (
            <p className="text-ellipsis text-[14px] leading-none text-muted-foreground sm:text-[16px]">
              {contingent.data.Klass} - {contingent.data.School?.Name?.ru || ''}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RefreshButton />
      </div>
    </header>
  )
}

export default memo(Header)
