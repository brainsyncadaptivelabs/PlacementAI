import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
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

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (err) {
    console.error("[SUPABASE_MIDDLEWARE] Error fetching user session:", err);
  }

  const pathname = request.nextUrl.pathname;

  // Define public paths
  const isPublicPath = 
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/cookies") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/mission") ||
    pathname.startsWith("/success-stories");

  const isAuthPath = pathname.startsWith("/auth");

  // Read cookies for role and profile completion
  const role = request.cookies.get('placementai_role')?.value || "STUDENT";
  const profileCompleted = request.cookies.get('placementai_profile_completed')?.value !== 'false';

  // 1. Unauthenticated users handling
  if (!user) {
    if (!isPublicPath && !isAuthPath) {
      let loginPath = "/auth";
      if (pathname.startsWith("/recruiter")) {
        loginPath = "/auth/recruiter";
      } else if (pathname.startsWith("/placement-officer")) {
        loginPath = "/auth/placement-officer";
      }
      
      const redirectUrl = new URL(loginPath, request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  // 2. Authenticated users handling
  // Redirect away from login pages if already authenticated
  if (isAuthPath) {
    let dashboardPath = "/dashboard";
    if (role === "RECRUITER") dashboardPath = "/recruiter";
    else if (role === "PLACEMENT_OFFICER") dashboardPath = "/placement-officer";
    else if (role === "ADMIN" || role === "SUPER_ADMIN") dashboardPath = "/admin";

    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Enforce profile completion
  if (!profileCompleted && !pathname.startsWith("/complete-profile")) {
    let completePath = "/complete-profile/student";
    if (role === "RECRUITER") completePath = "/complete-profile/recruiter";
    else if (role === "PLACEMENT_OFFICER") completePath = "/complete-profile/placement-officer";

    return NextResponse.redirect(new URL(completePath, request.url));
  }

  // Enforce role-based access control
  if (pathname.startsWith("/recruiter") && role !== "RECRUITER") {
    let correctPath = "/dashboard";
    if (role === "PLACEMENT_OFFICER") correctPath = "/placement-officer";
    else if (role === "ADMIN" || role === "SUPER_ADMIN") correctPath = "/admin";
    return NextResponse.redirect(new URL(correctPath, request.url));
  }

  if (pathname.startsWith("/placement-officer") && role !== "PLACEMENT_OFFICER") {
    let correctPath = "/dashboard";
    if (role === "RECRUITER") correctPath = "/recruiter";
    else if (role === "ADMIN" || role === "SUPER_ADMIN") correctPath = "/admin";
    return NextResponse.redirect(new URL(correctPath, request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    let correctPath = "/dashboard";
    if (role === "RECRUITER") correctPath = "/recruiter";
    if (role === "PLACEMENT_OFFICER") correctPath = "/placement-officer";
    return NextResponse.redirect(new URL(correctPath, request.url));
  }

  if (pathname.startsWith("/dashboard") && role !== "STUDENT") {
    let correctPath = "/dashboard";
    if (role === "RECRUITER") correctPath = "/recruiter";
    else if (role === "PLACEMENT_OFFICER") correctPath = "/placement-officer";
    else if (role === "ADMIN" || role === "SUPER_ADMIN") correctPath = "/admin";
    return NextResponse.redirect(new URL(correctPath, request.url));
  }

  return supabaseResponse;
}
