"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Mic2,
  MessageSquare,
  User,
  Briefcase,
  Users,
  BarChart3,
  Target,
  type LucideIcon,
} from "lucide-react";

type BottomNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const STUDENT_ITEMS: BottomNavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resume", href: "/dashboard/ats", icon: FileText },
  { label: "Interview", href: "/mock-interview", icon: Mic2 },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const RECRUITER_ITEMS: BottomNavItem[] = [
  { label: "Home", href: "/recruiter", icon: LayoutDashboard },
  { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Candidates", href: "/recruiter/candidates", icon: Users },
  { label: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
  { label: "Settings", href: "/recruiter/settings", icon: Target },
];

const PLACEMENT_OFFICER_ITEMS: BottomNavItem[] = [
  { label: "Dashboard", href: "/placement-officer", icon: LayoutDashboard },
  { label: "Students", href: "/placement-officer/students", icon: Users },
  { label: "Drives", href: "/placement-officer/drives", icon: Briefcase },
  { label: "Analytics", href: "/placement-officer/analytics", icon: BarChart3 },
  { label: "Profile", href: "/placement-officer/settings", icon: User },
];

const ITEMS_BY_ROLE: Record<string, BottomNavItem[]> = {
  STUDENT: STUDENT_ITEMS,
  RECRUITER: RECRUITER_ITEMS,
  PLACEMENT_OFFICER: PLACEMENT_OFFICER_ITEMS,
};

interface BottomNavProps {
  role: "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = ITEMS_BY_ROLE[role] || STUDENT_ITEMS;

  const isActive = (href: string) => {
    // Exact match for root paths, prefix match for sub-paths
    const segments = href.split("/").filter(Boolean);
    const isRoot = segments.length <= 1;
    return isRoot ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
  };

  return (
    <nav
      className="mobile-bottom-nav md:hidden"
      aria-label="Mobile navigation"
      role="navigation"
    >
      <div className="mobile-bottom-nav-inner">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? "active" : ""}`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Active pill indicator */}
              <span className="nav-dot" aria-hidden="true" />

              {/* Icon */}
              <Icon
                className="nav-icon"
                aria-hidden="true"
                strokeWidth={active ? 2.5 : 1.8}
              />

              {/* Label */}
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
