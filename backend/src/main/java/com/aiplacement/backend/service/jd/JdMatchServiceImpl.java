package com.aiplacement.backend.service.jd;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.jd.JdMatchRequestDto;
import com.aiplacement.backend.dto.jd.JdMatchResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JdMatchServiceImpl implements JdMatchService {

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public JdMatchResponseDto matchJobDescription(JdMatchRequestDto request) {
        String prompt = """
                Analyze the candidate resume against the Job Description (JD). Return ONLY valid JSON matching this schema:
                {
                  "matchPercentage": 82,
                  "overallRating": "Strong Match",
                  "missingSkills": ["Docker", "Kubernetes"],
                  "matchedSkills": ["React", "Node.js"],
                  "suggestions": ["Add Docker to resume"],
                  "bestFitRole": "Full Stack Engineer",
                  "aiSummary": "Summary",
                  "learningRecommendations": ["Learn Docker"],

                  "placementAIScore": 81,
                  "atsQualification": {
                    "atsPercentage": 92,
                    "atsVerdict": "Very High",
                    "atsReason": "Reason"
                  },
                  "shortlistingChance": {
                    "shortlistPercentage": 78,
                    "shortlistVerdict": "High",
                    "shortlistReasons": ["✓ Reason 1", "✗ Missing 2"]
                  },
                  "interviewProbability": {
                    "probabilityPercentage": 74,
                    "probabilityVerdict": "High",
                    "probabilityReason": "Reason"
                  },
                  "companyReadiness": [
                    {"companyName": "TCS", "readyPercentage": 98},
                    {"companyName": "Infosys", "readyPercentage": 95},
                    {"companyName": "Accenture", "readyPercentage": 91},
                    {"companyName": "Capgemini", "readyPercentage": 90},
                    {"companyName": "Cognizant", "readyPercentage": 89},
                    {"companyName": "Deloitte", "readyPercentage": 84},
                    {"companyName": "Amazon", "readyPercentage": 63},
                    {"companyName": "Microsoft", "readyPercentage": 57},
                    {"companyName": "Google", "readyPercentage": 48}
                  ],
                  "resumeRadar": [
                    {"subject": "Technical Skills", "score": 85},
                    {"subject": "Projects", "score": 75},
                    {"subject": "ATS Optimization", "score": 90},
                    {"subject": "Experience", "score": 80},
                    {"subject": "Communication", "score": 85},
                    {"subject": "Education", "score": 95},
                    {"subject": "Overall Resume Quality", "score": 88}
                  ],
                  "skillPriority": {
                    "critical": [{"skillName": "Docker", "reason": "Reason"}],
                    "important": [{"skillName": "AWS", "reason": "Reason"}],
                    "optional": [{"skillName": "Kubernetes", "reason": "Reason"}]
                  },
                  "recruiterFeedback": {
                    "verdict": "Likely Shortlisted",
                    "opinion": "Opinion text",
                    "critiques": ["Critique 1"],
                    "actionPoints": ["Action 1"]
                  },
                  "improvementPlan": {
                    "targetPercentage": 91,
                    "steps": [
                      {"stepNumber": 1, "action": "Action", "estimatedTime": "Time", "impact": "Impact"}
                    ]
                  },
                  "benchmark": {
                    "technicalSkillsCandidate": 84,
                    "technicalSkillsAverage": 90,
                    "projectsCandidate": 69,
                    "projectsAverage": 90,
                    "atsCandidate": 92,
                    "atsAverage": 90,
                    "experienceCandidate": 71,
                    "experienceAverage": 90
                  },
                  "riskAnalysis": [
                    {"riskLevel": "High", "riskType": "Type", "reasoning": "Reason"}
                  ],
                  "salaryPrediction": {
                    "expectedMinLpa": "7.5",
                    "expectedMaxLpa": "9.2",
                    "explanation": "Explanation"
                  },
                  "confidenceScore": {
                    "confidencePercentage": 93,
                    "explanation": "Explanation"
                  }
                }
                Resume: %s
                JD: %s
                """.formatted(truncate(request.getResumeText(), 1500), truncate(request.getJobDescription(), 1500));

        String fallbackJson = """
{
  "matchPercentage": 0,
  "overallRating": "Unable to determine",
  "missingSkills": [],
  "matchedSkills": [],
  "suggestions": ["AI service is currently unavailable. Please try again later."],
  "bestFitRole": "Unknown",
  "aiSummary": "Unable to contact the AI engine.",
  "learningRecommendations": [],
  "placementAIScore": 0,
  "atsQualification": {
    "atsPercentage": 0,
    "atsVerdict": "Low",
    "atsReason": "System error or lack of input details."
  },
  "shortlistingChance": {
    "shortlistPercentage": 0,
    "shortlistVerdict": "Low",
    "shortlistReasons": []
  },
  "interviewProbability": {
    "probabilityPercentage": 0,
    "probabilityVerdict": "Low",
    "probabilityReason": "Analysis could not be completed."
  },
  "companyReadiness": [
    {"companyName": "TCS", "readyPercentage": 0},
    {"companyName": "Infosys", "readyPercentage": 0},
    {"companyName": "Accenture", "readyPercentage": 0},
    {"companyName": "Capgemini", "readyPercentage": 0},
    {"companyName": "Cognizant", "readyPercentage": 0},
    {"companyName": "Deloitte", "readyPercentage": 0},
    {"companyName": "Amazon", "readyPercentage": 0},
    {"companyName": "Microsoft", "readyPercentage": 0},
    {"companyName": "Google", "readyPercentage": 0}
  ],
  "resumeRadar": [
    {"subject": "Technical Skills", "score": 0},
    {"subject": "Projects", "score": 0},
    {"subject": "ATS Optimization", "score": 0},
    {"subject": "Experience", "score": 0},
    {"subject": "Communication", "score": 0},
    {"subject": "Education", "score": 0},
    {"subject": "Overall Resume Quality", "score": 0}
  ],
  "skillPriority": {
    "critical": [],
    "important": [],
    "optional": []
  },
  "recruiterFeedback": {
    "verdict": "Uncertain",
    "opinion": "System was unable to perform shortlisting review.",
    "critiques": [],
    "actionPoints": []
  },
  "improvementPlan": {
    "targetPercentage": 0,
    "steps": [
      {"stepNumber": 1, "action": "Upload a valid resume", "estimatedTime": "1 Min", "impact": "N/A"}
    ]
  },
  "benchmark": {
    "technicalSkillsCandidate": 0,
    "technicalSkillsAverage": 90,
    "projectsCandidate": 0,
    "projectsAverage": 90,
    "atsCandidate": 0,
    "atsAverage": 90,
    "experienceCandidate": 0,
    "experienceAverage": 90
  },
  "riskAnalysis": [],
  "salaryPrediction": {
    "expectedMinLpa": "0.0",
    "expectedMaxLpa": "0.0",
    "explanation": "No data available."
  },
  "confidenceScore": {
    "confidencePercentage": 0,
    "explanation": "System offline."
  }
}
""";

        try {
            log.info("Sending job description match request to OllamaClient");
            JsonNode aiJson = ollamaClient.getJsonResponse(prompt, 0.7, e -> {
                throw new RuntimeException("AI Engine is currently unavailable or failed to process the request.");
            });

            JdMatchResponseDto responseDto = JdMatchResponseDto.builder()
                    .matchPercentage(aiJson.has("matchPercentage") ? aiJson.get("matchPercentage").asInt() : 0)
                    .overallRating(aiJson.has("overallRating") ? aiJson.get("overallRating").asText() : "N/A")
                    .aiSummary(aiJson.has("aiSummary") ? aiJson.get("aiSummary").asText() : "")
                    .missingSkills(objectMapper.convertValue(
                            aiJson.get("missingSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .matchedSkills(objectMapper.convertValue(
                            aiJson.get("matchedSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .suggestions(objectMapper.convertValue(
                            aiJson.get("suggestions"),
                            new TypeReference<List<String>>() {}
                    ))
                    .learningRecommendations(objectMapper.convertValue(
                            aiJson.get("learningRecommendations"),
                            new TypeReference<List<String>>() {}
                    ))
                    .bestFitRole(aiJson.has("bestFitRole") ? aiJson.get("bestFitRole").asText() : "Unknown")
                    
                    // Add new fields
                    .placementAIScore(aiJson.has("placementAIScore") ? aiJson.get("placementAIScore").asInt() : 0)
                    .atsQualification(objectMapper.convertValue(
                            aiJson.get("atsQualification"),
                            JdMatchResponseDto.AtsQualificationDto.class
                    ))
                    .shortlistingChance(objectMapper.convertValue(
                            aiJson.get("shortlistingChance"),
                            JdMatchResponseDto.ShortlistingChanceDto.class
                    ))
                    .interviewProbability(objectMapper.convertValue(
                            aiJson.get("interviewProbability"),
                            JdMatchResponseDto.InterviewProbabilityDto.class
                    ))
                    .companyReadiness(objectMapper.convertValue(
                            aiJson.get("companyReadiness"),
                            new TypeReference<List<JdMatchResponseDto.CompanyReadinessDto>>() {}
                    ))
                    .resumeRadar(objectMapper.convertValue(
                            aiJson.get("resumeRadar"),
                            new TypeReference<List<JdMatchResponseDto.RadarCategoryDto>>() {}
                    ))
                    .skillPriority(objectMapper.convertValue(
                            aiJson.get("skillPriority"),
                            JdMatchResponseDto.SkillPriorityDto.class
                    ))
                    .recruiterFeedback(objectMapper.convertValue(
                            aiJson.get("recruiterFeedback"),
                            JdMatchResponseDto.RecruiterFeedbackDto.class
                    ))
                    .improvementPlan(objectMapper.convertValue(
                            aiJson.get("improvementPlan"),
                            JdMatchResponseDto.ImprovementPlanDto.class
                    ))
                    .benchmark(objectMapper.convertValue(
                            aiJson.get("benchmark"),
                            JdMatchResponseDto.BenchmarkDto.class
                    ))
                    .riskAnalysis(objectMapper.convertValue(
                            aiJson.get("riskAnalysis"),
                            new TypeReference<List<JdMatchResponseDto.RiskAnalysisDto>>() {}
                    ))
                    .salaryPrediction(objectMapper.convertValue(
                            aiJson.get("salaryPrediction"),
                            JdMatchResponseDto.SalaryPredictionDto.class
                    ))
                    .confidenceScore(objectMapper.convertValue(
                            aiJson.get("confidenceScore"),
                            JdMatchResponseDto.ConfidenceScoreDto.class
                    ))
                    .build();

            // Validate that we didn't receive an empty or incomplete response from the local LLM
            if (responseDto.getPlacementAIScore() == null || responseDto.getPlacementAIScore() == 0 ||
                responseDto.getAtsQualification() == null || responseDto.getAtsQualification().getAtsPercentage() == 0 ||
                responseDto.getShortlistingChance() == null || responseDto.getShortlistingChance().getShortlistPercentage() == 0 ||
                responseDto.getInterviewProbability() == null || responseDto.getInterviewProbability().getProbabilityPercentage() == 0 ||
                responseDto.getResumeRadar() == null || responseDto.getResumeRadar().isEmpty() ||
                responseDto.getSkillPriority() == null ||
                responseDto.getRecruiterFeedback() == null ||
                responseDto.getCompanyReadiness() == null || responseDto.getCompanyReadiness().isEmpty() ||
                responseDto.getSalaryPrediction() == null || "0.0".equals(responseDto.getSalaryPrediction().getExpectedMinLpa())) {
                throw new RuntimeException("AI engine returned incomplete diagnostic data fields.");
            }

            return responseDto;

        } catch (Exception e) {
            log.error("Failed to match job description", e);
            throw new RuntimeException(e.getMessage());
        }
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}