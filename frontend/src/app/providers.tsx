"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastContainer } from "@/components/ui/toast-container";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Purge stale Supabase tokens from dead projects in localStorage to prevent GoTrue retry loops
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes("glyvbdltoxjpwlzsbcyx") || (key.startsWith("sb-") && key.endsWith("-auth-token")))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }

    const handleInvalid = (e: Event) => {
      e.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || '');
      const name = event?.reason?.name || '';
      const strReason = String(event?.reason || '');
      const isAuthError = Boolean(
        event?.reason?.__isAuthError ||
        name.includes('Auth') ||
        strReason.includes('Auth') ||
        strReason.includes('AuthRetryableFetchError')
      );
      if (
        isAuthError ||
        msg.includes('Failed to fetch') ||
        msg.includes('fetch failed') ||
        name.includes('FetchError') ||
        (event?.reason?.name === 'TypeError' && msg.includes('fetch'))
      ) {
        console.warn('[Global] Suppressed unhandled network/auth error:', event.reason);
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      const strErr = String(event?.error || '');
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('AuthRetryableFetchError') ||
        strErr.includes('AuthRetryableFetchError')
      ) {
        console.warn('[Global] Suppressed global network/auth error:', event.message);
        event.preventDefault();
      }
    };

    document.addEventListener("invalid", handleInvalid, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}

