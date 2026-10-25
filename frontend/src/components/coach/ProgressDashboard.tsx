import React from "react";
import { TrendingUp, Award, Clock, Code, Shield } from "lucide-react";

export function ProgressDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Placement Readiness Metrics</h2>
          <p className="text-xs text-slate-500 font-medium">Detailed score overview and learning trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness index */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all min-w-0 overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Readiness Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <div className="text-3xl font-black text-indigo-600 mt-2">78%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: "78%" }} />
          </div>
        </div>

        {/* ATS Score */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all min-w-0 overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">ATS Score</span>
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">72/100</div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 truncate">Tuned for SDE internships</p>
        </div>

        {/* Coding Score */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all min-w-0 overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Coding Progress</span>
            <Code className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2 truncate">8/12 <span className="text-xs text-slate-500 font-bold">Modules</span></div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 truncate">4 sections pending</p>
        </div>

        {/* Mock Interviews */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all min-w-0 overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Mock Sessions</span>
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-2 truncate">3/5 <span className="text-xs text-slate-500 font-bold">Done</span></div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 truncate">Target: 5 mock sets</p>
        </div>
      </div>
    </div>
  );
}
