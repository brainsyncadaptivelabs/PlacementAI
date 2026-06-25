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
      if (localStorage.getItem("token")) return; // already synced

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
        const mockToken = `${header}.${payload}.signature`;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const response = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: mockToken,
            role: "STUDENT"
          })
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("role", data.role);
          // Dispatch a custom event to notify any listeners that the token is now available
          window.dispatchEvent(new Event("storage"));
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
          localStorage.removeItem("role");
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
