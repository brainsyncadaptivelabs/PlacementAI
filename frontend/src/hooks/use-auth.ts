import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Provider } from '@supabase/supabase-js';

export const useAuth = () => {
  const { user, session, isAuthenticated, isLoading, clearAuth } = useAuthStore();
  const supabase = createClient();

  const signInWithProvider = async (provider: Provider, role?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const redirectUrl = `${origin}/auth/callback${role ? `?role=${encodeURIComponent(role)}` : ''}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account'
        }
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'placementai_role=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'placementai_profile_completed=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'placementai_plan_selected=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'placementai_payment_completed=; path=/; max-age=0; SameSite=Lax';
      }
      clearAuth();
    }
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    signInWithProvider,
    signOut,
  };
};
