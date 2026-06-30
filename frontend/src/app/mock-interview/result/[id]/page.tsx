"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InterviewResult } from "@/modules/mock-interview/components/InterviewResult";
import { interviewService } from "@/modules/mock-interview/services/interviewService";
import { MockInterview } from "@/modules/mock-interview/types/interview.types";
import { useInterviewStore } from "@/modules/mock-interview/hooks/useInterviewStore";
import { Loader2 } from "lucide-react";

export default function MockInterviewResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [interview, setInterview] = useState<MockInterview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await interviewService.getById(id);
        if (data && !data.feedback) {
          useInterviewStore.getState().setInterviewData({
            role: data.role,
            experienceLevel: data.experienceLevel,
            questions: data.questions ? data.questions.map(q => q.questionText) : [],
            company: data.company,
            isAdaptive: true,
            adaptiveInterviewId: data.id,
            conversationalStyle: data.conversationalStyle
          });
          router.push("/mock-interview/session");
        } else {
          setInterview(data);
        }
      } catch (error) {
        console.error("Failed to fetch result:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id, router]);

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl">Loading your results...</p>
      </div>
    );
  }

  if (!interview) {
    return <div className="container py-20 text-center">Interview not found.</div>;
  }

  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Interview Feedback</h1>
        <p className="text-muted-foreground text-lg">
          Detailed analysis of your performance.
        </p>
      </div>
      <InterviewResult interview={interview} />
    </div>
  );
}
