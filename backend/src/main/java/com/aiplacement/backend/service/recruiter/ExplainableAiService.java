package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.AiRecommendationDto;
import com.aiplacement.backend.dto.recruiter.CompanyReadinessDto;
import com.aiplacement.backend.dto.recruiter.ExplainableScoreDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExplainableAiService {

    public ExplainableScoreDto generateExplainableScore(String metricName, Integer score, String category, List<String> positive, List<String> negative, String summary) {
        return ExplainableScoreDto.builder()
                .metricName(metricName)
                .score(score)
                .category(category)
                .positiveEvidence(positive)
                .negativeEvidence(negative)
                .summary(summary)
                .build();
    }

    public CompanyReadinessDto generateCompanyReadiness(String companyName, Integer score, List<String> strengths, List<String> needsImprovement) {
        return CompanyReadinessDto.builder()
                .companyName(companyName)
                .readinessScore(score)
                .strengths(strengths)
                .needsImprovement(needsImprovement)
                .build();
    }

    public AiRecommendationDto generateRecommendation(String recommendation, String confidence, String reason, List<String> focusAreas) {
        return AiRecommendationDto.builder()
                .recommendation(recommendation)
                .confidence(confidence)
                .reason(reason)
                .suggestedInterviewFocus(focusAreas)
                .build();
    }
}
