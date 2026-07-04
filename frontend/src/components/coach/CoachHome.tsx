import React from "react";
import { DailyCoach } from "./DailyCoach";
import { WeeklyReview } from "./WeeklyReview";
import { PlacementTimeline } from "./PlacementTimeline";
import { StudyPlanner } from "./StudyPlanner";
import { CompanyWorkspace } from "./CompanyWorkspace";
import { HabitTracker } from "./HabitTracker";
import { Achievements } from "./Achievements";
import { ProgressDashboard } from "./ProgressDashboard";
import { ProjectMentor } from "./ProjectMentor";
import { InterviewJourney } from "./InterviewJourney";

export function CoachHome() {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#0d1117] text-left select-none max-w-[1400px] mx-auto w-full">
      {/* Top metrics summary */}
      <ProgressDashboard />

      {/* Main dashboard columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Daily Coach & Company prep */}
        <div className="lg:col-span-2 space-y-6">
          <DailyCoach />
          <CompanyWorkspace />
          <InterviewJourney />
          <ProjectMentor />
        </div>

        {/* Right column - Habits, study planner, timeline */}
        <div className="space-y-6">
          <WeeklyReview />
          <StudyPlanner />
          <HabitTracker />
          <Achievements />
          <PlacementTimeline />
        </div>
      </div>
    </div>
  );
}
