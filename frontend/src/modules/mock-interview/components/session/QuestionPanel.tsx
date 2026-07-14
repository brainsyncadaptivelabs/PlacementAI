"use client";

import React from "react";
import { useInterviewStateContext } from "./InterviewContexts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cpu } from "lucide-react";

export const QuestionPanel = () => {
  const { currentQuestionIndex, interviewData } = useInterviewStateContext();
  const currentQuestion = (interviewData.questions && currentQuestionIndex < interviewData.questions.length)
    ? interviewData.questions[currentQuestionIndex]
    : "The interviewer is preparing your first question. Please wait...";

  return (
    <Card className="border border-zinc-800 bg-black/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12 border-2 border-indigo-500/50">
          <AvatarImage src="/avatars/interviewer.png" alt="AI Agent" />
          <AvatarFallback className="bg-indigo-950 text-indigo-200">AI</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg text-zinc-100">AI Interview Specialist</CardTitle>
          <p className="text-xs text-zinc-400">Active Evaluator</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-indigo-950 bg-indigo-950/20 p-4">
          <div className="flex items-start gap-2">
            <Cpu className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-400 animate-pulse" />
            <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
              {currentQuestion}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
