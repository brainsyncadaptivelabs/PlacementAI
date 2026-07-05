"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/search-bar";
import { UserNav } from "@/components/dashboard/user-nav";
import { Sidebar } from "./Sidebar";
import { useUser } from "@/hooks/use-user";
import { useAuthStore } from '@/store/auth-store';

interface AppLayoutProps {
  children: React.ReactNode;
  role: "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN";
}

export function AppLayout({ children, role }: AppLayoutProps) {
  const { user, loading } = useUser();
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  React.useEffect(() => {
    if (loading || isAuthLoading) return;

    if (!user) {
      if (role === "RECRUITER") {
        router.push("/auth/recruiter");
      } else if (role === "PLACEMENT_OFFICER") {
        router.push("/auth/placement-officer");
      } else {
        router.push("/auth");
      }
      return;
    }

    if (!user.profileCompleted) {
      if (user.role === "RECRUITER") {
        router.push("/complete-profile/recruiter");
      } else if (user.role === "PLACEMENT_OFFICER") {
        router.push("/complete-profile/placement-officer");
      } else if (user.role === "STUDENT") {
        router.push("/complete-profile/student");
      } else {
        router.push("/auth");
      }
      return;
    }

    if (!user.planSelected) {
      router.push("/plans");
      return;
    }
    // Prevent cross-role access (e.g., STUDENT trying to access RECRUITER dashboard)
    // Note: ADMIN and SUPER_ADMIN can bypass this restriction
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== role) {
      if (user.role === "RECRUITER") {
        router.push("/recruiter");
      } else if (user.role === "PLACEMENT_OFFICER") {
        router.push("/placement-officer");
      } else if (user.role === "STUDENT") {
        router.push("/dashboard");
      } else {
        router.push("/auth");
      }
      return;
    }
  }, [user, loading, isAuthLoading, pathname, router, role]);

  const isWorkspaceMode = pathname?.includes('/resume-builder/editor');
  const isChatMode = pathname === '/dashboard/chat' || pathname === '/dashboard/chatbot';

  if (loading || isAuthLoading) {
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
      <div 
        className={`flex min-h-screen w-full bg-background transition-colors duration-300 ${role === "PLACEMENT_OFFICER" ? "theme-placement-officer" : ""}`}
        style={{ "--accent": role === "RECRUITER" ? "#832838" : undefined } as React.CSSProperties}
      >
        <Sidebar role={role} hasPlan={user.planSelected} />
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
                   onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                   className="text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                   title="Toggle Theme"
                 >
                   {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <Moon className="w-5 h-5" />}
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
