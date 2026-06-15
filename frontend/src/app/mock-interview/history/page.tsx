"use client";

import React from "react";
import { InterviewHistory } from "@/modules/mock-interview/components/InterviewHistory";

export default function MockInterviewHistoryPage() {
  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">My Interviews</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and review past performance.
        </p>
      </div>
      <InterviewHistory />
    </div>
  );
}
