import React from "react";
import { Users, FileText, CheckCircle2, Award, ArrowUpRight } from "lucide-react";

export function RecruiterDashboard() {
  const stats = [
    { label: "Active Jobs", val: "8", icon: FileText, color: "text-indigo-400" },
    { label: "Total Candidates", val: "240", icon: Users, color: "text-indigo-500" },
    { label: "New Applications", val: "34", icon: ArrowUpRight, color: "text-emerald-400" },
    { label: "Shortlisted", val: "18", icon: CheckCircle2, color: "text-amber-500" }
  ];

  return (
    <div className="space-y-6 select-none text-left">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-4 bg-slate-900 border border-border/80 rounded-2xl flex flex-col justify-between hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <Icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div className="text-3xl font-black text-white mt-2">{s.val}</div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendations Funnel */}
      <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">AI Candidate Matching Recommendations</h2>
        <div className="space-y-2.5">
          <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl flex justify-between items-center hover:border-indigo-500/20 transition-all">
            <div>
              <span className="text-[9px] uppercase font-bold text-indigo-400 block">SDE Internship Match</span>
              <h3 className="text-xs font-bold text-slate-100">Aditya Roy - 96% Match score (Tuned for Java Backend)</h3>
            </div>
            <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">Invite to Assessment</button>
          </div>

          <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl flex justify-between items-center hover:border-indigo-500/20 transition-all">
            <div>
              <span className="text-[9px] uppercase font-bold text-indigo-400 block">Cloud Architect Match</span>
              <h3 className="text-xs font-bold text-slate-100">Rhea Sen - 92% Match score (Docker/AWS Certifications)</h3>
            </div>
            <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">Invite to Assessment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
