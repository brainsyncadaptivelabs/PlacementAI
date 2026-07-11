import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardRouteForRole } from '@/lib/auth-routes';

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
    let API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      'http://localhost:8080/api/v1';

    // Swap localhost:8080 with backend:8080 inside Docker container network for server-side fetches
    if (API_URL.includes('localhost:8080')) {
      API_URL = API_URL.replace('localhost:8080', 'backend:8080');
    }

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
    let backendErrorType: string | null = null;

    try {
      const backendResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        
        // Step 1: Log only safe keys and metadata
        console.log("[PlacementAI OAuth] backend response status:", backendResponse.status);
        console.log("[PlacementAI OAuth] backend response keys:", Object.keys(backendData));
        
        placementToken = backendData.accessToken;
        
        console.log("[PlacementAI OAuth] PlacementAI token exists:", Boolean(placementToken));
        console.log("[PlacementAI OAuth] backend role:", backendData.role);
        console.log("[PlacementAI OAuth] profileCompleted:", backendData.profileCompleted);

        backendRole = backendData.role ?? validatedRole ?? 'STUDENT';

        // Enforce strict portal-based login for social login
        const portalRole = validatedRole ?? 'STUDENT';
        if (backendRole && backendRole !== portalRole) {
          console.warn(`[AUTH_CALLBACK] Portal mismatch: attempted ${portalRole} but user is ${backendRole}`);
          let correctPortal = "/auth";
          if (backendRole === "RECRUITER") correctPortal = "/auth/recruiter";
          else if (backendRole === "PLACEMENT_OFFICER") correctPortal = "/auth/placement-officer";
          else if (backendRole === "ADMIN" || backendRole === "SUPER_ADMIN") correctPortal = "/admin/login";

          return NextResponse.redirect(`${origin}/auth?error=wrong_portal&correct=${encodeURIComponent(correctPortal)}&role=${backendRole}`);
        }
      } else {
        const errText = await backendResponse.text();
        console.error(`[AUTH_CALLBACK] Backend auth failed (${backendResponse.status}): ${errText}`);
        backendErrorType = "oauth_failed";
      }
    } catch (backendErr) {
      console.error('[AUTH_CALLBACK] Backend unreachable:', backendErr);
      backendErrorType = "backend_unreachable";
    }

    // Step 2: Refuse dashboard redirect when PlacementAI JWT is missing
    if (!placementToken) {
      console.error("[PlacementAI OAuth] Backend authentication succeeded but PlacementAI JWT is missing");
      const errorParam = backendErrorType || "placement_token_missing";
      return NextResponse.redirect(`${origin}/auth?error=${errorParam}`);
    }

    // ── Build redirect URL with tokens + role as query params ─────────────
    // The client-side AuthProvider picks these up on mount and stores them.
    const rolePath = getDashboardRouteForRole(backendRole);
    const destination = new URL(`${origin}${rolePath}`);
    
    // Step 3: Attach _pat before redirect
    destination.searchParams.set('_pat', placementToken); // PlacementAI Token
    destination.searchParams.set('_role', backendRole);

    console.log("[PlacementAI OAuth] PAT attached to redirect:", destination.searchParams.has("_pat"));
    console.log("[PlacementAI OAuth] role attached:", destination.searchParams.get("_role"));
    console.log("[PlacementAI OAuth] redirect pathname:", destination.pathname);

    return NextResponse.redirect(destination.toString());

  } catch (err) {
    console.error('[AUTH_CALLBACK] Uncaught error:', err);
    return NextResponse.redirect(`${origin}/auth?error=callback_error`);
  }
}
