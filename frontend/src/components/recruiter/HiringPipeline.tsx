import React from "react";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

export function HiringPipeline() {
  const stages = [
    { label: "Application Screening", count: 45, status: "complete" },
    { label: "Technical Assessment", count: 18, status: "active" },
    { label: "Final Panel Interviews", count: 6, status: "pending" },
    { label: "Offer Issuance", count: 3, status: "pending" }
  ];

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Recruitment Funnel</h2>
      <div className="flex flex-wrap items-center gap-3">
        {stages.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              s.status === "active" ? "bg-indigo-600/10 border-indigo-500/30 text-white" :
              s.status === "complete" ? "bg-slate-950/40 border-border/10 text-slate-400" : "bg-slate-950/10 border-border/5 text-slate-600"
            }`}>
              <div className="text-xs font-bold">{s.label}</div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                s.status === "active" ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
              }`}>{s.count} candidates</span>
            </div>
            {idx < stages.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
