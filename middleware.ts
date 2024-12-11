import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/:username(.*)',
  '/sso-callback(.*)',
  '/api/og',
  '/_next(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const response = NextResponse.next();

  // Add cache headers for post pages
  if (req.nextUrl.pathname.match(/\/[^\/]+\/posts(\/.*)?$/)) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59',
    );
  }

  // Rest of the middleware logic...
  if (userId && isOnboardingRoute(req)) {
    return response;
  }

  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (
    userId &&
    !sessionClaims?.metadata?.onboardingComplete &&
    !isOnboardingRoute(req)
  ) {
    const onboardingUrl = new URL('/onboarding', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return response;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
