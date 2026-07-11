"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { roleMenus, studentMenuGroups } from "@/config/menu-config";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarProps {
  role: "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const menuItems = (roleMenus[role] || []);

  const handleItemClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      let logoutPath = "/auth";
      if (role === "RECRUITER") logoutPath = "/auth/recruiter";
      else if (role === "PLACEMENT_OFFICER") logoutPath = "/auth/placement-officer";
      else if (role === "ADMIN" || role === "SUPER_ADMIN") logoutPath = "/admin";
      
      router.push(logoutPath);
    }
  };

  const basePath = role === "STUDENT" ? "/dashboard" : `/${role.toLowerCase().replace('_', '-')}`;
  const settingsItems = [
    { title: "Settings", icon: Settings, url: `${basePath}/settings` }
  ];

  return (
    <ShadcnSidebar 
      collapsible="icon"
      style={{ 
        "--sidebar": role === "RECRUITER" ? "var(--recruiter-sidebar)" : undefined,
        "--sidebar-foreground": role === "RECRUITER" ? "var(--recruiter-sidebar-foreground)" : undefined,
        "--sidebar-accent": role === "RECRUITER" ? "#832838" : undefined,
        "--sidebar-accent-foreground": role === "RECRUITER" ? "#ffffff" : undefined
      } as React.CSSProperties}
      className={role === "RECRUITER" ? "border-r-0 dark:border-r dark:border-border" : "border-r border-border"}
    >
      <SidebarHeader className="h-[80px] w-full flex items-center justify-center shrink-0 p-0">
        <Link 
          href={(roleMenus[role]?.[0]?.url || "/")} 
          className="h-full w-[90%] flex items-center justify-center gap-3 m-auto p-0 scale-75 origin-center transition-opacity duration-200 hover:opacity-85"
        >
          <div className={role === "RECRUITER" 
            ? "w-[54px] h-[54px] bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shrink-0" 
            : "w-[54px] h-[54px] bg-primary rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 shrink-0"}>
            <span className="text-2xl">A</span>
          </div>
          <span className={`font-heading font-semibold text-[30px] tracking-tighter leading-none whitespace-nowrap ${role === "RECRUITER" ? "text-white dark:text-foreground" : "text-foreground"}`}>
            AI Placement
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4 overflow-y-auto space-y-4">
        {role === "STUDENT" ? (
          studentMenuGroups.map((group, idx) => (
            <div key={group.title || idx} className="space-y-1">
              {group.title && (
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                    {group.title}
                  </span>
                </div>
              )}
              <SidebarMenu>
                {group.items.map((item) => {
                  const isRootUrl = item.url.split('/').length <= 2;
                  const isActive = isRootUrl 
                    ? pathname === item.url 
                    : (pathname === item.url || pathname.startsWith(item.url + '/'));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={item.comingSoon ? <button className="cursor-not-allowed opacity-80" /> : <Link href={item.url} onClick={handleItemClick} />}
                        isActive={isActive}
                        className="hover:bg-muted transition-colors py-6 flex items-center justify-between w-full"
                        tooltip={item.title}
                        onClick={handleItemClick}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`}>{item.title}</span>
                        </div>
                        {item.comingSoon && (
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-600 dark:text-gray-400 bg-indigo-50 dark:bg-gray-800/50 border border-indigo-100 dark:border-gray-700 rounded-full shrink-0">
                            Soon
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))
        ) : (
          <SidebarMenu>
            {menuItems.map((item) => {
              const isRootUrl = item.url.split('/').length <= 2;
              const isActive = isRootUrl 
                ? pathname === item.url 
                : (pathname === item.url || pathname.startsWith(item.url + '/'));
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} onClick={handleItemClick} />}
                    isActive={isActive}
                    className={role === "RECRUITER" 
                      ? `py-6 transition-colors rounded-xl ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90' : 'text-white/70 dark:text-sidebar-foreground/70 hover:bg-white/5 dark:hover:bg-sidebar-accent hover:text-white dark:hover:text-sidebar-accent-foreground'}`
                      : "hover:bg-muted transition-colors py-6"}
                    tooltip={item.title}
                    onClick={handleItemClick}
                  >
                    <item.icon className={`w-5 h-5 ${role === "RECRUITER" ? (isActive ? 'text-white dark:text-sidebar-accent-foreground' : 'text-white/70 dark:text-sidebar-foreground/70') : (isActive ? 'text-primary' : 'text-muted-foreground')}`} />
                    <span className={`font-medium ${role === "RECRUITER" ? (isActive ? 'text-white dark:text-sidebar-accent-foreground font-semibold' : 'text-white/70 dark:text-sidebar-foreground/70') : (isActive ? 'text-primary font-semibold' : 'text-foreground')}`}>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
        
        {role !== "STUDENT" && menuItems.length > 0 && (
          <>
            <div className="mt-8 mb-2 px-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${role === "RECRUITER" ? "text-white/50 dark:text-muted-foreground/70" : "text-muted-foreground/70"}`}>Account</span>
            </div>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} onClick={handleItemClick} />}
                      isActive={isActive}
                      className={role === "RECRUITER" 
                        ? `py-6 transition-colors rounded-xl ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90' : 'text-white/70 dark:text-sidebar-foreground/70 hover:bg-white/5 dark:hover:bg-sidebar-accent hover:text-white dark:hover:text-sidebar-accent-foreground'}`
                        : "hover:bg-muted transition-colors py-6"}
                      tooltip={item.title}
                      onClick={handleItemClick}
                    >
                      <item.icon className={`w-5 h-5 ${role === "RECRUITER" ? (isActive ? 'text-white dark:text-sidebar-accent-foreground' : 'text-white/70 dark:text-sidebar-foreground/70') : (isActive ? 'text-primary' : 'text-muted-foreground')}`} />
                      <span className={`font-medium ${role === "RECRUITER" ? (isActive ? 'text-white dark:text-sidebar-accent-foreground font-semibold' : 'text-white/70 dark:text-sidebar-foreground/70') : (isActive ? 'text-primary font-semibold' : 'text-foreground')}`}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              render={<button />} 
              className={role === "RECRUITER" 
                ? "hover:bg-white/10 dark:hover:bg-sidebar-accent hover:text-white dark:hover:text-sidebar-accent-foreground text-white/70 dark:text-sidebar-foreground/70 transition-colors py-6 rounded-xl"
                : "hover:bg-destructive/10 hover:text-destructive transition-colors py-6"}
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}
