package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.ai.PromptContext;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import java.util.List;

public class SkillGapEngine {
    public String analyzeSkillGaps(PromptContext context) {
        PlacementIntelligenceDto intel = context.getIntelligence();
        if (intel == null) {
            return "No skill gap data is currently loaded.\n";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("SKILL GAP & ROI IMPROVEMENT ENGINE (AI ESTIMATES):\n");

        List<String> gaps = intel.getSkillGaps();
        if (gaps == null || gaps.isEmpty()) {
            sb.append("- Current gap status: Minimal core technical gaps identified. Focus on mocks.\n");
        } else {
            for (String gap : gaps) {
                int roi = gap.equalsIgnoreCase("dsa") ? 25 : gap.equalsIgnoreCase("resume") ? 20 : 15;
                sb.append("- Weakness: ").append(gap).append(" | Est. Readiness ROI: +").append(roi).append(" pts upon resolution\n");
            }
        }
        sb.append("\n");
        return sb.toString();
    }
}
