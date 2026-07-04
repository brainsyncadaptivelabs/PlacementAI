import React, { useState } from "react";
import { Award, Target, Flame, Zap, CheckCircle } from "lucide-react";

export type Mission = {
  id: string;
  title: string;
  duration: string;
  xp: number;
  difficulty: "Easy" | "Medium" | "Hard";
  impact: string;
  completed: boolean;
};

export function DailyCoach() {
  const [missions, setMissions] = useState<Mission[]>([
    { id: "m-1", title: "Refactor experience bullets into STAR structure", duration: "15 mins", xp: 100, difficulty: "Medium", impact: "+5% ATS Score", completed: false },
    { id: "m-2", title: "Complete Spring Security basics mock quiz", duration: "10 mins", xp: 50, difficulty: "Easy", impact: "+2% Readiness", completed: false },
    { id: "m-3", title: "Implement O(N) array matching puzzle on LeetCode", duration: "25 mins", xp: 150, difficulty: "Hard", impact: "+8% Coding Score", completed: false }
  ]);

  const toggleComplete = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Coaching Missions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Complete today's tasks to level up your placement readiness.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold">
          <Flame className="w-3.5 h-3.5" />
          <span>Active Streak: 4 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {missions.map((m) => (
          <div key={m.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            m.completed 
              ? "bg-slate-900/40 border-emerald-500/30 text-slate-400" 
              : "bg-slate-900 border-border/80 text-slate-200 hover:border-indigo-500/40"
          }`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  m.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500" :
                  m.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                }`}>{m.difficulty}</span>
                <span className="text-[10px] text-muted-foreground font-semibold">{m.duration}</span>
              </div>
              <h3 className={`text-xs font-bold leading-snug mt-1.5 ${m.completed ? "line-through" : "text-slate-100"}`}>{m.title}</h3>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-2">Impact: {m.impact}</p>
            </div>

            <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-4">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-100">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>+{m.xp} XP</span>
              </div>
              <button 
                onClick={() => toggleComplete(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  m.completed 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{m.completed ? "Done" : "Complete"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
