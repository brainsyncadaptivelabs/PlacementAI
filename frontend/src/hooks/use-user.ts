import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/auth-store';

export type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  collegeName: string;
  branch: string;
  graduationYear: number;
  dateOfBirth?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  leetcodeUrl?: string;
  profileImage: string | null;
  profileCompleted?: boolean;
  planSelected?: boolean;
  paymentCompleted?: boolean;
  plan?: string;
  paymentStatus?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  autoSave?: boolean;
  profileVisible?: boolean;
  twoFactorEnabled?: boolean;
  language?: string;
  skills?: string;
  phone?: string;
  designation?: string;
  createdAt?: string;
  authProvider?: 'LOCAL' | 'GOOGLE' | 'GITHUB';
};

interface ProfileState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchPromise: Promise<UserProfile> | null;
  fetchUser: (force?: boolean) => Promise<UserProfile>;
  setUser: (user: UserProfile | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Centered Zustand store to cache and deduplicate user profile requests across the app
export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  fetchPromise: null,
  fetchUser: async (force = false) => {
    if (!force) {
      if (get().fetchPromise) {
        return get().fetchPromise!;
      }
      if (get().user) {
        return get().user!;
      }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ user: null, loading: false, error: null });
      return null as any;
    }

    const promise = (async () => {
      try {
        const response = await api.get('/user/profile');
        set({ user: response.data, error: null, loading: false });
        return response.data;
      } catch (err: any) {
        set({ user: null, error: getErrorMessage(err, 'Failed to load profile'), loading: false });
        throw err;
      } finally {
        set({ fetchPromise: null });
      }
    })();

    set({ fetchPromise: promise, loading: true });
    return promise;
  },
  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));

export function useUser() {
  const session = useAuthStore((state) => state.session);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  
  const user = useProfileStore((state) => state.user);
  const loading = useProfileStore((state) => state.loading);
  const error = useProfileStore((state) => state.error);
  const fetchUser = useProfileStore((state) => state.fetchUser);

  const forceRefresh = useCallback(async () => {
    await fetchUser(true);
  }, [fetchUser]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (!session) {
        useProfileStore.setState({ user: null, error: null, loading: false });
      } else {
        useProfileStore.setState({ loading: true });
      }
      return;
    }

    fetchUser();
  }, [session, isAuthLoading, fetchUser]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'token') return;
      if (event.newValue) {
        fetchUser(true);
      } else {
        useProfileStore.setState({ user: null, loading: false });
      }
    };

    const handleCustomUpdate = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        fetchUser(true);
      } else {
        useProfileStore.setState({ user: null, loading: false });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('placementai:auth-token-updated', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('placementai:auth-token-updated', handleCustomUpdate);
    };
  }, [fetchUser]);

  return { user, loading: loading || isAuthLoading, error, mutate: forceRefresh };
}
