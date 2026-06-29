"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider } from "@elevenlabs/react";
import { InterviewSession } from "@/modules/mock-interview/components/InterviewSession";
import { useInterviewStore } from "@/modules/mock-interview/hooks/useInterviewStore";
import { useUser } from "@/hooks/use-user";

export default function MockInterviewSessionPage() {
  const router = useRouter();
  const { user } = useUser();
  const { role, questions, experienceLevel, company, difficulty, interviewType } = useInterviewStore();

  useEffect(() => {
    if (!role || questions.length === 0) {
      router.push("/mock-interview/start");
    }
  }, [role, questions, router]);

  if (!role || questions.length === 0) return null;

  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Interview Session</h1>
        <p className="text-muted-foreground text-lg">
          Speak clearly into your microphone. The AI is listening.
        </p>
      </div>
      <ConversationProvider>
        <InterviewSession 
          userName={user?.fullName || "Candidate"} 
          interviewData={{ role, questions, experienceLevel, company, difficulty, interviewType }} 
        />
      </ConversationProvider>
    </div>
  );
}
