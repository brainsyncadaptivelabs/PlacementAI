"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "next-themes";

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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

