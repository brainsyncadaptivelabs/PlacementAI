package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

@Component
public class MotivationEngine {

    public String generateMotivationQuote(PlacementContext context) {
        int streak = context.getUserStats() != null ? context.getUserStats().getActivityStreakDays() : 0;
        if (streak > 3) {
            return "Incredible! You are on a " + streak + "-day practice streak. Keep it up!";
        }
        return "Consistency is key. Practicing just 15 minutes today maintains your placement readiness.";
    }
}
