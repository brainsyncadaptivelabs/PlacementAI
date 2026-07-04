import React from "react";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

export function InterviewJourney() {
  const steps = [
    { label: "Resume Selection", active: false, done: true },
    { label: "Online Assessment (OA)", active: true, done: false },
    { label: "Technical Interview", active: false, done: false },
    { label: "HR / Managerial Round", active: false, done: false },
    { label: "Offer Details", active: false, done: false }
  ];

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Interview Journey Tracker</h2>
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              s.active ? "bg-indigo-600/10 border-indigo-500/30 text-white" :
              s.done ? "bg-slate-950/40 border-border/10 text-slate-400" : "bg-slate-950/10 border-border/5 text-slate-600"
            }`}>
              {s.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className={`w-4 h-4 ${s.active ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`} />
              )}
              <span className="text-xs font-bold">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
