package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class WeeklyPlannerEngine {

    public List<String> generateWeeklyPlan(PlacementContext context, int placementScore) {
        List<String> plan = new ArrayList<>();

        if (placementScore < 70) {
            plan.add("Week 1: Focus on basic DSA recursion and array algorithms.");
            plan.add("Week 2: Fix resume formatting and match target ATS keywords.");
            plan.add("Week 3: Complete first live mock technical interview.");
            plan.add("Week 4: Review logical puzzles and speed aptitude tests.");
        } else {
            plan.add("Week 1: Solve medium/hard dynamic programming and tree traversal questions.");
            plan.add("Week 2: Complete mock technical responses avoiding filler words.");
            plan.add("Week 3: Run comprehensive ATS reviews on target FAANG JDs.");
            plan.add("Week 4: Polish system design partitioning and scaling frameworks.");
        }

        return plan;
    }
}
