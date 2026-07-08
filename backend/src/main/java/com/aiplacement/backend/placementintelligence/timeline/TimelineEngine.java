package com.aiplacement.backend.placementintelligence.timeline;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TimelineEngine {

    public List<TimelineEvent> getTimeline(PlacementContext context, int placementScore) {
        List<TimelineEvent> events = new ArrayList<>();

        events.add(TimelineEvent.builder()
                .month("March")
                .milestone("Profile Onboarding")
                .status("COMPLETED")
                .details("Registered and configured core preferences.")
                .build());

        if (context.getResumes() != null && !context.getResumes().isEmpty()) {
            events.add(TimelineEvent.builder()
                    .month("April")
                    .milestone("ATS Resume Scoring")
                    .status("COMPLETED")
                    .details("Achieved ATS score of " + context.getAtsScore() + "%.")
                    .build());
        } else {
            events.add(TimelineEvent.builder()
                    .month("April")
                    .milestone("ATS Resume Setup")
                    .status("IN_PROGRESS")
                    .details("No active resumes scored yet.")
                    .build());
        }

        if (context.getUserStats() != null) {
            events.add(TimelineEvent.builder()
                    .month("May")
                    .milestone("DSA Programming")
                    .status("COMPLETED")
                    .details("Solved problems logged on dashboard.")
                    .build());
        }

        events.add(TimelineEvent.builder()
                .month("June")
                .milestone("Interview Prep")
                .status(placementScore >= 75 ? "COMPLETED" : "IN_PROGRESS")
                .details("Technical mock session checks.")
                .build());

        events.add(TimelineEvent.builder()
                .month("July")
                .milestone("Offer Ready")
                .status(placementScore >= 90 ? "COMPLETED" : "UPCOMING")
                .details("Target eligibility matching forecast.")
                .build());

        return events;
    }
}
