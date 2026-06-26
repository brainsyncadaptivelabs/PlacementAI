import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';

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
};

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, mutate: fetchUser };
}
