import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[SUPABASE_MIDDLEWARE] Warning: Supabase URL or Anon Key is missing! Check environment variables.");
  }

  const supabase = createServerClient(
    url || 'https://placeholder-supabase.co',
    anonKey || 'placeholder-anon-key',
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

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    // No user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
