"use client";

import React from "react";
import ErrorState from "@/components/errors/ErrorState";

export default function MaintenancePage() {
  const handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <ErrorState
      type="maintenance"
      code="503"
      title="PlacementAI is temporarily unavailable"
      description="We're making improvements to the platform. Please check back shortly."
      onRetry={handleRefresh}
      primaryActionText="Refresh"
      showDashboardButton={false}
      showHomeButton={false}
    />
  );
}
