import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  // If in maintenance mode, and not already on the maintenance page, rewrite to it
  if (isMaintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    // Only rewrite if it's not an API call or static asset
    if (!request.nextUrl.pathname.startsWith('/_next/') && 
        !request.nextUrl.pathname.startsWith('/api/') && 
        !request.nextUrl.pathname.match(/\.(.*)$/)) {
        return NextResponse.rewrite(new URL('/maintenance', request.url))
    }
  }
}

export const config = {
  // Matcher ignoring API, static files, images, etc.
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
