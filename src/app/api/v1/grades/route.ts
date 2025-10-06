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
  
  // Get term parameter if provided
  const url = new URL(request.url)
  const term = url.searchParams.get('term')
  
  // Return mock grades data
  return NextResponse.json({
    student_id: "1234567890",
    term: term || "current",
    subjects: [
      {
        id: "math101",
        name: "Математика",
        teacher: "Петрова А.И.",
        grades: [
          { date: "2023-05-01", value: 5, comment: "Контрольная работа" },
          { date: "2023-05-05", value: 4, comment: "Домашнее задание" },
          { date: "2023-05-10", value: 5, comment: "Активность на уроке" }
        ],
        average: 4.7
      },
      {
        id: "phys101",
        name: "Физика",
        teacher: "Смирнов К.П.",
        grades: [
          { date: "2023-05-02", value: 4, comment: "Лабораторная работа" },
          { date: "2023-05-07", value: 5, comment: "Проект" },
          { date: "2023-05-12", value: 4, comment: "Тест" }
        ],
        average: 4.3
      },
      {
        id: "bio101",
        name: "Биология",
        teacher: "Иванова Е.С.",
        grades: [
          { date: "2023-05-03", value: 5, comment: "Практическая работа" },
          { date: "2023-05-08", value: 5, comment: "Доклад" },
          { date: "2023-05-15", value: 4, comment: "Самостоятельная работа" }
        ],
        average: 4.7
      }
    ],
    overall_average: 4.6,
    updated_at: "2023-05-15T16:30:00Z"
  })
} 