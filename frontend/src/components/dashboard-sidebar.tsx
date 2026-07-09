"use client";

import React from "react";
import { AppLayout } from "./layout/AppLayout";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <AppLayout role="STUDENT">{children}</AppLayout>;
}
