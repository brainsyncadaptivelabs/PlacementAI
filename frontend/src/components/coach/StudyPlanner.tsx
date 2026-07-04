import React, { useState } from "react";
import { Calendar, Target, BookOpen, Clock } from "lucide-react";

export function StudyPlanner() {
  const [activePlan, setActivePlan] = useState<"daily" | "weekly" | "monthly">("daily");

  const plans = {
    daily: [
      { task: "Practice 3 DSA Array puzzles", duration: "45m", icon: Target },
      { task: "Tailor profile for Amazon application checklist", duration: "20m", icon: BookOpen }
    ],
    weekly: [
      { task: "Complete 1 Mock Technical Session", duration: "1.5h", icon: Clock },
      { task: "Review SOLID rules compliance inside controller", duration: "1h", icon: Target }
    ],
    monthly: [
      { task: "Hit 85% placement readiness score", duration: "Ongoing", icon: Calendar },
      { task: "Complete portfolio project architectures", duration: "10h", icon: BookOpen }
    ]
  };

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study Plan Dashboard</h2>
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl">
          {["daily", "weekly", "monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setActivePlan(p as any)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activePlan === p ? "bg-slate-900 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {plans[activePlan].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-border/10 rounded-xl hover:border-indigo-500/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">{item.task}</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.duration}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
