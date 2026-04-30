import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Public paths
  if (path === '/login' || path.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Get session
  const sessionCookie = req.cookies.get('session')?.value

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const session = await decrypt(sessionCookie)
    const role = session?.user?.role

    // Role-based protection
    const cashierRestrictedPaths = ['/brands', '/settlements', '/ai-insights']
    const isRestrictedForCashier = cashierRestrictedPaths.some(p => path.startsWith(p))

    if (role === 'CASHIER' && isRestrictedForCashier) {
      return NextResponse.redirect(new URL('/', req.url)) // Redirect kasir ke dashboard jika akses dilarang
    }

    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
