"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Mic2,
  Map,
  BookOpen,
  Code2,
  Brain,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  History,
  Scale,
  Target,
  Zap,
  MessageSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Resume & ATS", icon: FileText, url: "/dashboard/ats" },
  { title: "Resume History", icon: History, url: "/dashboard/history" },
  { title: "Compare Resumes", icon: Scale, url: "/dashboard/compare" },
  { title: "JD Matching", icon: Target, url: "/dashboard/jd-match" },
  { title: "Skill Gap Analysis", icon: Zap, url: "/dashboard/skills" },
  { title: "Mock Interviews", icon: Mic2, url: "/dashboard/mock-interviews" },
  { title: "Career Roadmap", icon: Map, url: "/dashboard/roadmap" },
  { title: "AI Chatbot", icon: MessageSquare, url: "/dashboard/chat" },
  { title: "Notes", icon: BookOpen, url: "/dashboard/notes" },
  { title: "Coding Practice", icon: Code2, url: "/dashboard/coding" },
  { title: "Aptitude", icon: Brain, url: "/dashboard/aptitude" },
  { title: "Analytics", icon: BarChart3, url: "/dashboard/analytics" },
];

const secondaryItems = [
  { title: "Profile", icon: User, url: "/dashboard/profile" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link className="flex items-center gap-2" href="/">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-heading font-bold text-lg tracking-tight">AI Placement</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="hover:bg-slate-100 transition-colors py-6"
                tooltip={item.title}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-primary' : 'text-slate-500'}`} />
                  <span className={`font-medium ${pathname === item.url ? 'text-primary font-semibold' : 'text-slate-600'}`}>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="mt-8 mb-2 px-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</span>
        </div>
        <SidebarMenu>
          {secondaryItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className="hover:bg-slate-100 transition-colors py-6"
                tooltip={item.title}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-primary' : 'text-slate-500'}`} />
                  <span className={`font-medium ${pathname === item.url ? 'text-primary font-semibold' : 'text-slate-600'}`}>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-red-50 hover:text-red-600 transition-colors py-6">
              <Link href="/auth" className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search anything..." 
                  className="pl-10 bg-slate-100 border-none h-10 w-full focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" className="relative text-slate-500">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </Button>
               <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900 leading-none">Shreya Singh</p>
                    <p className="text-xs text-slate-500 mt-1">Free Plan</p>
                  </div>
                  <Avatar className="w-9 h-9 border-2 border-primary/10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>SS</AvatarFallback>
                  </Avatar>
               </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
             {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
