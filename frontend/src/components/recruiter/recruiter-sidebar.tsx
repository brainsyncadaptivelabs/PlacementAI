"use client";

import React from "react";
import { AppLayout } from "../layout/AppLayout";
import { Sidebar } from "../layout/Sidebar";

export function RecruiterSidebar() {
  return <Sidebar role="RECRUITER" />;
}

export function RecruiterDashboardShell({ children }: { children: React.ReactNode }) {
  return <AppLayout role="RECRUITER">{children}</AppLayout>;
}
