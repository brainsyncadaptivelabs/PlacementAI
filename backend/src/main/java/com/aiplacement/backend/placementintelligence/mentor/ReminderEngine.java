package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ReminderEngine {

    public List<String> generateReminders(PlacementContext context) {
        List<String> reminders = new ArrayList<>();

        if (context.getMockInterviews() == null || context.getMockInterviews().isEmpty()) {
            reminders.add("Complete your first mock interview to compile communication readiness feedback.");
        }
        if (context.getResumes() == null || context.getResumes().isEmpty()) {
            reminders.add("Upload a resume to scan for keyword compliance gaps.");
        }
        if (reminders.isEmpty()) {
            reminders.add("No critical action items. Maintain active progress streaks.");
        }

        return reminders;
    }
}
