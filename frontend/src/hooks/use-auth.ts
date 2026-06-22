import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Provider } from '@supabase/supabase-js';

export const useAuth = () => {
  const { user, session, isAuthenticated, isLoading, clearAuth } = useAuthStore();
  const supabase = createClient();

  const signInWithProvider = async (provider: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
