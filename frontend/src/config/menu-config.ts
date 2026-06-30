import {
  LayoutDashboard,
  FileText,
  Mic2,
  Map,
  Code2,
  Brain,
  BarChart3,
  History,
  Scale,
  Target,
  Zap,
  MessageSquare,
  BookOpen,
  Briefcase,
  Users,
  Search,
  Building,
  GraduationCap
} from "lucide-react";

export type MenuItem = {
  title: string;
  icon: any;
  url: string;
};

export const studentMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Resume Builder", icon: FileText, url: "/dashboard/resume-builder" },
  { title: "Resume & ATS", icon: FileText, url: "/dashboard/ats" },
  { title: "Resume History", icon: History, url: "/dashboard/history" },
  { title: "Compare Resumes", icon: Scale, url: "/dashboard/compare" },
  { title: "JD Matching", icon: Target, url: "/dashboard/jd-match" },
  { title: "Skill Gap Analysis", icon: Zap, url: "/dashboard/skills" },
  { title: "Mock Interviews", icon: Mic2, url: "/mock-interview" },
  { title: "Career Roadmap", icon: Map, url: "/dashboard/roadmap" },
  { title: "AI Chatbot", icon: MessageSquare, url: "/dashboard/chat" },
  { title: "Notes", icon: BookOpen, url: "/dashboard/notes" },
  { title: "Coding Practice", icon: Code2, url: "/dashboard/coding" },
  { title: "Aptitude", icon: Brain, url: "/dashboard/aptitude" },
  { title: "Analytics", icon: BarChart3, url: "/dashboard/analytics" }
];

export const recruiterMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/recruiter" },
  { title: "Jobs", icon: Briefcase, url: "/recruiter/jobs" },
  { title: "Candidate Explorer", icon: Users, url: "/recruiter/candidates" },
  { title: "Search Candidates", icon: Search, url: "/recruiter/search" },
  { title: "Hiring Pipeline", icon: Map, url: "/recruiter/pipeline" },
  { title: "Interview Replay", icon: Mic2, url: "/recruiter/interviews" },
  { title: "Coding Reports", icon: Code2, url: "/recruiter/coding" },
  { title: "ATS Reports", icon: FileText, url: "/recruiter/ats-reports" },
  { title: "Analytics", icon: BarChart3, url: "/recruiter/analytics" },
  { title: "Company Profile", icon: Building, url: "/recruiter/company" }
];

export const placementOfficerMenu: MenuItem[] = [
  { title: "College Dashboard", icon: LayoutDashboard, url: "/placement-officer" },
  { title: "Departments", icon: Building, url: "/placement-officer/departments" },
  { title: "Placement Drives", icon: Briefcase, url: "/placement-officer/drives" },
  { title: "Eligible Students", icon: GraduationCap, url: "/placement-officer/eligible" },
  { title: "Company Readiness", icon: Target, url: "/placement-officer/readiness" },
  { title: "Placement Probability", icon: Zap, url: "/placement-officer/probability" },
  { title: "Analytics", icon: BarChart3, url: "/placement-officer/analytics" },
  { title: "Reports", icon: FileText, url: "/placement-officer/reports" },
  { title: "Recruiters", icon: Users, url: "/placement-officer/recruiters" },
  { title: "Students", icon: Users, url: "/placement-officer/students" }
];

export const roleMenus: Record<string, MenuItem[]> = {
  STUDENT: studentMenu,
  RECRUITER: recruiterMenu,
  PLACEMENT_OFFICER: placementOfficerMenu,
};
