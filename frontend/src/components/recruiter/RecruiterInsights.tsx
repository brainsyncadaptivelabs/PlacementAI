import React from "react";
import { Sparkles, TrendingUp, HelpCircle } from "lucide-react";

export function RecruiterInsights() {
  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>AI Recruiter Insights</span>
      </h2>
      
      <div className="space-y-2">
        <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-1">
          <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hidden Talent Detected</span>
          </div>
          <p className="text-[11px] text-slate-350 leading-relaxed">
            Candidate Rhea Sen shows exponential improvement in mock session analytics: coding metrics jumped by 24% this week.
          </p>
        </div>

        <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-1">
          <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Interview Recommendation</span>
          </div>
          <p className="text-[11px] text-slate-350 leading-relaxed">
            Shortlist Kabir Khan for cloud intern vacancy. Candidate holds 90% ATS match scores.
          </p>
        </div>
      </div>
    </div>
  );
}
