import React from "react";
import { Flame, Award, Zap } from "lucide-react";

export function HabitTracker() {
  const habits = [
    { name: "LeetCode Daily Puzzle", done: true, streak: 5 },
    { name: "Resume tailoring check", done: true, streak: 3 },
    { name: "Mock interviews practicing", done: false, streak: 0 },
    { name: "Communication pitch recording", done: true, streak: 2 }
  ];

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Habit Streaks Tracker</h2>
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">+300 XP Total</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {habits.map((h, idx) => (
          <div key={idx} className="p-3.5 bg-slate-950/40 border border-border/10 rounded-xl flex justify-between items-center hover:border-indigo-500/20 transition-all">
            <div>
              <h3 className="text-xs font-bold text-slate-100">{h.name}</h3>
              <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground font-semibold">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>{h.streak} day streak</span>
              </div>
            </div>
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
              h.done ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-500"
            }`}>{h.done ? "Completed" : "Pending"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
