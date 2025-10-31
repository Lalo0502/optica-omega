import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    // Public paths that don't require authentication
    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

    // Check if trying to access root path
    const isRootPath = request.nextUrl.pathname === '/';

    // Redirect rules
    if (isRootPath) {
      // Always redirect root to dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    if (!session && !isPublicPath) {
      // No session and trying to access protected route - redirect to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (session && isPublicPath) {
      // Has session but trying to access public route - redirect to dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    // Update session if it exists
    if (session) {
      res.headers.set('Cache-Control', 'no-store, max-age=0');
    }

    return res;
  } catch (error) {
    // On error, redirect to login for safety
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};