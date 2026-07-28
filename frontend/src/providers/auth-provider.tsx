'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

/**
 * AuthProvider — runs once on mount.
 *
 * OAuth flow:
 *   Google → Supabase → /auth/callback (route.ts) → /dashboard?_pat=JWT&_role=STUDENT
 *                                                              ↑
 *                                          AuthProvider picks up _pat + _role here,
 *                                          stores them, and cleans the URL.
 *
 * Email/password flow:
 *   /auth/login → POST /api/v1/auth/login → stores JWT directly in localStorage.
 *
 * The provider does NOT fabricate tokens. If no backend token is present after
 * a Supabase session sync, it calls POST /auth/google with the real Supabase
 * access_token to obtain a PlacementAI JWT.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore();
  const supabase = createClient();
  const router = useRouter();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setupSessionTimer = (session: any) => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);

    if (!session || !session.expires_at) return;

    const expiresAtMs = session.expires_at * 1000;
    const timeRemaining = expiresAtMs - Date.now();
    const warningDelay = timeRemaining - 120_000; // 2 minutes

    if (warningDelay > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, warningDelay);
    } else if (timeRemaining > 0) {
      setShowTimeoutWarning(true);
    }

    if (timeRemaining > 0) {
      logoutTimeoutRef.current = setTimeout(() => {
        supabase.auth.signOut();
        setShowTimeoutWarning(false);
      }, timeRemaining);
    }
  };

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

    // ── Step 1: Pick up tokens injected by /auth/callback via query params ──
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pat = params.get('_pat');   // PlacementAI Token
      const role = params.get('_role'); // Confirmed backend role

      if (pat) {
        localStorage.setItem('token', pat);
        console.log(`[AUTH_PROVIDER] Stored PlacementAI token from callback. role=${role ?? 'unknown'}`);

        // Clean the URL — remove _pat and _role from browser address bar
        params.delete('_pat');
        params.delete('_role');
        const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState(null, '', cleanUrl);

        // Dispatch so any other listeners (e.g., api.ts) pick up the new token
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('placementai:auth-token-updated'));
      }
    }

    // ── Step 2: Sync Supabase session → backend (for page refreshes / email login) ──
    const syncBackend = async (session: any) => {
      if (!session?.user) return;

      // Check if stored token is still valid for this user
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        try {
          const parts = existingToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const email = payload.sub || payload.email;
            const exp = payload.exp;
            // Valid if matches user email and has >60s until expiry
            if (email === session.user.email && exp && exp * 1000 > Date.now() + 60_000) {
              return; // Already synced — no need to re-exchange
            }
          }
        } catch {
          // Corrupt token — fall through and re-sync
        }
      }

      // No valid token — exchange the real Supabase access_token for a PlacementAI JWT
      try {
        const supabaseAccessToken = session.access_token;
        if (!supabaseAccessToken) {
          console.warn('[AUTH_PROVIDER] No Supabase access_token on session — skipping backend sync');
          return;
        }

        // Read role from URL if present (e.g. during a fresh OAuth redirect)
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const urlRole = params?.get('role') ?? params?.get('_role') ?? undefined;
        const validRoles = ['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN', 'SUPER_ADMIN'];
        const role = urlRole && validRoles.includes(urlRole) ? urlRole : undefined;

        const requestBody: any = {
          idToken: supabaseAccessToken, // Real Supabase JWT — not a fabricated mock
          provider: session.user.app_metadata?.provider ?? 'google',
        };
        if (role) requestBody.role = role;

        console.log(`[AUTH_PROVIDER] POST ${API_URL}/auth/google (re-sync on refresh)`);

        const response = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.accessToken);
          document.cookie = `placementai_role=${data.role}; path=/; max-age=2592000; SameSite=Lax; Secure`;
          document.cookie = `placementai_profile_completed=${data.profileCompleted}; path=/; max-age=2592000; SameSite=Lax; Secure`;
          console.log(`[AUTH_PROVIDER] Re-synced. role=${data.role}`);
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('placementai:auth-token-updated'));
        } else {
          const errText = await response.text();
          console.error(`[AUTH_PROVIDER] Backend sync failed (${response.status}): ${errText}`);
        }
      } catch (err) {
        console.error('[AUTH_PROVIDER] Backend sync error:', err);
      }
    };

    // ── Step 3: Initialize session state ────────────────────────────────────
    const initializeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AUTH_PROVIDER] getSession error:', error);
        clearAuth();
        return;
      }

      setAuth(session?.user ?? null, session);
      if (session) {
        await syncBackend(session);
        setupSessionTimer(session);
      }
    };

    initializeAuth();

    // ── Step 4: React to auth state changes (login, logout, token refresh) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH_PROVIDER] onAuthStateChange: ${event}`);

      if (event === 'SIGNED_OUT') {
        clearAuth();
        localStorage.removeItem('token');
        document.cookie = 'placementai_role=; path=/; max-age=0; SameSite=Lax; Secure';
        document.cookie = 'placementai_profile_completed=; path=/; max-age=0; SameSite=Lax; Secure';
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('placementai:auth-token-updated'));
        setShowTimeoutWarning(false);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      } else {
        setAuth(session?.user ?? null, session);
        if (session) {
          await syncBackend(session);
          setupSessionTimer(session);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <span className="text-xl font-bold">⚠️</span>
              </div>
              <div>
                <h4 className="font-heading font-black text-slate-900 text-sm uppercase tracking-wide">Session Expiring Soon</h4>
                <p className="text-[10px] text-slate-500 mt-1">For your security, inactive sessions expire automatically.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Your session will expire in 2 minutes. Would you like to refresh your session and stay signed in?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  const { data, error } = await supabase.auth.refreshSession();
                  if (!error && data.session) {
                    setupSessionTimer(data.session);
                    setShowTimeoutWarning(false);
                  }
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 text-xs font-bold transition-all cursor-pointer"
              >
                Stay Signed In
              </button>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  setShowTimeoutWarning(false);
                }}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-10 text-xs font-bold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
