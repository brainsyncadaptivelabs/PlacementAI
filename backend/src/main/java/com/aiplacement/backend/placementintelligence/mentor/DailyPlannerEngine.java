package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DailyPlannerEngine {

    public Map<String, Object> generateDailyMission(PlacementContext context, int placementScore) {
        Map<String, Object> mission = new HashMap<>();

        if (placementScore < 70) {
            mission.put("missionTitle", "Strengthen Backend Programming Foundations");
            mission.put("resumeTask", "Rewrite experience description with action verbs.");
            mission.put("codingTask", "Solve 2 Array problems on recursion.");
            mission.put("interviewTask", "Record a mock behavioral response on Teamwork.");
            mission.put("aptitudeTask", "Solve 10 Quantitative equations drills.");
            mission.put("estimatedTime", "1.5 Hours");
            mission.put("expectedProgress", "+3% Placement Score");
        } else {
            mission.put("missionTitle", "Refine Advanced System Design & Scale");
            mission.put("resumeTask", "Quantify project performance metrics (e.g. latency).");
            mission.put("codingTask", "Solve 1 Hard dynamic programming challenge.");
            mission.put("interviewTask", "Complete a System Design Mock session.");
            mission.put("aptitudeTask", "Complete a full logical reasoning test simulation.");
            mission.put("estimatedTime", "2 Hours");
            mission.put("expectedProgress", "+1% Placement Score");
        }

        return mission;
    }
}
