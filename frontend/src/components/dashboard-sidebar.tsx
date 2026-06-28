"use client";

import * as React from "react";
import Link from "next/link";
import { SearchBar } from './search-bar';
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Sun, Moon } from "lucide-react";
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
  Search,
  Bell,
  History,
  Scale,
  Target,
  Zap,
  MessageSquare,
  CreditCard,
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
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { UserNav } from "./dashboard/user-nav";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const planSelected = user?.planSelected;

  const menuItems = [];
  if (planSelected) {
    menuItems.push(
      { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
      { title: "Resume Builder", icon: FileText, url: "/dashboard/resume-builder" },
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
      { title: "Analytics", icon: BarChart3, url: "/dashboard/analytics" }
    );
  } else {
    // Empty array if no plan selected, the dashboard shell will redirect to /plans
  }

  const settingsItems = [
    { title: "Settings", icon: Settings, url: "/dashboard/settings" }
  ];

  return (
    <Sidebar className="bg-sidebar border-r border-border">
      <SidebarHeader className="h-[80px] w-full flex items-center justify-center shrink-0 p-0">
        <Link 
          href={planSelected ? "/dashboard" : "/plans"} 
          className="h-full w-[90%] flex items-center justify-center gap-3 m-auto p-0 scale-75 origin-center transition-opacity duration-200 hover:opacity-85"
        >
          <div className="w-[54px] h-[54px] bg-primary rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 shrink-0">
            <span className="text-2xl">A</span>
          </div>
          <span className="font-heading font-semibold text-[30px] tracking-tighter text-foreground leading-none whitespace-nowrap">
            AI Placement
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                className="hover:bg-muted transition-colors py-6"
                tooltip={item.title}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${pathname === item.url ? 'text-primary font-semibold' : 'text-foreground'}`}>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="mt-8 mb-2 px-3">
          <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Account</span>
        </div>
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                className="hover:bg-muted transition-colors py-6"
                tooltip={item.title}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${pathname === item.url ? 'text-primary font-semibold' : 'text-foreground'}`}>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/auth" />} className="hover:bg-destructive/10 hover:text-destructive transition-colors py-6">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    if (!user.profileCompleted) {
      if (user.role === "RECRUITER") {
        router.push("/complete-profile/recruiter");
      } else {
        router.push("/complete-profile/student");
      }
      return;
    }

    if (!user.planSelected) {
      router.push("/plans");
      return;
    }
  }, [user, loading, pathname, router]);

  const isWorkspaceMode = pathname?.includes('/resume-builder/editor');
  const isChatMode = pathname === '/dashboard/chat' || pathname === '/dashboard/chatbot';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isWorkspaceMode) {
    return (
      <div className="min-h-screen w-full bg-background">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          {!isChatMode && (
            <header className="h-16 flex items-center justify-between px-8 bg-background border-b border-border/40 shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="md:hidden" />
                <SearchBar />
              </div>
              <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                   className="text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                   title="Toggle Theme"
                 >
                   {mounted ? (theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />) : <Sun className="w-5 h-5" />}
                 </Button>
                 <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                 </Button>
                 <UserNav />
              </div>
            </header>
          )}
          <div className="flex-1 overflow-hidden relative">
             {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
