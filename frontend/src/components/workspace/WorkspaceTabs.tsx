import React from "react";
import { BriefcaseBusiness, GraduationCap } from "lucide-react";

interface WorkspaceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function WorkspaceTabs({ activeTab, onTabChange }: WorkspaceTabsProps) {
  const tabs = ["Chat", "Coach", "Recruiter", "TPO", "Resume"];
  return (
    <div className="flex border-b border-border/40 bg-muted/40 px-6 py-2 select-none shrink-0 gap-1.5">
      {tabs.map((tab) => {
        const isActive = activeTab.toLowerCase() === tab.toLowerCase();
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab.toLowerCase())}
            className={`px-4.5 py-1.5 rounded-full text-xs font-extrabold tracking-tight transition-all cursor-pointer ${
              isActive
                ? "bg-background border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "Recruiter" && <BriefcaseBusiness className="w-3 h-3 inline mr-1.5" />}
            {tab}
          </button>
        );
      })}
    </div>
  );
}
