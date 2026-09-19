"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, CheckCircle, Circle, Gift, Sparkles, Award } from "lucide-react";

export interface CodingStreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  completedToday: boolean;
  weeklyCalendar: {
    dayName: string;
    date: string;
    completed: boolean;
    isToday: boolean;
  }[];
  daysToNextReward: number;
  rewardAvailable: boolean;
}

export interface RewardItem {
  id: number;
  rewardType: string;
  title: string;
  description: string;
  status: "UNLOCKED" | "CLAIMED";
  unlockedAt: string;
  claimedAt?: string;
}

interface CodingStreakWidgetProps {
  streakData: CodingStreakData | null;
  rewards: RewardItem[];
  onClaimReward: (rewardId: number) => Promise<void>;
  isLoading?: boolean;
}

export default function CodingStreakWidget({
  streakData,
  rewards,
  onClaimReward,
  isLoading
}: CodingStreakWidgetProps) {
  const [isClaiming, setIsClaiming] = useState<number | null>(null);

  if (isLoading || !streakData) {
    return (
      <Card className="bg-card/40 backdrop-blur border-border/50 animate-pulse p-6">
        <div className="h-6 bg-amber-900/20 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-amber-900/10 rounded w-full"></div>
      </Card>
    );
  }

  const unlockedReward = rewards.find((r) => r.status === "UNLOCKED");

  const handleClaim = async (rewardId: number) => {
    setIsClaiming(rewardId);
    try {
      await onClaimReward(rewardId);
    } finally {
      setIsClaiming(null);
    }
  };

  return (
    <Card className="bg-card/40 backdrop-blur border-border/50 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streakData.currentStreak} DAY CODING STREAK</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {streakData.daysToNextReward > 0
              ? `${streakData.daysToNextReward} more consecutive day${streakData.daysToNextReward > 1 ? "s" : ""} to unlock 🎁 Free ATS Scan!`
              : "🎉 Milestone reached! Claim your free reward below!"}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Best Streak</span>
          <p className="text-sm font-bold text-amber-400">{streakData.longestStreak} Days</p>
        </div>
      </div>

      {/* Weekly Mon-Sun Calendar */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {streakData.weeklyCalendar.map((day) => (
          <div
            key={day.dayName}
            className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
              day.isToday
                ? "bg-purple-950/40 border-purple-500/50 shadow-sm"
                : "bg-background/40 border-border/40"
            }`}
          >
            <span className={`text-[10px] font-bold ${day.isToday ? "text-purple-300" : "text-muted-foreground"}`}>
              {day.dayName}
            </span>

            <div className="my-1">
              {day.completed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950/40" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unlocked Reward Banner */}
      {unlockedReward && (
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-amber-950/50 via-purple-950/40 to-indigo-950/50 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Reward Unlocked!
              </span>
              <h5 className="text-sm font-black text-white">{unlockedReward.title}</h5>
              <p className="text-xs text-muted-foreground">{unlockedReward.description}</p>
            </div>
          </div>

          <Button
            onClick={() => handleClaim(unlockedReward.id)}
            disabled={isClaiming === unlockedReward.id}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs px-5 py-2 rounded-xl shadow-md transition"
          >
            {isClaiming === unlockedReward.id ? "Claiming..." : "🎁 Claim Free ATS Scan"}
          </Button>
        </div>
      )}

      {/* Claimed Rewards History list */}
      {rewards.length > 0 && (
        <div className="pt-2 border-t border-border/40 space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Milestone Rewards History
          </span>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {rewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-background/50 border border-border/30">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <Award className={`w-3.5 h-3.5 ${r.status === "CLAIMED" ? "text-emerald-400" : "text-amber-400"}`} />
                  {r.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.status === "CLAIMED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
