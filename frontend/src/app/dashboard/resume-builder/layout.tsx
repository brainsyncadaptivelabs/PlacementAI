"use client";

import React from "react";
import { FeatureGuard } from "@/components/auth/FeatureGuard";

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGuard featureKey="RESUME_TAILORING" featureTitle="Resume Builder & Tailoring">
      {children}
    </FeatureGuard>
  );
}
