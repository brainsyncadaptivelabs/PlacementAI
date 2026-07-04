import React from "react";
import { User, FileText, Target, Award } from "lucide-react";

export function CandidateProfile() {
  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex items-center gap-3 border-b border-border/20 pb-3.5">
        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-indigo-400 border border-border/30">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-100">Aditya Roy</h2>
          <span className="text-[10px] text-muted-foreground font-semibold">CSE Candidate • CGPA: 9.1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ATS Score & Fit */}
        <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-2">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI Match Summary</span>
          </span>
          <div className="text-xl font-bold text-emerald-500">96% Job Fit Score</div>
          <p className="text-[10px] text-slate-350 leading-relaxed">
            Strong alignment with backend requirements. Candidate has built multiple Spring Boot architectures, thread-safe caches, and handled compiler error stacks efficiently.
          </p>
        </div>

        {/* Skill gaps */}
        <div className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-2">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Skill Gap Analysis</span>
          </span>
          <div className="text-xs font-semibold text-slate-200">Missing Key Technologies</div>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-[9px] font-semibold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">Docker</span>
            <span className="text-[9px] font-semibold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">AWS Cloud</span>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">Recommend technical round assessment focusing on cloud operations.</p>
        </div>
      </div>
    </div>
  );
}
