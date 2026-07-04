import React from "react";
import { TrendingUp, Award, Clock, Code, Shield } from "lucide-react";

export function ProgressDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-bold text-white">Placement Readiness Metrics</h2>
          <p className="text-xs text-muted-foreground">Detailed score overview and learning trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Readiness index */}
        <div className="p-4 bg-slate-900 border border-border/80 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Readiness Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400 mt-2">78%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-indigo-400 h-full rounded-full" style={{ width: "78%" }} />
          </div>
        </div>

        {/* ATS Score */}
        <div className="p-4 bg-slate-900 border border-border/80 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">ATS Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">72/100</div>
          <p className="text-[9px] text-muted-foreground font-semibold mt-3">Tuned for SDE internships</p>
        </div>

        {/* Coding Score */}
        <div className="p-4 bg-slate-900 border border-border/80 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Coding Progress</span>
            <Code className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500 mt-2">8/12 <span className="text-xs text-muted-foreground">Modules</span></div>
          <p className="text-[9px] text-muted-foreground font-semibold mt-3">4 sections pending</p>
        </div>

        {/* Mock Interviews */}
        <div className="p-4 bg-slate-900 border border-border/80 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Mock Sessions</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-indigo-500 mt-2">3/5 <span className="text-xs text-muted-foreground">Done</span></div>
          <p className="text-[9px] text-muted-foreground font-semibold mt-3">Target: 5 mock sets</p>
        </div>
      </div>
    </div>
  );
}
