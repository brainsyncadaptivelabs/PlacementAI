import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirect path, otherwise default to dashboard
  const next = searchParams.get('next') ?? '/dashboard';

  console.log("[AUTH_CALLBACK] Route hit. Code: " + (code ? "present" : "absent") + ", Next: " + next);

  if (code) {
    try {
      const supabase = await createClient();
      console.log("[AUTH_CALLBACK] Exchanging code for session...");
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("[AUTH_CALLBACK] exchangeCodeForSession failed:", exchangeError);
      } else {
        console.log("[AUTH_CALLBACK] exchangeCodeForSession succeeded. Data: ", data);
      }

      console.log("[AUTH_CALLBACK] Checking current session...");
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      console.log("[AUTH_CALLBACK] Session from getSession():", session);
      console.log("[AUTH_CALLBACK] Session error from getSession():", sessionError);

      if (session) {
        console.log("[AUTH_CALLBACK] Session successfully created. Redirecting to: " + `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error("[AUTH_CALLBACK] No session exists even after exchangeCodeForSession!");
      }

    } catch (err) {
      console.error("[AUTH_CALLBACK] Uncaught fetch/network error during session exchange:", err);
    }
  } else {
    console.warn("[AUTH_CALLBACK] No code parameter in callback URL!");
  }

  console.warn("[AUTH_CALLBACK] Redirecting to /auth due to failure.");
  return NextResponse.redirect(`${origin}/auth`);
}
