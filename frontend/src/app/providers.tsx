"use client";

import type React from "react";
import { AuthProvider } from "@/providers/auth-provider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
