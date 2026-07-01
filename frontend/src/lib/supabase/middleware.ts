import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Configuration Error: NEXT_PUBLIC_SUPABASE_URL is missing.");
  }
  if (!anonKey) {
    throw new Error("Configuration Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (err) {
    console.error("[SUPABASE_MIDDLEWARE] Error fetching user session:", err);
    // On transient network or socket failures in the container runtime, allow the request to proceed.
    // The client-side AuthProvider running in the browser will handle session verification and sync.
    return supabaseResponse;
  }

  console.log(`[SUPABASE_MIDDLEWARE] Path: ${request.nextUrl.pathname}, User: ${user ? user.email : "none"}`);

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone();
    if (request.nextUrl.pathname.startsWith('/recruiter')) {
      url.pathname = '/auth/recruiter';
    } else if (request.nextUrl.pathname.startsWith('/placement-officer')) {
      url.pathname = '/auth/placement-officer';
    } else {
      url.pathname = '/auth';
    }
    console.log(`[SUPABASE_MIDDLEWARE] Redirecting unauthenticated user from ${request.nextUrl.pathname} to ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
