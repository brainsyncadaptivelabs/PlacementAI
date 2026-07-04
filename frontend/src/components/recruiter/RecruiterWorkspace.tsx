import React from "react";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { CandidateExplorer } from "./CandidateExplorer";
import { CandidateProfile } from "./CandidateProfile";
import { HiringPipeline } from "./HiringPipeline";
import { JobManager } from "./JobManager";
import { SkillAnalytics } from "./SkillAnalytics";
import { RecruiterInsights } from "./RecruiterInsights";
import { InterviewScheduler } from "./InterviewScheduler";

export function RecruiterWorkspace() {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#0d1117] text-left select-none max-w-[1400px] mx-auto w-full">
      {/* Top statistics summary */}
      <RecruiterDashboard />

      {/* Main recruiter panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - explorer and pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <CandidateExplorer />
          <JobManager />
          <HiringPipeline />
        </div>

        {/* Right column - profile & scheduling */}
        <div className="space-y-6">
          <RecruiterInsights />
          <CandidateProfile />
          <SkillAnalytics />
          <InterviewScheduler />
        </div>
      </div>
    </div>
  );
}
