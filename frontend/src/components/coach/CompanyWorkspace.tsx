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
    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Company Prep Workspaces</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Target candidate parameters for dream jobs.</p>
        </div>
        <select 
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold outline-none cursor-pointer hover:border-slate-400 focus:border-indigo-500 shadow-2xs"
        >
          {Object.keys(companies).map(k => (
            <option key={k} value={k} className="bg-white text-slate-900">{k}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness card */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-col justify-between shadow-2xs min-w-0 overflow-hidden">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Company Readiness</span>
            <div className="text-3xl font-black text-indigo-600">{current.readiness}%</div>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${current.readiness}%` }} />
          </div>
        </div>

        {/* Steps card */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2.5 shadow-2xs min-w-0 overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Milestones Tracker</span>
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
            {current.steps.map((s, idx) => (
              <li key={idx} className="flex items-start gap-1.5 min-w-0">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span className="break-words leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations card */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2.5 shadow-2xs min-w-0 overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>AI Coach Fix List</span>
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
            {current.recommendations.map((r, idx) => (
              <li key={idx} className="flex items-start gap-1.5 min-w-0">
                <span className="text-amber-600 font-bold shrink-0">•</span>
                <span className="break-words leading-snug">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
