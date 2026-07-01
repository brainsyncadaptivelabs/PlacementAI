"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { roleMenus } from "@/config/menu-config";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface SidebarProps {
  role: "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN";
  hasPlan?: boolean;
}

export function Sidebar({ role, hasPlan = true }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const menuItems = hasPlan ? (roleMenus[role] || []) : [];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      router.push("/auth");
    }
  };

  const settingsItems = [
    { title: "Settings", icon: Settings, url: `/${role.toLowerCase().replace('_', '-')}/settings` }
  ];

  return (
    <ShadcnSidebar className="bg-sidebar border-r border-border">
      <SidebarHeader className="h-[80px] w-full flex items-center justify-center shrink-0 p-0">
        <Link 
          href={hasPlan ? (roleMenus[role]?.[0]?.url || "/") : "/plans"} 
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
                isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                className="hover:bg-muted transition-colors py-6"
                tooltip={item.title}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.url || pathname.startsWith(item.url + '/') ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${pathname === item.url || pathname.startsWith(item.url + '/') ? 'text-primary font-semibold' : 'text-foreground'}`}>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        {menuItems.length > 0 && (
          <>
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
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} render={<button />} className="hover:bg-destructive/10 hover:text-destructive transition-colors py-6">
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
