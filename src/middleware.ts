import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const role = req.cookies.get('role')?.value
  const { pathname } = req.nextUrl

  if (!role && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (role && pathname === '/login') {
    let redirectPath = '/dashboard/user'
    if (role === 'ADMIN') redirectPath = '/dashboard/admin'
    else if (role.includes('REVIEWER')) redirectPath = '/dashboard/reviewer'

    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}
