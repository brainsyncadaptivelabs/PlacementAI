package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.context.PlacementContextBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.Cacheable;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MentorDashboardService {

    private final PlacementContextBuilder contextBuilder;
    private final AIMentorEngine mentorEngine;
    private final DailyPlannerEngine dailyPlannerEngine;
    private final WeeklyPlannerEngine weeklyPlannerEngine;
    private final LearningCoachEngine coachEngine;
    private final MotivationEngine motivationEngine;
    private final ReminderEngine reminderEngine;
    private final OpportunityEngine opportunityEngine;

    @Cacheable(value = "mentor_data", key = "#user.email")
    public Map<String, Object> getMentorData(User user, int placementScore) {
        PlacementContext context = contextBuilder.buildContext(user);

        Map<String, Object> map = new HashMap<>();
        AIMentorEngine.MentorStatus status = mentorEngine.getStatus(context, placementScore);
        map.put("mentorGuidance", status.getMentorGuidance());
        map.put("isReadyForPlacements", status.isReadyForPlacements());

        map.put("dailyMission", dailyPlannerEngine.generateDailyMission(context, placementScore));
        map.put("weeklyRoadmap", weeklyPlannerEngine.generateWeeklyPlan(context, placementScore));
        map.put("coachFeedback", coachEngine.coachStudent(context));
        map.put("motivationQuote", motivationEngine.generateMotivationQuote(context));
        map.put("reminders", reminderEngine.generateReminders(context));
        map.put("unlockedOpportunities", opportunityEngine.detectOpportunities(context, placementScore));

        return map;
    }
}
