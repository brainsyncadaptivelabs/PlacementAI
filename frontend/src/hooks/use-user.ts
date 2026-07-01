import { useState, useEffect, useCallback } from 'react';
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
  createdAt?: string;
  authProvider?: 'LOCAL' | 'GOOGLE' | 'GITHUB';
};

export function useUser() {
  const session = useAuthStore((state) => state.session);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
      setError(null);
    } catch (err: unknown) {
      setUser(null);
      setError(getErrorMessage(err, 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (!session) {
        setUser(null);
        setError(null);
        setLoading(false);
      } else {
        // An authenticated Supabase session exists, but the backend JWT may still be synchronizing.
        setLoading(true);
      }
      return;
    }

    fetchUser();
  }, [session, isAuthLoading, fetchUser]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'token') return;
      if (event.newValue) {
        fetchUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchUser]);

  return { user, loading: loading || isAuthLoading, error, mutate: fetchUser };
}
