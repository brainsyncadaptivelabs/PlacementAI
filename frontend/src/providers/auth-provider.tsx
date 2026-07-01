'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const syncBackend = async (session: any) => {
      if (!session?.user) return;

      // Check if we have a valid, unexpired token for the current user
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const parts = existingToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const email = payload.sub || payload.email;
            const exp = payload.exp;
            // Token is valid if it matches user email and has at least 60 seconds left before expiration
            if (email === session.user.email && exp && (exp * 1000) > (Date.now() + 60000)) {
              return; // already synced and token is valid
            }
          }
        } catch (e) {
          console.warn("Failed to parse existing JWT token, will re-sync:", e);
        }
      }

      try {
        const base64UrlEncode = (str: string) => {
          return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        };
        const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = base64UrlEncode(JSON.stringify({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email
        }));
        const mockToken = `${header}.${payload}.${base64UrlEncode("signature")}`;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const requestedRole = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('role')
        : null;
      const validRoles = ["STUDENT", "RECRUITER", "PLACEMENT_OFFICER", "ADMIN", "SUPER_ADMIN"];
      const role = requestedRole && validRoles.includes(requestedRole) ? requestedRole : undefined;

      const requestBody: any = {
          idToken: mockToken,
          provider: session.user.app_metadata?.provider || "google"
        };
      if (role) {
        requestBody.role = role;
      }
      console.log(`[AUTH_SYNC] POST ${API_URL}/auth/google`, requestBody);
        
        const response = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        
        console.log(`[AUTH_SYNC] Response Status Code: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[AUTH_SYNC] Success. JWT: ${data.accessToken}, User Role: ${data.role}`);
          localStorage.setItem("token", data.accessToken);
          if (typeof window !== 'undefined' && window.history.replaceState) {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.delete('role');
            const cleanUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            window.history.replaceState(null, '', cleanUrl);
          }
          // Dispatch a custom event to notify any listeners that the token is now available
          window.dispatchEvent(new Event("storage"));
        } else {
          try {
            const errText = await response.text();
            console.error(`[AUTH_SYNC] Sync failed. Response body: ${errText}`);
          } catch (_) {
            console.error(`[AUTH_SYNC] Sync failed without response body.`);
          }
        }
      } catch (err) {
        console.error("Backend auth sync failed:", err);
      }
    };

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        clearAuth();
        return;
      }

      setAuth(session?.user ?? null, session);
      if (session) {
        await syncBackend(session);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (log in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearAuth();
          localStorage.removeItem("token");
        } else {
          setAuth(session?.user ?? null, session);
          if (session) {
            await syncBackend(session);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, supabase.auth]);

  return <>{children}</>;
}
