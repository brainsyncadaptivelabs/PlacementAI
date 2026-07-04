package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.ai.PromptContext;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import java.util.HashMap;
import java.util.Map;

public class PlacementPredictor {
    public String predictCompanyReadiness(PromptContext context) {
        PlacementIntelligenceDto intel = context.getIntelligence();
        if (intel == null) {
            return "No readiness predictions available without placement profile data.\n";
        }

        int readiness = intel.getOverallPlacementReadiness();
        int coding = intel.getCodingScore();
        int ats = intel.getAtsScore();

        StringBuilder sb = new StringBuilder();
        sb.append("AUTONOMOUS PLACEMENT PREDICTION ENGINE (AI ESTIMATES):\n");

        Map<String, Integer> targets = new HashMap<>();
        targets.put("Google", (int)(coding * 0.6 + readiness * 0.4 - 15));
        targets.put("Amazon", (int)(coding * 0.5 + readiness * 0.5 - 10));
        targets.put("TCS", (int)(readiness * 0.8 + ats * 0.2 + 5));
        targets.put("Infosys", (int)(readiness * 0.85 + ats * 0.15 + 8));
        targets.put("Accenture", (int)(readiness * 0.8 + 10));

        for (Map.Entry<String, Integer> entry : targets.entrySet()) {
            int score = Math.max(0, Math.min(100, entry.getValue()));
            String status = score >= 80 ? "High Match" : score >= 60 ? "Moderate Match" : "Low Match";
            sb.append("- ").append(entry.getKey()).append(" Readiness: ").append(score).append("% (").append(status).append(")\n");
        }
        sb.append("\n");
        return sb.toString();
    }
}
