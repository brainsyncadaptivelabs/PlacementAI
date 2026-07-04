import React from "react";
import { Award, Sparkles, Target } from "lucide-react";

export function Achievements() {
  const badges = [
    { name: "Java Master", desc: "Understand threading & GC parameters.", unlocked: true, icon: Award, color: "text-amber-500" },
    { name: "Resume Expert", desc: "Tailor sections for Amazon matching.", unlocked: true, icon: Sparkles, color: "text-indigo-400" },
    { name: "DSA Champion", desc: "Solve 5 O(N) array loops challenges.", unlocked: false, icon: Target, color: "text-slate-500" }
  ];

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Candidate Badges & Milestones</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border flex gap-3.5 items-center transition-all ${
              b.unlocked 
                ? "bg-slate-950/40 border-border/80 hover:border-indigo-500/20" 
                : "bg-slate-950/10 border-dashed border-border/30 text-slate-500"
            }`}>
              <div className={`w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center border border-border/40 ${b.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-100">{b.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{b.desc}</p>
                <span className="text-[8px] uppercase font-bold tracking-wider text-indigo-400 block mt-1">{b.unlocked ? "Unlocked ✓" : "Locked"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
