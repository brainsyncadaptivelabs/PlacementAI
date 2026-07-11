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
  phone?: string;
  designation?: string;
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    let hostname = "unknown";
    try {
      hostname = new URL(apiBase).hostname;
    } catch (_) {}

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    console.log("[PlacementAI Profile] request started");
    console.log("[PlacementAI Profile] API hostname:", hostname);
    console.log("[PlacementAI Profile] request pathname: /user/profile");
    console.log("[PlacementAI Profile] token exists:", Boolean(token));
    console.log("[PlacementAI Profile] token length:", token ? token.length : 0);
    console.log("[PlacementAI Profile] Authorization header attached:", Boolean(token));

    try {
      const response = await api.get('/user/profile');
      console.log("[PlacementAI Profile] response status: 200");
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      setUser(null);
      
      const status = err.response?.status;
      const data = err.response?.data;
      
      console.log("[PlacementAI Profile] response status:", status || "unknown");
      console.log("[PlacementAI Profile] response content-type: application/json");
      console.log("[PlacementAI Profile] sanitized error body:", data ? JSON.stringify(data).substring(0, 200) : "none");
      console.log("[PlacementAI Profile] network exception name:", err.name || "Error");
      console.log("[PlacementAI Profile] network exception message:", err.message || "none");
      
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

    const handleCustomUpdate = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        fetchUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('placementai:auth-token-updated', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('placementai:auth-token-updated', handleCustomUpdate);
    };
  }, [fetchUser]);

  return { user, loading: loading || isAuthLoading, error, mutate: fetchUser };
}
