"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force Light Mode for the entire Resume Builder module
  const { theme, setTheme } = useTheme();
  const originalThemeRef = useRef<string | undefined>(theme);
  
  useEffect(() => {
    // Only force light mode if it's not already light
    if (originalThemeRef.current !== "light") {
      setTheme("light");
    }

    // Restore original theme only when leaving the Resume Builder
    return () => {
      if (originalThemeRef.current && originalThemeRef.current !== "light") {
        setTheme(originalThemeRef.current);
      }
    };
  }, [setTheme]);

  return <>{children}</>;
}
