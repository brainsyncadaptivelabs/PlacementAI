import React from "react";
import { CheckCircle2, Circle, ArrowDown } from "lucide-react";

export function PlacementTimeline() {
  const steps = [
    { label: "Resume Checklist Analysis", status: "complete", desc: "ATS keyword mapping done." },
    { label: "Spring Boot Controller SOLID checks", status: "active", desc: "Reviewing dependency injection rules." },
    { label: "TCS Prep Mock Interview", status: "pending", desc: "Scheduled for Friday." },
    { label: "Final Portfolio Deployment", status: "pending", desc: "Bridge projects checklist." }
  ];

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Placement Path Milestones</h2>
      <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-indigo-500/20">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-start gap-3 relative">
            <div className="absolute -left-[25px] mt-0.5">
              {s.status === "complete" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-slate-900 rounded-full" />
              ) : s.status === "active" ? (
                <Circle className="w-4 h-4 text-indigo-500 bg-slate-900 rounded-full animate-pulse" />
              ) : (
                <Circle className="w-4 h-4 text-slate-700 bg-slate-900 rounded-full" />
              )}
            </div>
            <div>
              <h3 className={`text-xs font-bold ${s.status === 'complete' ? 'text-slate-400' : 'text-slate-100'}`}>{s.label}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
