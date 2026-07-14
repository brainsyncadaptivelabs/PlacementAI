"use client";

import React, { useEffect } from "react";
import { useInterviewStateContext } from "./InterviewContexts";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export const Timer = () => {
  const { timeLeft, setTimeLeft, isTimerPaused } = useInterviewStateContext();

  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, setTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border border-zinc-800 bg-black/60 backdrop-blur-md">
      <CardContent className="flex items-center gap-3 p-4">
        <Clock className="h-5 w-5 text-indigo-400" />
        <span className="font-mono text-xl font-semibold tracking-wider text-zinc-100">
          {formatTime(timeLeft)}
        </span>
      </CardContent>
    </Card>
  );
};
