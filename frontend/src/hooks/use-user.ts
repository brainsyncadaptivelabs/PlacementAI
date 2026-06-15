import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';

export type UserProfile = {
  fullName: string;
  email: string;
  role: string;
  collegeName: string;
  branch: string;
  graduationYear: number;
  profileImage: string | null;
  plan?: string;
  paymentStatus?: string;
  createdAt?: string;
};

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/profile');
        setUser(response.data);
      } catch (err: unknown) {
        console.error('Failed to fetch user profile', err);
        setError(getErrorMessage(err, 'Failed to load profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
