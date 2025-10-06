import { useQuery } from '@tanstack/react-query'
import { http } from '@/shared/http'
import type { AktauSchedule } from '@/features/getAktauSchedule'

export const useSchedule = () => {
  return useQuery<AktauSchedule>({
    queryKey: ['schedule'],
    queryFn: async () => await http.get<AktauSchedule>('/api/schedule').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  })
}
