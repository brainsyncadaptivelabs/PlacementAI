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
          <h2 className="text-xl font-bold text-slate-900">Daily Coaching Missions</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Complete today&apos;s tasks to level up your placement readiness.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold shadow-xs">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span>Active Streak: 4 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {missions.map((m) => (
          <div key={m.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-w-0 overflow-hidden ${
            m.completed 
              ? "bg-slate-50/80 border-emerald-200 text-slate-400 shadow-xs" 
              : "bg-white border-slate-200/90 text-slate-900 shadow-xs hover:shadow-md hover:border-indigo-300"
          }`}>
            <div className="min-w-0">
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                  m.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  m.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>{m.difficulty}</span>
                <span className="text-[10px] text-slate-500 font-semibold shrink-0">{m.duration}</span>
              </div>
              <h3 className={`text-xs font-bold leading-snug mt-1.5 break-words ${m.completed ? "line-through text-slate-400" : "text-slate-900"}`}>{m.title}</h3>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-2 truncate">Impact: {m.impact}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 gap-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 shrink-0">
                <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>+{m.xp} XP</span>
              </div>
              <button 
                onClick={() => toggleComplete(m.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border shrink-0 ${
                  m.completed 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-xs"
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
