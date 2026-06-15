"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InterviewResult } from "@/modules/mock-interview/components/InterviewResult";
import { interviewService } from "@/modules/mock-interview/services/interviewService";
import { MockInterview } from "@/modules/mock-interview/types/interview.types";
import { Loader2 } from "lucide-react";

export default function MockInterviewResultPage() {
  const params = useParams();
  const id = params.id as string;
  const [interview, setInterview] = useState<MockInterview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await interviewService.getById(id);
        setInterview(data);
      } catch (error) {
        console.error("Failed to fetch result:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

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
