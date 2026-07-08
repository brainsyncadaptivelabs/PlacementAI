package com.aiplacement.backend.placementintelligence.prediction;

import com.aiplacement.backend.placementintelligence.company.profiles.CompanyProfile;
import com.aiplacement.backend.placementintelligence.company.profiles.CompanyProfileRegistry;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PlacementPredictionEngine {

    private final CompanyProfileRegistry registry;

    public Map<String, PredictionDetails> predictCompanySuccess(PlacementContext context) {
        Map<String, PredictionDetails> predictions = new HashMap<>();

        for (Map.Entry<String, CompanyProfile> entry : registry.getAllProfiles().entrySet()) {
            String name = entry.getKey();
            CompanyProfile profile = entry.getValue();

            // Weighted success score
            double codingFactor = context.getCodingScore() * (profile.getCodingPriority() / 100.0);
            double resumeFactor = context.getAtsScore() * (profile.getResumePriority() / 100.0);
            double interviewFactor = context.getInterviewScore() * (profile.getInterviewPriority() / 100.0);
            double commFactor = context.getCommunicationScore() * profile.getCommunicationWeight();

            double baseSuccess = (codingFactor + resumeFactor + interviewFactor + commFactor) / 2.2;
            int successRate = (int) Math.min(99, Math.max(25, baseSuccess + 10));

            // Confidence Index (based on data completeness)
            int hasResumes = (context.getResumes() != null && !context.getResumes().isEmpty()) ? 25 : 0;
            int hasMocks = (context.getMockInterviews() != null && !context.getMockInterviews().isEmpty()) ? 25 : 0;
            int hasStats = (context.getUserStats() != null) ? 25 : 0;
            int hasApt = (context.getAptitudeData() != null) ? 25 : 0;
            int confidence = hasResumes + hasMocks + hasStats + hasApt;

            predictions.put(name, PredictionDetails.builder()
                    .probability(successRate)
                    .confidence(confidence)
                    .reasoning("Evaluated based on match for " + profile.getRequiredSkills().get(0) + " requirements.")
                    .build());
        }

        return predictions;
    }

    @lombok.Value
    @lombok.Builder
    public static class PredictionDetails {
        int probability;
        int confidence;
        String reasoning;
    }
}
