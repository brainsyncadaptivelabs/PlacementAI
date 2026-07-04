import React, { useState } from "react";
import { Plus, Edit, Archive, Folder } from "lucide-react";

export type JobRole = {
  id: string;
  title: string;
  applicantsCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  matchRate: number;
};

export function JobManager() {
  const [jobs, setJobs] = useState<JobRole[]>([
    { id: "j-1", title: "Java Backend Developer Intern", applicantsCount: 45, difficulty: "Medium", matchRate: 92 },
    { id: "j-2", title: "React Frontend Engineer", applicantsCount: 18, difficulty: "Easy", matchRate: 85 },
    { id: "j-3", title: "AWS Cloud Operations Associate", applicantsCount: 22, difficulty: "Hard", matchRate: 78 }
  ]);

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Job Postings</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Define target parameters and view AI candidate match ratios.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" />
          <span>Create Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {jobs.map((j) => (
          <div key={j.id} className="p-4 bg-slate-950/40 border border-border/10 rounded-xl flex flex-col justify-between hover:border-indigo-500/20 transition-all">
            <div>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                j.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500" :
                j.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
              }`}>{j.difficulty} Hiring</span>
              <h3 className="text-xs font-bold text-slate-100 mt-2">{j.title}</h3>
              <p className="text-[9px] text-indigo-400 font-bold mt-1.5">Avg Match Rate: {j.matchRate}%</p>
            </div>

            <div className="flex justify-between items-center border-t border-border/25 pt-3 mt-4">
              <span className="text-[9px] text-muted-foreground font-semibold">{j.applicantsCount} applicants</span>
              <div className="flex gap-1.5">
                <button className="p-1 rounded bg-slate-900 text-muted-foreground hover:text-white transition-colors cursor-pointer">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded bg-slate-900 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
