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
  Building,
  GraduationCap,
  Calendar,
  GitBranch,
  Search,
  Volume2,
  Sparkles,
  Settings
} from "lucide-react";

export type MenuItem = {
  title: string;
  icon: any;
  url: string;
  comingSoon?: boolean;
};

export const studentMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Resume Builder", icon: FileText, url: "/dashboard/resume-builder" },
  { title: "Resume & ATS", icon: FileText, url: "/dashboard/ats" },
  { title: "Resume History", icon: History, url: "/dashboard/history" },
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

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const studentMenuGroups: MenuGroup[] = [
  {
    title: "",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" }
    ]
  },
  {
    title: "RESUME",
    items: [
      { title: "Resume Builder", icon: FileText, url: "/dashboard/resume-builder" },
      { title: "Resume & ATS", icon: FileText, url: "/dashboard/ats" },
      { title: "Resume History", icon: History, url: "/dashboard/history" },
      { title: "JD Matching", icon: Target, url: "/dashboard/jd-match" }
    ]
  },
  {
    title: "PREPARATION",
    items: [
      { title: "Coding Practice", icon: Code2, url: "/dashboard/coding" },
      { title: "Aptitude", icon: Brain, url: "/dashboard/aptitude" },
      { title: "Communication Analysis", icon: Volume2, url: "/dashboard/communication", comingSoon: true },
      { title: "Mock Interviews", icon: Mic2, url: "/mock-interview" },
      { title: "Skill Gap Analysis", icon: Zap, url: "/dashboard/skills" },
      { title: "Career Roadmap", icon: Map, url: "/dashboard/roadmap" },
      { title: "Learning Hub", icon: BookOpen, url: "/dashboard/learning", comingSoon: true }
    ]
  },
  {
    title: "AI",
    items: [
      { title: "AI Chatbot", icon: MessageSquare, url: "/dashboard/chat" },
      { title: "AI Coach", icon: Sparkles, url: "/dashboard/coach", comingSoon: true }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { title: "Settings", icon: Settings, url: "/dashboard/settings" }
    ]
  }
];

export const recruiterMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/recruiter" },
  { title: "Jobs", icon: Briefcase, url: "/recruiter/jobs" },
  { title: "Candidates", icon: Users, url: "/recruiter/candidates" },
  { title: "Hiring Pipeline", icon: GitBranch, url: "/recruiter/pipeline" },
  { title: "Interviews", icon: Calendar, url: "/recruiter/interviews" },
  { title: "Analytics", icon: BarChart3, url: "/recruiter/analytics" },
  { title: "Company Workspace", icon: Building, url: "/recruiter/company" },
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
