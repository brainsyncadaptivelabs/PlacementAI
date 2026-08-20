"use client";

import React, { useEffect } from "react";
import ErrorState from "@/components/errors/ErrorState";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log technical error details strictly in development
    if (process.env.NODE_ENV === "development") {
      console.error("[PlacementAI App ErrorBoundary Caught]:", error);
    }
  }, [error]);

  return (
    <ErrorState
      type="generic"
      title="Something Went Wrong"
      description="We couldn't load this page correctly. Please try again."
      onRetry={reset}
      primaryActionText="Try Again"
    />
  );
}
