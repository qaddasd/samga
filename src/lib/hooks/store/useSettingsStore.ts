import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { useCurrentQuarter } from '@/lib/hooks/useCurrentQuarter'

type Range = {
  from: number
  to: number
}

export type Settings = {
  sort: 'asc' | 'score-up' | 'score-down'
  ranges: {
    good: Range
    average: Range
    bad: Range
  }
  gpaSystem: '4' | '5'  // Новое поле для выбора системы GPA
  updateRanges: (ranges: Settings['ranges']) => void
  updateSort: (sort: 'score-down' | 'score-up' | 'asc') => void
  updateGpaSystem: (system: '4' | '5') => void  // Новый метод для обновления системы GPA
  currentQuarter: string
  setCurrentQuarter: (quarter: string) => void
}

function validateSettings(ranges: Settings['ranges']): boolean {
  if (ranges.bad.from !== 0) {
    return false
  }

  if (ranges.good.to !== 100) {
    return false
  }

  if (
    ranges.average.from <= ranges.good.to ||
    ranges.bad.from <= ranges.average.to
  ) {
    return false
  }

  return !(
    ranges.bad.from <= ranges.average.from ||
    ranges.average.from <= ranges.good.from
  )
}

// Создаем безопасное хранилище, проверяющее доступность window
const createSafeStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  
  // Возвращаем заглушку для localStorage при серверном рендеринге
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
};

// Безопасно получаем текущую четверть, возвращаем 1 по умолчанию для серверного рендеринга
const getDefaultQuarter = () => {
  try {
    // Только вызываем useCurrentQuarter на клиенте
    if (typeof window !== 'undefined') {
      return useCurrentQuarter().toString();
    }
    return '1'; // Значение по умолчанию для серверного рендеринга
  } catch (e) {
    return '1'; // Запасной вариант при ошибке
  }
};

const useSettingsStore = create<Settings>()(
  persist(
    devtools((set) => ({
      sort: 'score-down',
      ranges: {
        good: { from: 85, to: 100 },
        average: { from: 65, to: 84 },
        bad: { from: 0, to: 64 },
      },
      gpaSystem: '5', // По умолчанию используем 5-балльную систему
      currentQuarter: getDefaultQuarter(),
      updateRanges: (ranges) => {
        if (validateSettings(ranges)) {
          set((state) => ({ ...state, ranges }))
        }
      },
      updateSort: (sort: 'score-down' | 'score-up' | 'asc') => {
        set((state) => ({ ...state, sort }))
      },
      updateGpaSystem: (system: '4' | '5') => {
        set((state) => ({ ...state, gpaSystem: system }))
      },
      setCurrentQuarter: (quarter: string) => {
        set((state) => ({ ...state, currentQuarter: quarter }))
      },
    })),
    {
      name: 'settings',
      version: 2, // Увеличиваем версию из-за изменения структуры
      storage: createJSONStorage(() => createSafeStorage()),
      skipHydration: typeof window === 'undefined', // Пропускаем гидратацию на сервере
    },
  ),
)

export default useSettingsStore
