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
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-left select-none space-y-4">
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Habit Streaks Tracker</h2>
        <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 font-bold uppercase tracking-wider">+300 XP Total</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {habits.map((h, idx) => (
          <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex justify-between items-center hover:border-indigo-300 transition-all shadow-2xs min-w-0 overflow-hidden">
            <div className="min-w-0 flex-1 mr-3">
              <h3 className="text-xs font-bold text-slate-900 truncate">{h.name}</h3>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-600 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{h.streak} day streak</span>
              </div>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${
              h.done ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>{h.done ? "Completed" : "Pending"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
