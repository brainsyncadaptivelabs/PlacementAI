package com.aiplacement.backend.placementintelligence.ai;


import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PlacementAIReasoningEngine {

    public List<String> generateReasoning(
            ResumeIntelligenceEngine.ResumeMetrics resume,
            CodingIntelligenceEngine.CodingMetrics coding,
            InterviewIntelligenceEngine.InterviewMetrics interview,
            CommunicationIntelligenceEngine.CommunicationMetrics comm,
            AptitudeIntelligenceEngine.AptitudeMetrics aptitude,
            SkillGapIntelligenceEngine.SkillGapMetrics skills) {

        List<String> reasoning = new ArrayList<>();

        if ("EXCELLENT".equalsIgnoreCase(resume.getQuality())) {
            reasoning.add("Excellent backend and structural ATS layout compliance.");
        } else {
            reasoning.add("Resume format is basic and lacks quantitative project impacts.");
        }

        if (coding.getConfidence() >= 80) {
            reasoning.add("Strong coding stats with solid solved problems coverage.");
        } else {
            reasoning.add("Coding profile lacks depth; focus on trees, heaps, and graph questions.");
        }

        if (comm.getAverageCommunicationScore() >= 80) {
            reasoning.add("Fluent professional communication style with minimal filler usage.");
        } else {
            reasoning.add("Weak communication pacing noticed during mocks; requires response structuring.");
        }

        if (skills.getScore() < 80) {
            reasoning.add("Missing required target skills like " + String.join(", ", skills.getMissingSkills()));
        }

        if (interview.getAverageInterviewScore() >= 80) {
            reasoning.add("Good interview technical performance and reasoning accuracy.");
        } else {
            reasoning.add("Interview performance declines under live pressure sessions.");
        }

        return reasoning;
    }
}
