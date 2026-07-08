package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LearningCoachEngine {

    public String coachStudent(PlacementContext context) {
        if (context.getCodingScore() < 70) {
            return "Try practicing standard backtracking and tree traversals. You are close to passing technical thresholds.";
        }
        if (context.getCommunicationScore() < 70) {
            return "Record one mock response today. Focus on slowing down pacing to reduce speech filler usage.";
        }
        return "Excellent progress. Keep participating in weekly coding contests to maintain high accuracy and speed.";
    }
}
