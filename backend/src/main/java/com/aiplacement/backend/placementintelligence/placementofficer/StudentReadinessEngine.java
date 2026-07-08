package com.aiplacement.backend.placementintelligence.placementofficer;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.dto.PlacementProfileDto;
import com.aiplacement.backend.placementintelligence.service.PlacementIntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StudentReadinessEngine {

    private final PlacementIntelligenceService placementIntelligenceService;

    public Map<String, Integer> segmentStudents(List<User> students) {
        Map<String, Integer> segments = new HashMap<>();
        segments.put("Offer Ready", 0);
        segments.put("Interview Ready", 0);
        segments.put("Placement Ready", 0);
        segments.put("Needs Resume Improvement", 0);
        segments.put("Needs Coding Practice", 0);
        segments.put("Needs Communication Training", 0);
        segments.put("High Risk", 0);

        for (User u : students) {
            try {
                PlacementProfileDto p = placementIntelligenceService.getPlacementProfile(u);
                int score = p.getPlacementScore();

                if (score >= 90) {
                    segments.put("Offer Ready", segments.get("Offer Ready") + 1);
                } else if (score >= 80) {
                    segments.put("Interview Ready", segments.get("Interview Ready") + 1);
                } else if (score >= 70) {
                    segments.put("Placement Ready", segments.get("Placement Ready") + 1);
                } else {
                    segments.put("High Risk", segments.get("High Risk") + 1);
                }

                if (p.getResumeScore() < 70) {
                    segments.put("Needs Resume Improvement", segments.get("Needs Resume Improvement") + 1);
                }
                if (p.getCodingScore() < 70) {
                    segments.put("Needs Coding Practice", segments.get("Needs Coding Practice") + 1);
                }
                if (p.getCommunicationScore() < 70) {
                    segments.put("Needs Communication Training", segments.get("Needs Communication Training") + 1);
                }
            } catch (Exception e) {
                // skip
            }
        }

        return segments;
    }
}
