import { DashboardShell } from "@/components/dashboard-sidebar";
import { ResumeBuilderSessionProvider } from "@/providers/ResumeBuilderSessionProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResumeBuilderSessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </ResumeBuilderSessionProvider>
  );
}
