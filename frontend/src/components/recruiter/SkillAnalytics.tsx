import React from "react";
import { TrendingUp, BarChart2, Shield } from "lucide-react";

export function SkillAnalytics() {
  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Skill Distribution Analytics</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Statistical candidate skill density indices across branches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Top Core Tech Stack</span>
          <div className="text-xl font-bold text-indigo-400">Java Spring Boot</div>
          <p className="text-[10px] text-muted-foreground">42% of CSE candidates verified</p>
        </div>

        <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Highest Growth Skill</span>
          <div className="text-xl font-bold text-emerald-400">Docker Containers</div>
          <p className="text-[10px] text-muted-foreground">Shortlist rate increase: +18%</p>
        </div>

        <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Skill Gap Alert</span>
          <div className="text-xl font-bold text-rose-400">AWS DevOps</div>
          <p className="text-[10px] text-muted-foreground">Required by 3 active job postings</p>
        </div>
      </div>
    </div>
  );
}
