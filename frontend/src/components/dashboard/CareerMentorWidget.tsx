"use client";

import React, { memo } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CareerMentorWidgetProps {
  onOpenChat: () => void;
}

const CareerMentorWidget = memo(({ onOpenChat }: CareerMentorWidgetProps) => {
  return (
    <Card className="bg-primary text-white relative overflow-hidden rounded-[2rem] border-transparent shadow-md">
       <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
             <div className="p-3 bg-card/20 rounded-2xl backdrop-blur-md">
                <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
             <h4 className="text-xl font-bold font-heading leading-tight mb-2">Ask your Career Mentor</h4>
             <p className="text-xs text-white/77 leading-relaxed font-medium">Get instant advice on salary negotiation, resume tips, or company culture.</p>
          </div>
          <div className="bg-card/10 border border-transparent rounded-2xl p-4 cursor-pointer hover:bg-card/20 transition-all group" onClick={onOpenChat}>
             <p className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors italic">&quot;How should I explain my gap year to an Amazon recruiter?&quot;</p>
          </div>
          <Button className="w-full bg-card text-primary hover:bg-muted font-black h-12 rounded-xl shadow-md" onClick={onOpenChat}>
             Open AI Chat
          </Button>
       </div>
       <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-card/10 rounded-full blur-3xl" />
    </Card>
  );
});

CareerMentorWidget.displayName = "CareerMentorWidget";

export default CareerMentorWidget;
