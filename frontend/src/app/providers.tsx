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
    const handleInvalid = (e: Event) => {
      e.preventDefault();
    };
    document.addEventListener("invalid", handleInvalid, true);
    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
    };
  }, []);

  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}

