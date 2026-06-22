'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
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
    };

    initializeAuth();

    // Listen for changes on auth state (log in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearAuth();
        } else {
          setAuth(session?.user ?? null, session);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth, supabase.auth]);

  return <>{children}</>;
}
