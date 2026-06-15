"use client";

import React, { memo } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface Event {
  company: string;
  type: string;
  date: string;
  time: string;
  color: string;
}

interface UpcomingEventsProps {
  events?: Event[];
}

const UpcomingEvents = memo(({ events }: UpcomingEventsProps) => {
  const displayEvents = events && events.length > 0 ? events : [];

  return (
    <Card className="bg-white">
       <div className="flex items-center justify-between mb-8">
          <div>
             <CardTitle className="text-md font-bold font-heading">Upcoming Events</CardTitle>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next 48 Hours</p>
          </div>
          <Calendar className="w-5 h-5 text-slate-300" />
       </div>
       <div className="space-y-4">
          {displayEvents.length > 0 ? (
            displayEvents.map((event, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-neutral-100 group cursor-pointer hover:bg-slate-100/80 transition-all duration-300">
                  <div className={`w-1 h-12 rounded-full ${event.color || 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-black text-slate-900 truncate">{event.company}</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{event.type}</p>
                     <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                           <Clock className="w-3 h-3 text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500">{event.time}</span>
                        </div>
                        <Badge className="bg-white border-transparent text-slate-600 text-[9px] font-black">{event.date}</Badge>
                     </div>
                  </div>
               </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400 font-medium">No upcoming events</p>
            </div>
          )}
       </div>
       <Button variant="outline" className="w-full mt-6 rounded-xl text-xs font-black uppercase tracking-[0.2em] h-12 border-neutral-100 hover:bg-slate-50">
          Full Schedule
       </Button>
    </Card>
  );
});

UpcomingEvents.displayName = "UpcomingEvents";

export default UpcomingEvents;
