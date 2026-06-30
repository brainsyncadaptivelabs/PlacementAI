"use client";

import React from "react";
import { AppLayout } from "./layout/AppLayout";
import { Sidebar } from "./layout/Sidebar";

export function AppSidebar() {
  return <Sidebar role="STUDENT" />;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <AppLayout role="STUDENT">{children}</AppLayout>;
}
