package com.aiplacement.backend.placementintelligence.recommendation;

import com.aiplacement.backend.placementintelligence.dto.RecommendationDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PlacementRecommendationEngine {

    public RecommendationDto generateRecommendations(
            int resumeScore, int codingScore, int interviewScore,
            int communicationScore, int aptitudeScore, int skillGapScore,
            int placementScore, String selectedTemplate, String targetRole) {

        List<String> high = new ArrayList<>();
        List<String> medium = new ArrayList<>();
        List<String> optional = new ArrayList<>();

        // Resume suggestions
        if (resumeScore < 70) {
            high.add("Rebuild your resume using a modern template to pass parser checks.");
        } else if (resumeScore < 85) {
            medium.add("Fine-tune resume action verbs and quantify achievements.");
        } else {
            optional.add("Update resume with newly finished projects periodically.");
        }

        // Selected Template
        if (selectedTemplate == null || selectedTemplate.isEmpty() || "default".equalsIgnoreCase(selectedTemplate)) {
            medium.add("Switch to a premium high-ATS resume template from the Template Library.");
        }

        // Coding Suggestions
        if (codingScore < 70) {
            high.add("Solve daily coding challenges on Data Structures & Algorithms (DSA).");
        } else if (codingScore < 85) {
            medium.add("Practice intermediate coding problems focusing on Trees and dynamic programming.");
        } else {
            optional.add("Participate in active coding contests to maintain accuracy and speed.");
        }

        // Communication
        if (communicationScore < 70) {
            high.add("Practice speaking exercises in Mock Interviews to improve clarity and articulation.");
        } else if (communicationScore < 85) {
            medium.add("Work on maintaining consistent pacing and reducing filler words.");
        } else {
            optional.add("Refine behavioral interview storytelling using the STAR method.");
        }

        // Interview Performance
        if (interviewScore < 70) {
            high.add("Complete at least 3 Mock Interviews to get acclimated to the pressure.");
        } else if (interviewScore < 85) {
            medium.add("Focus on system design patterns and object-oriented principles.");
        } else {
            optional.add("Review past interview recordings for micro-behavioral changes.");
        }

        // Skill Gap
        if (skillGapScore > 50) {
            high.add("Address core skill gaps by learning " + (targetRole != null ? targetRole : "software development") + " requirements.");
        } else if (skillGapScore > 20) {
            medium.add("Enroll in structured learning roadmaps for target tools/frameworks.");
        } else {
            optional.add("Learn secondary tools or auxiliary technologies for competitive edge.");
        }

        // General target role recommendations
        if (targetRole != null && !targetRole.isEmpty()) {
            medium.add("Align project descriptions specifically to showcase expertise in " + targetRole + ".");
        }

        // Ensure we don't have empty lists
        if (high.isEmpty()) {
            high.add("Continue your current mock interview preparation streak.");
        }
        if (medium.isEmpty()) {
            medium.add("Examine target company interview patterns.");
        }
        if (optional.isEmpty()) {
            optional.add("Share your profile with peer network for mock peer reviews.");
        }

        return RecommendationDto.builder()
                .highPriority(high)
                .mediumPriority(medium)
                .optional(optional)
                .build();
    }
}
