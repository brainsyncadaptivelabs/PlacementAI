import { RecruiterDashboardShell } from "@/components/recruiter/recruiter-sidebar";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <RecruiterDashboardShell>{children}</RecruiterDashboardShell>;
}
