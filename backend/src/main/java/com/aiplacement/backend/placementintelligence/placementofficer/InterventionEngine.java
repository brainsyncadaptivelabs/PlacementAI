package com.aiplacement.backend.placementintelligence.placementofficer;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class InterventionEngine {

    public List<Map<String, String>> recommendInterventions(Map<String, Integer> segments) {
        List<Map<String, String>> recommendations = new ArrayList<>();

        int needsResume = segments.getOrDefault("Needs Resume Improvement", 0);
        int needsCoding = segments.getOrDefault("Needs Coding Practice", 0);
        int needsComm = segments.getOrDefault("Needs Communication Training", 0);

        if (needsResume > 5) {
            recommendations.add(createRecommendation(
                    "Resume Workshop Series",
                    "Conduct a peer review session using modern ATS resume templates.",
                    "High Priority"
            ));
        }
        if (needsCoding > 5) {
            recommendations.add(createRecommendation(
                    "Competitive Coding bootcamp",
                    "Intense 3-day training on Dynamic Programming and Graphs.",
                    "High Priority"
            ));
        }
        if (needsComm > 5) {
            recommendations.add(createRecommendation(
                    "Mock Interview & Articulation Training",
                    "Peer-to-peer verbal practice to reduce speech filler words.",
                    "Medium Priority"
            ));
        }

        if (recommendations.isEmpty()) {
            recommendations.add(createRecommendation(
                    "Spring Boot Workshop",
                    "Hands-on practice designing secure REST APIs.",
                    "Optional"
            ));
        }

        return recommendations;
    }

    private Map<String, String> createRecommendation(String title, String desc, String priority) {
        Map<String, String> rec = new HashMap<>();
        rec.put("title", title);
        rec.put("description", desc);
        rec.put("priority", priority);
        return rec;
    }
}
