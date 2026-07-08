package com.aiplacement.backend.placementintelligence.company;

import com.aiplacement.backend.placementintelligence.dto.CompanyReadinessDto;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CompanyReadinessEngine {

    private static final List<String> SUPPORTED_COMPANIES = List.of(
            "Accenture", "TCS", "Cognizant", "FAANG", "IBM", "Oracle",
            "Deloitte", "EY", "Wipro", "HCL", "DeltaX", "Zensar"
    );

    public CompanyReadinessDto calculateCompanyReadiness(
            int resumeScore, int codingScore, int interviewScore,
            int communicationScore, int aptitudeScore) {

        Map<String, Integer> readiness = new HashMap<>();

        for (String company : SUPPORTED_COMPANIES) {
            double calculated = 0;
            switch (company) {
                case "FAANG":
                    calculated = (codingScore * 0.6) + (interviewScore * 0.3) + (resumeScore * 0.1);
                    break;
                case "Oracle":
                case "IBM":
                    calculated = (codingScore * 0.4) + (interviewScore * 0.3) + (aptitudeScore * 0.2) + (resumeScore * 0.1);
                    break;
                case "Deloitte":
                case "EY":
                    calculated = (communicationScore * 0.4) + (interviewScore * 0.3) + (aptitudeScore * 0.2) + (resumeScore * 0.1);
                    break;
                case "Accenture":
                case "TCS":
                case "Cognizant":
                case "Wipro":
                case "HCL":
                case "Zensar":
                case "DeltaX":
                    calculated = (resumeScore * 0.3) + (aptitudeScore * 0.3) + (communicationScore * 0.2) + (codingScore * 0.2);
                    break;
                default:
                    calculated = (resumeScore + codingScore + interviewScore + communicationScore + aptitudeScore) / 5.0;
            }

            int finalScore = (int) Math.round(calculated);
            finalScore = Math.min(100, Math.max(10, finalScore)); // range 10-100
            readiness.put(company, finalScore);
        }

        return CompanyReadinessDto.builder()
                .readiness(readiness)
                .build();
    }
}
