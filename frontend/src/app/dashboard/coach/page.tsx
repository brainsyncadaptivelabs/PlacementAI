"use client";

import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useConversationManager } from "@/components/chat/useConversationManager";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { CoachHome } from "@/components/coach/CoachHome";
import { NotificationCenter } from "@/components/workspace/NotificationCenter";

export default function CoachPage() {
  const { user, loading } = useUser();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewChat,
    deleteChat,
    togglePin,
    toggleStar,
    toggleArchive,
    renameChat,
    duplicateChat
  } = useConversationManager();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-card">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen min-h-screen flex bg-transparent relative overflow-hidden">
      {/* Premium Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          router.push("/dashboard/chat");
        }}
        onCreate={() => {
          createNewChat();
          router.push("/dashboard/chat");
        }}
        onDelete={deleteChat}
        onTogglePin={togglePin}
        onToggleStar={toggleStar}
        onToggleArchive={toggleArchive}
        onRename={renameChat}
        onDuplicate={duplicateChat}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d1117] text-slate-100">
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border/40 bg-card/85 backdrop-blur-md sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden mr-1 text-muted-foreground hover:text-foreground" />
            <h1 className="text-[16px] font-bold text-foreground tracking-tight">Placement Coach</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationsOpen(prev => !prev)}
              className="p-2 rounded-xl text-muted-foreground/70 hover:text-indigo-400 hover:bg-slate-900 transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>
            <button 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Workspace tabs bar */}
        <WorkspaceTabs activeTab="coach" onTabChange={(tab) => {
          if (tab === "chat") {
            router.push("/dashboard/chat");
          }
        }} />

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          <CoachHome />
        </div>
      </div>
    </div>
  );
}
