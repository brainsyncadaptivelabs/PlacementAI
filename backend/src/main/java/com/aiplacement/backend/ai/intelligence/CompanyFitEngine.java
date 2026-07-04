package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.ai.PromptContext;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;

public class CompanyFitEngine {
    public String evaluateCompanyFit(PromptContext context) {
        PlacementIntelligenceDto intel = context.getIntelligence();
        if (intel == null) {
            return "No company fit analysis is active.\n";
        }

        int readiness = intel.getOverallPlacementReadiness();
        StringBuilder sb = new StringBuilder();
        sb.append("TARGET COMPANY COMPATIBILITY ANALYSIS:\n");
        sb.append("- Tier 1 Product (Google/Amazon): ").append(readiness >= 85 ? "Good Match" : "Needs significant DSA practice").append("\n");
        sb.append("- Tier 2 Services (TCS/Infosys/Accenture): ").append(readiness >= 60 ? "Ready to Clear" : "Needs foundational mock prep").append("\n\n");
        return sb.toString();
    }
}
