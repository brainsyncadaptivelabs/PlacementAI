import React from "react";
import { Award, Sparkles, Target } from "lucide-react";

export function Achievements() {
  const badges = [
    { name: "Java Master", desc: "Understand threading & GC parameters.", unlocked: true, icon: Award, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "Resume Expert", desc: "Tailor sections for Amazon matching.", unlocked: true, icon: Sparkles, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { name: "DSA Champion", desc: "Solve 5 O(N) array loops challenges.", unlocked: false, icon: Target, color: "text-slate-400 bg-slate-100 border-slate-200" }
  ];

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Candidate Badges & Milestones</h2>
      <div className="flex flex-col gap-2.5">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div key={idx} className={`p-3 rounded-xl border flex gap-3 items-center transition-all min-w-0 overflow-hidden ${
              b.unlocked 
                ? "bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 shadow-2xs" 
                : "bg-slate-50/40 border-dashed border-slate-300 text-slate-500"
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${b.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{b.name}</h3>
                  <span className={`text-[9px] uppercase font-bold tracking-wider shrink-0 px-2 py-0.5 rounded ${b.unlocked ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {b.unlocked ? "Unlocked ✓" : "Locked"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 break-words leading-tight">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
