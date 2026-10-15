"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type AuthContextType = {
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }).catch((err) => {
      console.warn('[AUTH_CONTEXT] getSession error:', err);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      });
      subscription = res?.data?.subscription;
    } catch (err) {
      console.warn('[AUTH_CONTEXT] onAuthStateChange setup error:', err);
      setIsLoading(false);
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch {}
      }
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
