"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { InterviewSetup } from "@/modules/mock-interview/components/InterviewSetup";
import { useInterviewStore } from "@/modules/mock-interview/hooks/useInterviewStore";

export default function MockInterviewStartPage() {
  const router = useRouter();
  const setInterviewData = useInterviewStore((state) => state.setInterviewData);

  const handleGenerated = (data: { 
    role: string; 
    experienceLevel: string; 
    questions: string[];
    company?: string;
    difficulty?: string;
    interviewType?: string;
    topic?: string;
    isAdaptive?: boolean;
    adaptiveInterviewId?: number;
    conversationalStyle?: string;
  }) => {
    setInterviewData(data);
    router.push("/mock-interview/session");
  };

  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Configure Interview</h1>
        <p className="text-muted-foreground text-lg">
          Select your role and experience level to generate questions.
        </p>
      </div>
      <InterviewSetup onGenerated={handleGenerated} />
    </div>
  );
}
