"use client";

import React from "react";
import { MockInterview } from "../../types/interview.types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DossierPanelProps {
  interview: MockInterview;
}

export const DossierPanel = ({ interview }: DossierPanelProps) => {
  const { feedback } = interview;
  if (!feedback) return null;

  return (
    <Card className="border border-indigo-950/30 bg-indigo-950/5 p-6 shadow-xl">
      <CardHeader className="p-0 pb-4 border-b border-indigo-950/20">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl font-black text-indigo-400 uppercase tracking-wider">
              CONFIDENTIAL: Candidate Assessment Dossier
            </CardTitle>
            <CardDescription className="text-zinc-400">
              PlacementAI Enterprise Recruiter Review Panel
            </CardDescription>
          </div>
          <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase text-[10px] tracking-widest">
            Internal HR Use Only
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2">Executive Summary</h3>
          <p className="text-sm text-zinc-300 leading-relaxed italic bg-zinc-950 p-4 rounded-xl border border-zinc-900">
            &quot;{feedback.candidateSummary || "Detailed candidate behavioral profile pending evaluation."}&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950/50">
            <h4 className="text-xs uppercase font-bold text-zinc-400 mb-2">Key Competencies Comments</h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li><strong>Technical Ability:</strong> {feedback.technicalAbilityComment || "Adequate baseline."}</li>
              <li><strong>Communication:</strong> {feedback.communicationComment || "Articulate and fluent."}</li>
              <li><strong>Problem Solving:</strong> {feedback.problemSolvingComment || "Methodical solver."}</li>
            </ul>
          </div>

          <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950/50">
            <h4 className="text-xs uppercase font-bold text-zinc-400 mb-2">Recruiter Decision Parameters</h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li><strong>Expected Bracket:</strong> {feedback.expectedSalary || "6.5 - 9.0 LPA"}</li>
              <li><strong>Hiring Probability:</strong> {feedback.hiringProbability ?? 70}%</li>
              <li><strong>Confidence Index:</strong> {feedback.interviewConfidence ?? 72}%</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2">Recruiter Verdict</h3>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-900">
            {feedback.recruiterNotes || "Solid alignment; recommended to advance to engineering rounds."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
