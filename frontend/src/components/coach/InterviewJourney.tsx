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
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none space-y-4 overflow-hidden">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">My Interview Journey Tracker</h2>
      <div className="flex flex-wrap items-center gap-2.5">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 transition-all min-w-0 shrink-0 ${
              s.active ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-bold shadow-xs" :
              s.done ? "bg-emerald-50/70 border-emerald-200 text-slate-800 font-semibold" : 
              "bg-slate-50 border-slate-200 text-slate-500 font-medium"
            }`}>
              {s.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className={`w-4 h-4 shrink-0 ${s.active ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
              )}
              <span className="text-xs truncate">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
