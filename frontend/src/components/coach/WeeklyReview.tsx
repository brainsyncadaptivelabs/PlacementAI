import React from "react";
import { ArrowUpRight, TrendingUp, Sparkles, BookOpen } from "lucide-react";

export function WeeklyReview() {
  return (
    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
      <div className="flex justify-between items-start border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">AI Coach Insights</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Weekly Performance Review</h2>
          <p className="text-xs text-slate-500 font-medium">Summarized feedback on your activity from Jun 28 - Jul 04.</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>+12% Readiness</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {/* Core Achievements */}
        <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 min-w-0 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Key Strengths Developed</span>
          </h3>
          <ul className="space-y-2 text-xs font-medium text-slate-700">
            <li className="flex items-start gap-2 min-w-0">
              <span className="text-indigo-600 font-bold leading-relaxed shrink-0">•</span>
              <span className="break-words leading-relaxed">Optimized code complexity loops on Linear Search projects.</span>
            </li>
            <li className="flex items-start gap-2 min-w-0">
              <span className="text-indigo-600 font-bold leading-relaxed shrink-0">•</span>
              <span className="break-words leading-relaxed">Fixed NullPointerException error compiler stack trace.</span>
            </li>
            <li className="flex items-start gap-2 min-w-0">
              <span className="text-indigo-600 font-bold leading-relaxed shrink-0">•</span>
              <span className="break-words leading-relaxed">Starred/pinned target resume tailoring configurations.</span>
            </li>
          </ul>
        </div>

        {/* Areas of Focus */}
        <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 min-w-0 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Improvement Recommendations</span>
          </h3>
          <ul className="space-y-2 text-xs font-medium text-slate-700">
            <li className="flex items-start gap-2 min-w-0">
              <span className="text-rose-600 font-bold leading-relaxed shrink-0">•</span>
              <span className="break-words leading-relaxed">Integrate missing Docker & Cloud keywords in project logs.</span>
            </li>
            <li className="flex items-start gap-2 min-w-0">
              <span className="text-rose-600 font-bold leading-relaxed shrink-0">•</span>
              <span className="break-words leading-relaxed">Complete remaining 2 mock behavioral interview sets.</span>
            </li>
            <li className="flex items-start gap-2 min-w-0">
              <span className="text-rose-600 font-bold leading-relaxed shrink-0">•</span>
              <span className="break-words leading-relaxed">Refactor SQL raw concatenations to parametrized query blocks.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
