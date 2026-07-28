"use client";

import React, { ReactNode } from "react";
import { useInterviewStateContext } from "./InterviewContexts";
import { Timer } from "./Timer";
import { ProgressBar } from "./ProgressBar";
import { QuestionPanel } from "./QuestionPanel";
import { VoiceController } from "./VoiceController";
import { TranscriptPanel } from "./TranscriptPanel";
import { CodePlayground } from "./CodePlayground";

interface InterviewLayoutProps {
  controls: ReactNode;
}

export const InterviewLayout = ({ controls }: InterviewLayoutProps) => {
  const { interviewData } = useInterviewStateContext();

  const isCodingRound =
    interviewData.interviewType === "DSA Coding" ||
    interviewData.interviewType === "Technical Coding" ||
    (interviewData.role && interviewData.role.toLowerCase().includes("coding")) ||
    (interviewData.role && interviewData.role.toLowerCase().includes("dsa"));

  return (
    <div className="flex flex-col gap-[clamp(16px,2vw,32px)] w-full max-w-screen-2xl mx-auto px-[clamp(12px,2vw,32px)] py-[clamp(16px,3vw,32px)]">
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
        <div className="flex-1">
          <ProgressBar />
        </div>
        <div className="flex-shrink-0">
          <Timer />
        </div>
      </div>

      <div className={isCodingRound ? "grid grid-cols-1 lg:grid-cols-12 gap-[clamp(16px,2vw,32px)]" : "flex flex-col gap-[clamp(16px,2vw,32px)]"}>
        {/* Left Side / Main Interview Panel */}
        <div className={isCodingRound ? "lg:col-span-6 flex flex-col gap-[clamp(16px,2vw,32px)]" : "flex flex-col gap-[clamp(16px,2vw,32px)] max-w-3xl mx-auto w-full"}>
          <QuestionPanel />
          <VoiceController />
          <TranscriptPanel />
          {controls}
        </div>

        {/* Right Side / Coding Playground (Visible only on coding rounds) */}
        {isCodingRound && (
          <div className="lg:col-span-6 h-[550px] lg:h-auto">
            <CodePlayground />
          </div>
        )}
      </div>
    </div>
  );
};
