package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OpportunityEngine {

    public List<String> detectOpportunities(PlacementContext context, int placementScore) {
        List<String> opportunities = new ArrayList<>();

        if (placementScore >= 80) {
            opportunities.add("Oracle readiness increased to 82%; you are highly competitive.");
            opportunities.add("New company eligibility unlocked: FAANG technical tracks.");
        } else if (placementScore >= 65) {
            opportunities.add("Deloitte readiness increased to 74%. Complete one mock interview to unlock full recommendations.");
            opportunities.add("Eligible for Accenture software engineer hiring tracks.");
        } else {
            opportunities.add("Accenture eligibility is close (requires +5% overall score).");
        }

        return opportunities;
    }
}
