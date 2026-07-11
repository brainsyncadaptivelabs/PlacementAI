import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardRouteForRole } from '@/lib/auth-routes';

export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 15);
  const { searchParams, origin, pathname, protocol, host } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role');
  const next = searchParams.get('next') ?? '/auth/complete';

  console.log(`[AUTH_CALLBACK] requestId=${requestId}`);
  console.log(`[AUTH_CALLBACK] callback entered`);
  console.log(`[AUTH_CALLBACK] code present=${Boolean(code)}`);
  console.log(`[AUTH_CALLBACK] code fingerprint=${code ? code.substring(0, 6) : "none"}`);
  console.log(`[AUTH_CALLBACK] host=${host}`);
  console.log(`[AUTH_CALLBACK] protocol=${protocol}`);
  console.log(`[AUTH_CALLBACK] pathname=${pathname}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[AUTH_CALLBACK] NEXT_PUBLIC_SUPABASE_URL present:", Boolean(supabaseUrl));
  if (supabaseUrl) {
    try {
      console.log("[AUTH_CALLBACK] NEXT_PUBLIC_SUPABASE_URL hostname:", new URL(supabaseUrl).hostname);
    } catch (_) {}
  }
  console.log("[AUTH_CALLBACK] NEXT_PUBLIC_SUPABASE_ANON_KEY present:", Boolean(supabaseAnonKey));
  console.log("[AUTH_CALLBACK] NEXT_PUBLIC_SUPABASE_ANON_KEY length:", supabaseAnonKey ? supabaseAnonKey.length : 0);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[AUTH_CALLBACK] Supabase environment variables missing!");
    return NextResponse.redirect(`${origin}/auth?error=oauth_failed&category=SUPABASE_ENV_MISSING`);
  }

  if (!code) {
    console.warn('[AUTH_CALLBACK] No code param — redirecting to /auth');
    return NextResponse.redirect(`${origin}/auth`);
  }

  try {
    const supabase = await createClient();

    console.log(`[AUTH_CALLBACK] exchange starting`);
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !exchangeData?.session) {
      const errMsg = exchangeError?.message || "No session data returned";
      const errStatus = (exchangeError as any)?.status || "unknown";
      const errCode = (exchangeError as any)?.code || "unknown";

      console.log(`[AUTH_CALLBACK] exchange success=false`);
      console.log(`[AUTH_CALLBACK] exchange error code=${errCode}`);
      console.log(`[AUTH_CALLBACK] exchange error message=${errMsg}`);
      console.log(`[AUTH_CALLBACK] exchange error status=${errStatus}`);
      console.error('[AUTH_CALLBACK] exchangeCodeForSession failed:', errMsg);

      let mappedError = "oauth_failed";
      if (errMsg.includes("code verifier") || errMsg.includes("PKCE") || errMsg.includes("verifier")) {
        mappedError = "PKCE_VERIFIER_MISSING";
      } else if (errMsg.includes("already been redeemed") || errMsg.includes("already used")) {
        mappedError = "AUTH_CODE_ALREADY_USED";
      } else if (errMsg.includes("invalid") || errMsg.includes("expired")) {
        mappedError = "INVALID_AUTH_CODE";
      } else if (errMsg.includes("network") || errMsg.includes("fetch")) {
        mappedError = "NETWORK_ERROR";
      } else if (errMsg.includes("cookie") || errMsg.includes("state")) {
        mappedError = "COOKIE_STATE_MISSING";
      }

      console.error(`[AUTH_CALLBACK] Mapped OAuth error category: ${mappedError}`);
      return NextResponse.redirect(`${origin}/auth?error=oauth_failed&category=${mappedError}&msg=${encodeURIComponent(errMsg)}&status=${errStatus}&code=${errCode}`);
    }

    console.log(`[AUTH_CALLBACK] exchange success=true`);

    const session = exchangeData.session;
    const accessToken = session.access_token; // Real Supabase JWT — not a mock
    const userEmail = session.user?.email;
    const userFullName = session.user?.user_metadata?.full_name ?? userEmail;

    console.log(`[AUTH_CALLBACK] Session obtained for: ${userEmail}`);

    // ── Exchange Supabase token for PlacementAI JWT ────────────────────────
    const API_URL =
      process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      throw new Error("Production backend API URL is not configured");
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
        backendErrorType = `oauth_failed&backend_status=${backendResponse.status}&backend_err=${encodeURIComponent(errText.substring(0, 100))}`;
      }
    } catch (backendErr) {
      console.error('[AUTH_CALLBACK] Backend unreachable:', backendErr);
      backendErrorType = `backend_unreachable&backend_err=${encodeURIComponent((backendErr as any)?.message || "unknown")}`;
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
