import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role');
  const next = searchParams.get('next') ?? '/auth/complete';

  console.log(`[AUTH_CALLBACK] Hit. code=${code ? 'present' : 'absent'}, role=${role ?? 'none'}, next=${next}`);

  if (!code) {
    console.warn('[AUTH_CALLBACK] No code param — redirecting to /auth');
    return NextResponse.redirect(`${origin}/auth`);
  }

  try {
    const supabase = await createClient();

    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !exchangeData?.session) {
      console.error('[AUTH_CALLBACK] exchangeCodeForSession failed:', exchangeError?.message);
      return NextResponse.redirect(`${origin}/auth?error=oauth_failed`);
    }

    const session = exchangeData.session;
    const accessToken = session.access_token; // Real Supabase JWT — not a mock
    const userEmail = session.user?.email;
    const userFullName = session.user?.user_metadata?.full_name ?? userEmail;

    console.log(`[AUTH_CALLBACK] Session obtained for: ${userEmail}`);

    // ── Exchange Supabase token for PlacementAI JWT ────────────────────────
    // For server-side requests in Docker, replace 'localhost' with the service name 'backend'
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('localhost', 'backend');
    const validRoles = ['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN'];
    const validatedRole = role && validRoles.includes(role) ? role : undefined;

    const requestBody: any = {
      idToken: accessToken,
      provider: session.user?.app_metadata?.provider ?? 'google',
    };
    if (validatedRole) {
      requestBody.role = validatedRole;
    }

    console.log(`[AUTH_CALLBACK] Calling backend POST ${API_URL}/auth/google, role=${validatedRole ?? 'none'}`);

    let backendRole = 'STUDENT'; // safe default
    let placementToken: string | null = null;

    try {
      const backendResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        placementToken = backendData.accessToken;
        backendRole = backendData.role ?? validatedRole ?? 'STUDENT';
        console.log(`[AUTH_CALLBACK] Backend auth OK. role=${backendRole}`);
      } else {
        const errText = await backendResponse.text();
        console.error(`[AUTH_CALLBACK] Backend auth failed (${backendResponse.status}): ${errText}`);
      }
    } catch (backendErr) {
      console.error('[AUTH_CALLBACK] Backend unreachable:', backendErr);
    }

    // ── Build redirect URL with tokens + role as query params ─────────────
    // The client-side AuthProvider picks these up on mount and stores them.
    const rolePath = {
      RECRUITER: '/recruiter',
      PLACEMENT_OFFICER: '/placement-officer',
      ADMIN: '/admin',
      SUPER_ADMIN: '/admin',
      STUDENT: '/dashboard',
    }[backendRole] ?? '/dashboard';

    const destination = new URL(`${origin}${rolePath}`);
    if (placementToken) {
      destination.searchParams.set('_pat', placementToken); // PlacementAI Token
    }
    destination.searchParams.set('_role', backendRole);

    console.log(`[AUTH_CALLBACK] Redirecting to: ${destination.toString()}`);
    return NextResponse.redirect(destination.toString());

  } catch (err) {
    console.error('[AUTH_CALLBACK] Uncaught error:', err);
    return NextResponse.redirect(`${origin}/auth?error=callback_error`);
  }
}
