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
  
  // Return mock user data
  return NextResponse.json({
    id: "1234567890",
    name: "Иван Иванов",
    email: "student@example.com",
    role: "student",
    grade: "10",
    class: "A",
    school: "НИШ Астана",
    created_at: "2023-01-01T00:00:00Z",
    last_login: "2023-05-10T12:34:56Z"
  })
} 