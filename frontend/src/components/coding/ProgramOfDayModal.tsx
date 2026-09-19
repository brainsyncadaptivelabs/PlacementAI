"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Sparkles, Clock, ArrowRight, X } from "lucide-react";
import { ProgramOfDayData } from "./ProgramOfDayCard";

interface ProgramOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (problemId: number) => void;
  data: ProgramOfDayData | null;
}

export default function ProgramOfDayModal({
  isOpen,
  onClose,
  onStart,
  data
}: ProgramOfDayModalProps) {
  if (!isOpen || !data || data.status === "COMPLETED") {
    return null;
  }

  const handleRemindLater = () => {
    onClose();
  };

  const handleStart = () => {
    onClose();
    onStart(data.problemId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[430px] p-6 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-950 border border-purple-500/40 text-white rounded-2xl shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-3 py-0.5 text-xs shadow-sm">
              <Flame className="w-3.5 h-3.5 mr-1 fill-white text-white animate-pulse" /> PROGRAM OF THE DAY
            </Badge>

            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" /> Daily Reset Active
            </span>
          </div>

          <DialogTitle className="text-xl font-black text-white pt-1">
            Your Daily Coding Challenge is Waiting 🔥
          </DialogTitle>
        </DialogHeader>

        <div className="my-3 p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 space-y-2">
          <h4 className="text-lg font-extrabold text-purple-200 flex items-center gap-2">
            {data.title}
          </h4>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${
                data.difficulty?.toLowerCase() === "easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : data.difficulty?.toLowerCase() === "hard"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {data.difficulty}
            </span>

            {data.tags &&
              data.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground border border-border/50">
                  {t}
                </span>
              ))}
          </div>

          <p className="text-xs text-muted-foreground pt-1">
            Complete today's problem to maintain your <strong className="text-amber-400 font-bold">{data.currentStreak} day streak</strong> and keep progressing towards your 7-day reward!
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Start Challenge <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleRemindLater}
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-white py-2 rounded-xl border border-transparent hover:border-border/40"
          >
            Remind Me Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
