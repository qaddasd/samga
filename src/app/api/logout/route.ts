import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const jar = cookies()
  jar.delete('Access')
  jar.delete('Refresh')
  return NextResponse.json({ success: true })
} 