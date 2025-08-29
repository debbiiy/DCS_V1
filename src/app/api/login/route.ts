import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { serialize } from 'cookie'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ 
    message: 'Login success', 
    role: user.role, 
    username: user.username, 
    email: user.email,
    dept: user.dept || null 
  })

  response.headers.set(
    'Set-Cookie',
    serialize('role', user.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24
    })
  )

  response.headers.append(
    'Set-Cookie',
    serialize('dept', user.dept || '', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24
    })
  )

  return response
}
