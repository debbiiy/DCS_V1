import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })

  response.headers.set(
    'Set-Cookie',
    serialize('role', '', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 0,
    })
  )

  return response
}
