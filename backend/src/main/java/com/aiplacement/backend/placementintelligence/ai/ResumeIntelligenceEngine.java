package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ResumeIntelligenceEngine {

    public ResumeMetrics analyzeResume(PlacementContext context) {
        int atsScore = context.getAtsScore();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        if (atsScore >= 80) {
            strengths.add("ATS-compliant single-column layout structure.");
            strengths.add("Strong usage of action verbs and quantifiable results.");
        } else {
            weaknesses.add("Lacks quantifiable metrics inside project descriptions.");
            weaknesses.add("Poor section hierarchy; resume template lacks standard margins.");
        }

        if (context.getSelectedTemplate() == null || "default".equalsIgnoreCase(context.getSelectedTemplate())) {
            weaknesses.add("Using non-standard default template. Consider modern high-ATS templates.");
        } else {
            strengths.add("Selected a premium template: " + context.getSelectedTemplate());
        }

        int completeness = (context.getResumes() != null && !context.getResumes().isEmpty()) ? 95 : 30;

        return ResumeMetrics.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .completeness(completeness)
                .confidence(Math.max(40, atsScore))
                .quality(atsScore >= 80 ? "EXCELLENT" : atsScore >= 60 ? "DEVELOPING" : "POOR")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class ResumeMetrics {
        List<String> strengths;
        List<String> weaknesses;
        int completeness;
        int confidence;
        String quality;
    }
}
