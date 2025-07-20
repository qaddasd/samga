import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Расчет баллов | SAMGA',
  description: 'Расчет необходимых баллов для достижения оценок',
}

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
} 