"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "next-themes";
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}

