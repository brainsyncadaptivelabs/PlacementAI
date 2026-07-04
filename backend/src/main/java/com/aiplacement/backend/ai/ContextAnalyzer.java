package com.aiplacement.backend.ai;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;

public class ContextAnalyzer {
    public String analyzeContext(PromptContext context) {
        User user = context.getUser();
        PlacementIntelligenceDto intelligence = context.getIntelligence();
        if (user == null || intelligence == null) {
            return "No authenticated student profile context is active.\n";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("\n=========================================\n");
        sb.append("STUDENT PROFILE & CONTEXT (DO NOT ASK FOR THIS INFORMATION, YOU ALREADY KNOW IT):\n");
        sb.append("- Student Name: ").append(user.getFullName()).append("\n");
        sb.append("- Branch: ").append(user.getBranch() != null ? user.getBranch() : "Computer Science").append("\n");
        sb.append("- College: ").append(user.getCollegeName() != null ? user.getCollegeName() : "GEC").append("\n");
        sb.append("- Placement Readiness Score: ").append(intelligence.getOverallPlacementReadiness()).append("/100\n");
        sb.append("- Resume ATS Quality Score: ").append(intelligence.getAtsScore()).append("/100\n");
        sb.append("- Coding & Problem Solving Score: ").append(intelligence.getCodingScore()).append("/100\n");
        sb.append("- Interview Performance Score: ").append(intelligence.getInterviewScore()).append("/100\n");
        sb.append("- Communication Skills: ").append(intelligence.getCommunicationScore()).append("/100\n");
        if (intelligence.getSkillGaps() != null && !intelligence.getSkillGaps().isEmpty()) {
            sb.append("- Identified Skill Gaps: ").append(String.join(", ", intelligence.getSkillGaps())).append("\n");
        }
        if (intelligence.getCandidateStrengths() != null && !intelligence.getCandidateStrengths().isEmpty()) {
            sb.append("- Candidate Strengths: ").append(String.join(", ", intelligence.getCandidateStrengths())).append("\n");
        }
        sb.append("=========================================\n\n");
        return sb.toString();
    }
}
