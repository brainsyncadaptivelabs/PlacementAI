import React from "react";
import { Calendar, Clock, Video } from "lucide-react";

export function InterviewScheduler() {
  const events = [
    { title: "Technical Round 1 - Aditya Roy", time: "02:00 PM Today", type: "Video Call" },
    { title: "Managerial Round - Rhea Sen", time: "11:30 AM Tomorrow", type: "Video Call" }
  ];

  return (
    <div className="p-5 bg-slate-900 border border-border/80 rounded-2xl text-left select-none space-y-4">
      <div className="flex items-center gap-2 mb-2 border-b border-border/20 pb-3">
        <Calendar className="w-5 h-5 text-indigo-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">Interview Scheduler</h2>
      </div>

      <div className="space-y-2">
        {events.map((e, idx) => (
          <div key={idx} className="p-3 bg-slate-950/40 border border-border/10 rounded-xl flex justify-between items-center hover:border-indigo-500/20 transition-all">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-100">{e.title}</h3>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{e.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-indigo-400">
              <Video className="w-3.5 h-3.5" />
              <span>{e.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
