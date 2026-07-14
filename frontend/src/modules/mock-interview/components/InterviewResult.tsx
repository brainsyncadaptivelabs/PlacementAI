"use client";

import React, { useState } from "react";
import { MockInterview } from "../types/interview.types";
import { DossierPanel } from "./result/DossierPanel";
import { CandidateFeedbackPanel } from "./result/CandidateFeedbackPanel";
import { Button } from "@/components/ui/button";
import { Calendar, Award } from "lucide-react";

interface InterviewResultProps {
  interview: MockInterview;
}

export const InterviewResult = ({ interview }: InterviewResultProps) => {
  const [showRecruiterDossier, setShowRecruiterDossier] = useState(false);
  const { role, experienceLevel, createdAt } = interview;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Title Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100">
          Interview Assessment Report: <span className="capitalize text-indigo-400">{role}</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-indigo-500" />
            <span>{experienceLevel}</span>
          </div>
        </div>
      </div>

      <hr className="border-zinc-800" />

      {/* Recruiter Dossier Switcher */}
      <div className="flex justify-end print:hidden">
        <Button 
          variant={showRecruiterDossier ? "default" : "outline"} 
          className="font-bold rounded-xl flex items-center gap-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
          onClick={() => setShowRecruiterDossier(!showRecruiterDossier)}
        >
          {showRecruiterDossier ? "📋 Switch to Candidate Feedback" : "🔒 Access Recruiter Dossier"}
        </Button>
      </div>

      {showRecruiterDossier ? (
        <DossierPanel interview={interview} />
      ) : (
        <CandidateFeedbackPanel interview={interview} />
      )}
    </div>
  );
};
