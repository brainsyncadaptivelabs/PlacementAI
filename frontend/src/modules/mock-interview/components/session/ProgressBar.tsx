"use client";

import React from "react";
import { useInterviewStateContext } from "./InterviewContexts";
import { Progress } from "@/components/ui/progress";

export const ProgressBar = () => {
  const { currentQuestionIndex, interviewData } = useInterviewStateContext();
  const total = (interviewData.questions && interviewData.questions.length > 0)
    ? interviewData.questions.length
    : 5;

  const percentage = Math.min(100, Math.round((currentQuestionIndex / total) * 100));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="uppercase tracking-wider font-semibold">Session Progress</span>
        <span className="font-mono">
          {currentQuestionIndex} / {total} Questions ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} className="h-2.5 bg-zinc-900 border border-zinc-800" />
    </div>
  );
};
