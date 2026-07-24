"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Sun, Moon, Bell, WifiOff, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/search-bar";
import { UserNav } from "@/components/dashboard/user-nav";
import { Sidebar } from "./Sidebar";
import { useUser } from "@/hooks/use-user";
import { useAuthStore } from '@/store/auth-store';
import { getDashboardRouteForRole, getProfileCompletionRouteForRole, normalizeRole } from "@/lib/auth-routes";

interface AppLayoutProps {
  children: React.ReactNode;
  role: "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN";
}

export function AppLayout({ children, role }: AppLayoutProps) {
  const { user, loading, error, mutate } = useUser();
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const session = useAuthStore((state) => state.session);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine Route Guard State Machine State
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isInitializing = isAuthLoading;
  const isTokenSyncPending = !isAuthLoading && !!session && !token;
  const isProfileLoading = !isAuthLoading && !!token && !user && loading;
  const isAuthError = !isAuthLoading && !user && !loading && !!error;
  const isUnauthenticated = !isAuthLoading && !user && !loading && !error && !token && !session;
  
  React.useEffect(() => {
    if (isInitializing || isTokenSyncPending || isProfileLoading || isAuthError) {
      return; // Do not redirect during loading, sync, or network errors
    }

    if (isUnauthenticated) {
      if (role === "RECRUITER") {
        router.push("/auth/recruiter");
      } else if (role === "PLACEMENT_OFFICER") {
        router.push("/auth/placement-officer");
      } else {
        router.push("/auth");
      }
      return;
    }

    if (user) {
      if (!user.profileCompleted) {
        const targetRoute = getProfileCompletionRouteForRole(user.role);
        if (pathname !== targetRoute) {
          router.push(targetRoute);
        }
        return;
      }

      // Role check & mismatch resolution
      const userRole = normalizeRole(user.role);
      const targetRole = normalizeRole(role);
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== targetRole) {
        const correctDashboard = getDashboardRouteForRole(user.role);
        router.push(correctDashboard);
        return;
      }
    }
  }, [user, isInitializing, isTokenSyncPending, isProfileLoading, isAuthError, isUnauthenticated, pathname, router, role]);

  const isWorkspaceMode = pathname?.includes('/resume-builder/editor');
  const isChatMode = pathname === '/dashboard/chat' || pathname === '/dashboard/chatbot';

  if (isInitializing || isTokenSyncPending || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isAuthError) {
    const errorStr = String(error || "");
    let errorTitle = "Connection Problem";
    let errorMessage = "We are having trouble communicating with the PlacementAI servers. Your session is active, but we couldn't load your profile.";

    if (errorStr.includes("401")) {
      errorTitle = "Session Expired";
      errorMessage = "Authentication expired or invalid PlacementAI token. Please sign in again.";
    } else if (errorStr.includes("403")) {
      errorTitle = "Access Denied";
      errorMessage = "Access denied / role authorization problem. You do not have permission to view this dashboard.";
    } else if (errorStr.includes("404")) {
      errorTitle = "Route Not Found";
      errorMessage = "Profile endpoint routing problem (404). The server could not locate the profile path.";
    } else if (errorStr.includes("500")) {
      errorTitle = "Server Error";
      errorMessage = "PlacementAI server profile error (500). Please contact support if this persists.";
    } else if (errorStr.includes("CORS") || errorStr.toLowerCase().includes("cors")) {
      errorTitle = "Configuration Problem";
      errorMessage = "Production API/CORS configuration problem. The request origin is not allowed by the backend.";
    } else if (errorStr.includes("Backend unavailable") || errorStr.includes("Failed to fetch")) {
      errorTitle = "Connection Problem";
      errorMessage = "We are having trouble communicating with the PlacementAI servers. The backend service appears to be down.";
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6 text-center">
        <div className="p-4 bg-destructive/10 rounded-full text-destructive">
          <WifiOff className="w-12 h-12" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black font-heading tracking-tight">{errorTitle}</h2>
          <p className="text-muted-foreground text-sm">
            {errorMessage}
          </p>
          {error && <p className="text-xs text-destructive bg-destructive/5 py-1 px-3 rounded-lg border border-destructive/10 font-mono mt-2">{error}</p>}
        </div>
        <Button onClick={() => mutate()} className="font-black px-6 h-12 rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
        </Button>
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
        <Sidebar role={role} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          {!isChatMode && (
            <header className="h-16 flex items-center justify-between px-8 bg-background border-b border-border/40 shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger />
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

