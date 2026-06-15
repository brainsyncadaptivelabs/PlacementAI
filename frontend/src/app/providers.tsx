"use client";

import type React from "react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simply render children. We will move the GoogleOAuthProvider 
  // ONLY into the AuthPage to isolate its lifecycle.
  return (
    <>
      {children}
    </>
  );
}
