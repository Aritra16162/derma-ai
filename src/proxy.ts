import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for dynamic runtime variables (not baked in at build time)
  const isMaintenanceMode = 
    process.env.MAINTENANCE_MODE === 'true' || 
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    const path = request.nextUrl.pathname;
    
    // Let essential assets, API routes, and the maintenance page itself pass through
    if (
      path.startsWith('/_next') ||
      path.startsWith('/api') ||
      path === '/maintenance' ||
      path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|mp4)$/)
    ) {
      return NextResponse.next();
    }
    
    // Rewrite all other requests to the maintenance page
    // This intercepts client-side navigations and direct hits immediately at the Edge
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static Next.js files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
