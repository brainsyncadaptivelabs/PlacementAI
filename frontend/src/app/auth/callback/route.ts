import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirect path, otherwise default to dashboard
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("[AUTH_CALLBACK] exchangeCodeForSession failed:", error);
    } catch (err) {
      console.error("[AUTH_CALLBACK] Uncaught fetch/network error during session exchange:", err);
    }
  }

  // If there is no code or the exchange failed, redirect to the auth page
  return NextResponse.redirect(`${origin}/auth`);
}
