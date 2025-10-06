import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Check for API key in Authorization header
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }
  
  const apiKey = authHeader.replace('Bearer ', '')
  
  // Here you would verify the API key from your database/storage
  // For demo purposes, we'll just check the format
  if (!apiKey.startsWith('samga_')) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  
  // Get date parameter if provided
  const url = new URL(request.url)
  const date = url.searchParams.get('date') || '2023-05-10' // Default to a sample date
  
  // Return mock schedule data
  return NextResponse.json({
    student_id: "1234567890",
    date: date,
    day_of_week: "Среда",
    lessons: [
      {
        id: "lesson1",
        number: 1,
        time: "08:30 - 09:15",
        subject: "Математика",
        room: "304",
        teacher: "Петрова А.И.",
        homework: "Упражнения 45-48, стр. 123"
      },
      {
        id: "lesson2",
        number: 2,
        time: "09:25 - 10:10",
        subject: "Физика",
        room: "210",
        teacher: "Смирнов К.П.",
        homework: "Параграф 12, ответить на вопросы"
      },
      {
        id: "lesson3",
        number: 3,
        time: "10:20 - 11:05",
        subject: "История",
        room: "401",
        teacher: "Соколова М.В.",
        homework: "Подготовить доклад"
      },
      {
        id: "lesson4",
        number: 4,
        time: "11:15 - 12:00",
        subject: "Английский язык",
        room: "202",
        teacher: "Антонова И.К.",
        homework: "Учебник стр. 45, упр. 3-5"
      },
      {
        id: "lesson5",
        number: 5,
        time: "12:20 - 13:05",
        subject: "Биология",
        room: "315",
        teacher: "Иванова Е.С.",
        homework: "Тест онлайн"
      },
      {
        id: "lesson6",
        number: 6,
        time: "13:15 - 14:00",
        subject: "Информатика",
        room: "404",
        teacher: "Кузнецов Д.А.",
        homework: "Практическая работа №5"
      }
    ],
    events: [
      {
        id: "event1",
        time: "15:00 - 16:30",
        title: "Факультатив по математике",
        room: "310"
      }
    ],
    notes: "Не забудьте сдать дневники на проверку"
  })
} 