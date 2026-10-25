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
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Study Plan Dashboard</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          {["daily", "weekly", "monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setActivePlan(p as any)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activePlan === p ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
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
            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-indigo-300 transition-all shadow-2xs min-w-0 overflow-hidden">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800 break-words leading-tight">{item.task}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 uppercase shrink-0">{item.duration}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
