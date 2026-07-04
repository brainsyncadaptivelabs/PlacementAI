import React, { useState } from "react";
import { Award, CheckCircle2, AlertCircle } from "lucide-react";

export type CompanyPrep = {
  name: string;
  readiness: number;
  steps: string[];
  recommendations: string[];
};

export function CompanyWorkspace() {
  const [selectedCompany, setSelectedCompany] = useState("Amazon");

  const companies: Record<string, CompanyPrep> = {
    Amazon: {
      name: "Amazon",
      readiness: 62,
      steps: ["Mock Interviews: 3/5 complete", "DSA: 76% score", "Leadership principles review: pending"],
      recommendations: ["Review space complexity sorting tricks", "Tailor experience bullet metrics focus"]
    },
    TCS: {
      name: "TCS",
      readiness: 85,
      steps: ["Mock Interviews: 4/5 complete", "DSA: 88% score", "Technical MCQ review: complete"],
      recommendations: ["Revise basic SQL constraint structures"]
    },
    Microsoft: {
      name: "Microsoft",
      readiness: 55,
      steps: ["Mock Interviews: 2/5 complete", "DSA: 60% score", "System design basics: pending"],
      recommendations: ["Practice large scale system design flows"]
    }
  };

  const current = companies[selectedCompany] || companies.Amazon;

  return (
    <div className="p-6 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Company Prep Workspaces</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Target candidate parameters for dream jobs.</p>
        </div>
        <select 
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="bg-slate-950 border border-border/50 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none"
        >
          {Object.keys(companies).map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness card */}
        <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Company Readiness</span>
            <div className="text-3xl font-black text-indigo-400">{current.readiness}%</div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${current.readiness}%` }} />
          </div>
        </div>

        {/* Steps card */}
        <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl space-y-2">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Milestones Tracker</span>
          </span>
          <ul className="space-y-1 text-xs text-slate-300">
            {current.steps.map((s, idx) => (
              <li key={idx}>• {s}</li>
            ))}
          </ul>
        </div>

        {/* Recommendations card */}
        <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl space-y-2">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Coach Fix List</span>
          </span>
          <ul className="space-y-1 text-xs text-slate-350">
            {current.recommendations.map((r, idx) => (
              <li key={idx}>• {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
