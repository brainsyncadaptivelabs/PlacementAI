import React, { useState } from "react";
import { Search, Sliders, CheckCircle2 } from "lucide-react";

export type StudentCandidate = {
  id: string;
  name: string;
  branch: string;
  cgpa: number;
  readiness: number;
  atsScore: number;
  skills: string[];
};

export function CandidateExplorer() {
  const [branchFilter, setBranchFilter] = useState("All");
  const [candidates, setCandidates] = useState<StudentCandidate[]>([
    { id: "c-1", name: "Aditya Roy", branch: "CSE", cgpa: 9.1, readiness: 78, atsScore: 84, skills: ["Java", "Spring Boot", "SQL"] },
    { id: "c-2", name: "Rhea Sen", branch: "ECE", cgpa: 8.8, readiness: 65, atsScore: 72, skills: ["React", "Node", "Docker"] },
    { id: "c-3", name: "Kabir Khan", branch: "CSE", cgpa: 8.5, readiness: 85, atsScore: 90, skills: ["Java", "Docker", "AWS"] }
  ]);

  const filtered = candidates.filter(c => 
    branchFilter === "All" || c.branch === branchFilter
  );

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Candidate Explorer</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Filter profiles based on skills, CGPA, and placement readiness.</p>
        </div>
        <select 
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="bg-slate-950 border border-border/50 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none"
        >
          <option value="All">All Branches</option>
          <option value="CSE">Computer Science (CSE)</option>
          <option value="ECE">Electronics (ECE)</option>
        </select>
      </div>

      <div className="space-y-2.5">
        {filtered.map((c) => (
          <div key={c.id} className="p-4 bg-slate-950/40 border border-border/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between hover:border-indigo-500/20 transition-all gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-100">{c.name} ({c.branch})</h3>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-semibold">
                <span>CGPA: {c.cgpa}</span>
                <span>•</span>
                <span>Placement Readiness: <strong className="text-indigo-400">{c.readiness}%</strong></span>
                <span>•</span>
                <span>ATS Match: <strong className="text-emerald-500">{c.atsScore}/100</strong></span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2.5">
                {c.skills.map((s) => (
                  <span key={s} className="text-[9px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <button className="px-3.5 py-1.5 bg-slate-900 border border-border hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer shrink-0">View Full Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}
