import React from "react";
import { BriefcaseBusiness, GraduationCap } from "lucide-react";

interface WorkspaceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function WorkspaceTabs({ activeTab, onTabChange }: WorkspaceTabsProps) {
  const tabs = ["Chat", "Coach", "Recruiter", "TPO", "Resume"];
  return (
    <div className="flex border-b border-slate-200 bg-slate-100/80 px-6 py-2 select-none shrink-0 gap-1.5">
      {tabs.map((tab) => {
        const isActive = activeTab.toLowerCase() === tab.toLowerCase();
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab.toLowerCase())}
            className={`px-4.5 py-1.5 rounded-full text-xs font-extrabold tracking-tight transition-all cursor-pointer ${
              isActive
                ? "bg-white border border-slate-300 text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
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
