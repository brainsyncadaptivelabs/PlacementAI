"use client";

import React from "react";
import { InterviewAnalytics } from "@/modules/mock-interview/components/InterviewAnalytics";

export default function MockInterviewAnalyticsPage() {
  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Performance Analytics</h1>
        <p className="text-muted-foreground text-lg">
          Insights into your interview preparation journey.
        </p>
      </div>
      <InterviewAnalytics />
    </div>
  );
}
