"use client";

import React, { useState } from "react";
import { MockInterview } from "../../types/interview.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Award, CheckCircle2, ChevronRight } from "lucide-react";
import { LearningResources } from "../LearningResources";
import { getResourcesByTopics } from "../../constants/learning-resources";

interface CandidateFeedbackPanelProps {
  interview: MockInterview;
}

export const CandidateFeedbackPanel = ({ interview }: CandidateFeedbackPanelProps) => {
  const { feedback, questions, role, experienceLevel, createdAt } = interview;
  const [activeQ, setActiveQ] = useState(0);

  if (!feedback) return null;

  const categoryScores = [
    { name: "Technical Ability", score: feedback.technicalScore ?? 70 },
    { name: "Communication Skills", score: feedback.communicationScore ?? 70 },
    { name: "Confidence Index", score: feedback.confidenceScore ?? 70 },
    { name: "Problem Solving", score: feedback.problemSolvingScore ?? 70 },
    { name: "Role Readiness", score: feedback.roleReadiness ?? 70 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 border border-zinc-800 bg-black/60 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Overall Score</span>
          <h2 className="text-6xl font-black text-indigo-400 my-4">{feedback.totalScore}</h2>
          <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-800">
            {feedback.totalScore >= 75 ? "Excellent Performance" : "Approved"}
          </Badge>
        </Card>

        <Card className="md:col-span-8 border border-zinc-800 bg-black/60 backdrop-blur-md p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2">Final Assessment</h3>
          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
            {feedback.finalAssessment}
          </p>
        </Card>
      </div>

      {/* Category Breakdowns */}
      <Card className="border border-zinc-800 bg-black/60 backdrop-blur-md p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4">Competency Breakdown</h3>
        <div className="space-y-4">
          {categoryScores.map((cat, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">{cat.name}</span>
                <span className="font-mono text-zinc-400">{cat.score} / 100</span>
              </div>
              <Progress value={cat.score} className="h-2 bg-zinc-950" />
            </div>
          ))}
        </div>
      </Card>

      {/* Question Details List */}
      {questions && questions.length > 0 && (
        <Card className="border border-zinc-800 bg-black/60 backdrop-blur-md p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4">Question Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-2 border-r border-zinc-900 pr-4">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQ(idx)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-center justify-between ${
                    activeQ === idx
                      ? "bg-indigo-950/40 border border-indigo-900/50 text-indigo-200"
                      : "bg-zinc-950 border border-zinc-900 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <span className="truncate">Question {idx + 1}</span>
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              ))}
            </div>
            <div className="md:col-span-8 space-y-4">
              <div className="rounded-lg bg-zinc-950/80 border border-zinc-900 p-4">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Question</span>
                <p className="mt-1 text-sm text-zinc-100 font-medium">{questions[activeQ].questionText}</p>
              </div>

              <div className="rounded-lg bg-zinc-950/80 border border-zinc-900 p-4">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Your Answer</span>
                <p className="mt-1 text-sm text-zinc-200">{questions[activeQ].answerText || "[No answer submitted]"}</p>
              </div>

              {questions[activeQ].aiFeedback && (
                <div className="rounded-lg bg-zinc-950/80 border border-zinc-900 p-4">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">AI Evaluation & Tips</span>
                  <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{questions[activeQ].aiFeedback}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Learning Resources */}
      <Card className="border border-zinc-800 bg-black/60 backdrop-blur-md p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4">Recommended Study Material</h3>
        <LearningResources resources={getResourcesByTopics(feedback.areasForImprovement || ["general topics"])} />
      </Card>
    </div>
  );
};
