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
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">Placement Path Milestones</h2>
      <div className="flex flex-col gap-4 relative ml-3 pl-6 border-l-2 border-indigo-200">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-start gap-3 relative min-w-0">
            <div className="absolute -left-[33px] mt-0.5">
              {s.status === "complete" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 bg-white rounded-full shrink-0" />
              ) : s.status === "active" ? (
                <Circle className="w-4 h-4 text-indigo-600 bg-white rounded-full animate-pulse shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 bg-white rounded-full shrink-0" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-xs font-bold break-words leading-tight ${s.status === 'complete' ? 'text-slate-500' : s.status === 'active' ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>{s.label}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 break-words leading-tight">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
