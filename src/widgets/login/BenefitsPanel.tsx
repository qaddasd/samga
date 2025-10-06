import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface BenefitCard {
  id: string
  title: string
  colorClasses: string
}

const initialCards: BenefitCard[] = [
  {
    id: 'b1',
    title:
      'Быстрый доступ к оценкам — информация появляется быстрее, чем на других сервисах, таких как NIS Mektep.',
    colorClasses:
      'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
  {
    id: 'b2',
    title:
      'Простой и понятный интерфейс — всё сделано максимально удобно, чтобы даже новичок разобрался с первого раза.',
    colorClasses:
      'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
  {
    id: 'b3',
    title:
      'Актуальные результаты СОР и СОЧ — результаты обновляются регулярно и соответствуют информации с СУШ.',
    colorClasses:
      'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
  {
    id: 'b4',
    title:
      'Без рекламы и лишнего — никакой рекламы, всплывающих окон и отвлекающих элементов.',
    colorClasses:
      'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
  {
    id: 'b5',
    title:
      'Полностью бесплатно — сайт работает абсолютно бесплатно, но вы можете поддержать проект добровольным донатом.',
    colorClasses:
      'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
  {
    id: 'b6',
    title:
      'Создан школьниками — для школьников — команда самих учеников, понимающих, что нужно для удобной учёбы.',
    colorClasses:
      'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
];

const shuffleOnce = (arr: BenefitCard[]): BenefitCard[] => {
  if (arr.length < 2) return arr
  const a = Math.floor(Math.random() * arr.length)
  let b = Math.floor(Math.random() * arr.length)
  if (a === b) b = (b + 1) % arr.length
  const copy = [...arr]
  const tmp = copy[a]!
  copy[a] = copy[b]!
  copy[b] = tmp
  return copy
}

// Простой оверлей «искорок» поверх фона
const SparklesOverlay: React.FC<{ count?: number }> = ({ count = 24 }) => {
  const spots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 8,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2.5,
        hue: Math.floor(195 + Math.random() * 30), // сине-голубые оттенки
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {spots.map((s) => (
        <span
          key={s.id}
          className="sparkle mix-blend-screen"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            background: `radial-gradient(closest-side, hsl(${s.hue} 90% 96%), hsla(${s.hue} 90% 96% / 0) 70%)`,
          }}
        />
      ))}
    </div>
  )
}

const BenefitsPanel: React.FC = () => {
  const [cards, setCards] = useState<BenefitCard[]>(initialCards)

  useEffect(() => {
    const id = setInterval(() => setCards((prev) => shuffleOnce(prev)), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6">
      {/* Базовая картинка */}
      <Image
        src="/benefits.jpg"
        alt="Benefits background"
        fill
        priority
        className="object-cover"
        style={{
          filter: 'saturate(0.95) contrast(1.05) brightness(0.62)',
        }}
      />

      {/* Слегка затемняющая подложка */}
      <div className="pointer-events-none absolute inset-0 bg-black/35" />

      {/* Наш мягкий сине-голубой градиент — едва заметный, для техно-настроения */}
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[linear-gradient(120deg,rgba(37,99,235,0.18)_0%,rgba(14,165,233,0.16)_40%,rgba(56,189,248,0.12)_70%,rgba(37,99,235,0.18)_100%)]" />

      {/* Точечный паттерн поверх — технологичный фон */}
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.35)_1.2px,transparent_1.2px)] [background-size:22px_22px] [background-position:0_0] [mask-image:linear-gradient(to_right,black_80%,transparent)]" />

      {/* Туманная граница справа: в светлой — голубая дымка, в тёмной — тёмная */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-56 backdrop-blur-sm [mask-image:linear-gradient(to_left,black,transparent)] [background:radial-gradient(closest-side,rgba(59,130,246,0.20),rgba(59,130,246,0.0)_75%)] dark:[background:radial-gradient(closest-side,rgba(2,6,23,0.55),rgba(2,6,23,0.0)_75%)]" />

      {/* Голубой orb-свечения слева сверху */}
      <div className="orb left-10 top-10 h-40 w-40" style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.55), rgba(59,130,246,0.0) 70%)' }} />

      {/* Эффект «сверкания» */}
      <SparklesOverlay />

      <motion.div layout className="relative z-10 grid max-w-xl grid-cols-2 gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            transition={{ layout: { type: 'spring', stiffness: 200, damping: 20 } }}
            className={`rounded-2xl p-4 shadow-sm ${card.colorClasses}`}
          >
            <div className="mb-2 text-lg font-semibold">+</div>
            <div className="text-sm font-medium leading-snug">
              {card.title}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default BenefitsPanel 