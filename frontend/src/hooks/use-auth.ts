import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Provider } from '@supabase/supabase-js';

export const useAuth = () => {
  const { user, session, isAuthenticated, isLoading, clearAuth } = useAuthStore();
  const supabase = createClient();

  const signInWithProvider = async (provider: Provider, role?: string) => {
    let origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.placementai.in';
    if (origin.includes('placementai.in') && !origin.includes('www.')) {
      origin = 'https://www.placementai.in';
    }
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearAuth();
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
