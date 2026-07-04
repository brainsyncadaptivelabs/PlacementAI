import React from "react";
import { ArrowUpRight, TrendingUp, Sparkles, BookOpen } from "lucide-react";

export function WeeklyReview() {
  return (
    <div className="p-6 bg-slate-900 border border-border/85 rounded-2xl space-y-4">
      <div className="flex justify-between items-start border-b border-border/20 pb-4">
        <div>
          <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">AI Coach Insights</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Weekly Performance Review</h2>
          <p className="text-xs text-muted-foreground">Summarized feedback on your activity from Jun 28 - Jul 04.</p>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-xs">
          <TrendingUp className="w-4 h-4" />
          <span>+12% Readiness</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Achievements */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Key Strengths Developed</span>
          </h3>
          <ul className="space-y-2 text-xs font-medium text-slate-350">
            <li className="flex items-start gap-2">• Optimized code complexity loops on Linear Search projects.</li>
            <li className="flex items-start gap-2">• Fixed NullPointerException error compiler stack trace.</li>
            <li className="flex items-start gap-2">• Starred/pinned target resume tailoring configurations.</li>
          </ul>
        </div>

        {/* Areas of Focus */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Improvement Recommendations</span>
          </h3>
          <ul className="space-y-2 text-xs font-medium text-slate-350">
            <li className="flex items-start gap-2">• Integrate missing Docker & Cloud keywords in project logs.</li>
            <li className="flex items-start gap-2">• Complete remaining 2 mock behavioral interview sets.</li>
            <li className="flex items-start gap-2">• Refactor SQL raw concatenations to parametrized query blocks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
