"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function PlacementOfficerLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout role="PLACEMENT_OFFICER">{children}</AppLayout>;
}
