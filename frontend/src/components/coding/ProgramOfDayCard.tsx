"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, CheckCircle2, ArrowRight, Sparkles, Gift, Lock } from "lucide-react";
import { ProblemDto } from "@/app/dashboard/coding/page";

export interface ProgramOfDayData {
  id: number;
  problemId: number;
  title: string;
  difficulty: string;
  tags: string[];
  assignedDate: string;
  timezone: string;
  status: "PENDING" | "COMPLETED";
  secondsUntilReset: number;
  currentStreak: number;
  longestStreak: number;
  isRewardAvailable?: boolean;
  problem?: ProblemDto;
}

interface ProgramOfDayCardProps {
  data: ProgramOfDayData | null;
  onSolve: (problemId: number) => void;
  isLoading?: boolean;
}

export default function ProgramOfDayCard({ data, onSolve, isLoading }: ProgramOfDayCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(data?.secondsUntilReset || 0);

  useEffect(() => {
    if (!data?.secondsUntilReset) return;
    setTimeLeft(data.secondsUntilReset);

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.secondsUntilReset]);

  const formatCountdown = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !data) {
    return (
      <Card className="bg-card/40 backdrop-blur border-purple-500/30 animate-pulse p-6">
        <div className="h-6 bg-purple-900/30 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-purple-900/20 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-purple-900/10 rounded w-1/2"></div>
      </Card>
    );
  }

  const isCompleted = data.status === "COMPLETED";

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-card/70 to-indigo-950/30 border border-purple-500/30 shadow-xl rounded-2xl transition hover:border-purple-500/50">
      <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
        <Sparkles className="w-32 h-32 text-purple-400" />
      </div>

      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-2.5 py-0.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 mr-1 fill-white text-white animate-pulse" /> PROGRAM OF THE DAY
          </Badge>
          {isCompleted ? (
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-semibold">
              <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED TODAY
            </Badge>
          ) : (
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-xs">
              Daily Challenge
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-background/60 px-3 py-1 rounded-full border border-border/60">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>Resets in: <strong className="text-foreground font-bold">{formatCountdown(timeLeft)}</strong></span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        <div>
          <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
            {data.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
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
        </div>

        <p className="text-xs text-muted-foreground">
          {isCompleted
            ? "Great job! You completed today's daily problem and secured your streak!"
            : "Complete today's challenge to maintain your daily coding streak and unlock PlacementAI rewards."}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-white font-bold">{data.currentStreak} Day Streak</span>
            <span className="text-xs text-muted-foreground font-normal">(Best: {data.longestStreak}d)</span>
          </div>

          <Button
            onClick={() => onSolve(data.problemId)}
            disabled={isCompleted}
            className={`font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all ${
              isCompleted
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30"
            }`}
          >
            {isCompleted ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Solved Today</span>
            ) : (
              <span className="flex items-center gap-2">Solve Today's Problem <ArrowRight className="w-4 h-4" /></span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
