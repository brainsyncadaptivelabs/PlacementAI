"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, CheckCircle, Code2, Zap, ArrowRight, BookOpen, BrainCircuit } from "lucide-react";

interface CodingDashboardProps {
  stats: {
    totalSolved: number;
    totalAttempted: number;
    acceptanceRate: number;
    currentStreak: number;
    longestStreak: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSubmissions: number;
    codingXp: number;
    placementReadinessContribution: number;
    topicProgress: Record<string, number>;
  };
  onNavigateToProblems: (topic?: string) => void;
}

export default function CodingDashboard({ stats, onNavigateToProblems }: CodingDashboardProps) {
  return (
    <div className="space-[#111827] text-foreground space-y-6">
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/40 via-background to-background border-purple-800/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Placement Readiness</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{stats.placementReadinessContribution}%</h3>
              <p className="text-xs text-muted-foreground mt-0.5">+14% from DSA mastery</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problems Solved</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{stats.totalSolved}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.acceptanceRate}% Acceptance</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Streak</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-400 flex items-center gap-1.5">
                {stats.currentStreak} Days <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Best: {stats.longestStreak} days</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coding XP</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-400">{stats.codingXp} XP</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Level 4 Candidate</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Difficulty Split + DSA Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Distribution */}
        <Card className="bg-card/40 backdrop-blur border-border/50 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Difficulty Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-emerald-400">Easy</span>
                <span className="text-muted-foreground">{stats.easySolved} Solved</span>
              </div>
              <Progress value={Math.min(100, stats.easySolved * 5)} className="h-2 bg-emerald-950/40" indicatorClassName="bg-emerald-500" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-amber-400">Medium</span>
                <span className="text-muted-foreground">{stats.mediumSolved} Solved</span>
              </div>
              <Progress value={Math.min(100, stats.mediumSolved * 4)} className="h-2 bg-amber-950/40" indicatorClassName="bg-amber-500" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-rose-400">Hard</span>
                <span className="text-muted-foreground">{stats.hardSolved} Solved</span>
              </div>
              <Progress value={Math.min(100, stats.hardSolved * 10)} className="h-2 bg-rose-950/40" indicatorClassName="bg-rose-500" />
            </div>

            <div className="pt-4 border-t border-border/40">
              <Button onClick={() => onNavigateToProblems()} className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                Explore Problem Bank <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* DSA Topic Progress */}
        <Card className="bg-card/40 backdrop-blur border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" /> Topic Mastery & Placement Relevance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.topicProgress).map(([topic, pct]) => (
              <div
                key={topic}
                onClick={() => onNavigateToProblems(topic)}
                className="p-3.5 rounded-xl border border-border/40 bg-background/50 hover:bg-card/60 transition cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{topic}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {pct}%
                  </span>
                </div>
                <Progress value={pct} className="h-1.5 bg-secondary" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
