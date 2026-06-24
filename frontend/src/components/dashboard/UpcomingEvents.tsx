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
    <Card className="bg-card">
       <div className="flex items-center justify-between mb-8">
          <div>
             <CardTitle className="text-md font-bold font-heading">Upcoming Events</CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Next 48 Hours</p>
          </div>
          <Calendar className="w-5 h-5 text-muted-foreground/50" />
       </div>
       <div className="space-y-4">
          {displayEvents.length > 0 ? (
            displayEvents.map((event, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted border border-border group cursor-pointer hover:bg-muted/80 transition-all duration-300">
                  <div className={`w-1 h-12 rounded-full ${event.color || 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-black text-foreground truncate">{event.company}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{event.type}</p>
                     <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                           <Clock className="w-3 h-3 text-muted-foreground/70" />
                           <span className="text-[10px] font-bold text-muted-foreground">{event.time}</span>
                        </div>
                        <Badge className="bg-card border-transparent text-muted-foreground text-[9px] font-black">{event.date}</Badge>
                     </div>
                  </div>
               </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground/70 font-medium">No upcoming events</p>
            </div>
          )}
       </div>
       <Button variant="outline" className="w-full mt-6 rounded-xl text-xs font-black uppercase tracking-[0.2em] h-12 border-border hover:bg-muted">
          Full Schedule
       </Button>
    </Card>
  );
});

UpcomingEvents.displayName = "UpcomingEvents";

export default UpcomingEvents;
