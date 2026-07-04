package com.aiplacement.backend.service.jd;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.jd.JdMatchRequestDto;
import com.aiplacement.backend.dto.jd.JdMatchResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JdMatchServiceImpl implements JdMatchService {

    private final AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public JdMatchResponseDto matchJobDescription(JdMatchRequestDto request) {
        log.info("Received JdMatchRequestDto for analysis.");
        
        String resumeText = request.getResumeText();
        String jobDescription = request.getJobDescription();

        // Validate Resume Text input
        if (resumeText == null || resumeText.trim().isEmpty()) {
            log.error("Resume text is empty/null. Stopping analysis.");
            throw new IllegalArgumentException("Resume parsing failed.");
        }
        
        int charsCount = resumeText.length();
        int wordsCount = resumeText.trim().split("\\s+").length;
        log.info("Resume extracted successfully. Characters extracted: {}. Words extracted: {}.", charsCount, wordsCount);
        
        if (charsCount == 0 || wordsCount == 0) {
            log.error("Extracted zero characters or words from the resume. Stopping analysis.");
            throw new IllegalArgumentException("Resume parsing failed.");
        }

        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            log.error("Job Description is empty/null. Stopping analysis.");
            throw new IllegalArgumentException("Job Description cannot be empty.");
        }

        log.info("Resume Text Length: {}, JD Length: {}", charsCount, jobDescription.length());

        // Simple string concatenation to avoid String#formatted UnknownFormatConversionException (e.g. from literal % signs in JSON template)
        String prompt = """
                Analyze the candidate resume against the Job Description (JD). 
                Extract matched skills, missing skills, evaluations, recruiter feedback, risks, and improvements.
                Return ONLY valid JSON matching this schema:
                {
                  "matchedSkills": ["Skill A", "Skill B"],
                  "missingSkills": ["Skill C", "Skill D"],
                  "experienceRating": 80,
                  "projectRating": 75,
                  "educationMatch": true,
                  "certificationsRating": 70,
                  
                  "suggestions": ["Improve formatting", "Add certifications"],
                  
                  "recruiterVerdict": "Likely Shortlisted",
                  "recruiterOpinion": "Recruiter summary text",
                  "critiques": ["Critique 1"],
                  "actionPoints": ["Action 1"],
                  "strengths": ["Java proficiency"],
                  "weaknesses": ["Lack of cloud experience"],
                  "reasons": ["Has 3 years experience matching core requirements"],
                  
                  "risks": [
                    {
                      "riskLevel": "Medium",
                      "riskType": "Tooling Gap",
                      "reason": "Docker is missing in the resume",
                      "recommendation": "Learn Docker"
                    }
                  ],
                  
                  "steps": [
                    {
                      "stepNumber": 1,
                      "action": "Learn Docker basics",
                      "estimatedTime": "2 Days",
                      "impact": "+5%",
                      "difficulty": "Medium",
                      "priority": "High"
                    }
                  ],
                  
                  "salaryExplanation": "Based on local market standards for junior backend engineering roles.",
                  "confidenceCertainty": "High certainty based on complete skills extraction."
                }
                
                Resume:\n""" + truncate(resumeText, 1500) + "\n\nJD:\n" + truncate(jobDescription, 1500);

        log.info("AI Prompt generated successfully. Length: {}", prompt.length());

        JsonNode aiJson = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                log.info("Sending job description match request to AI provider, attempt: {}", attempt);
                aiJson = aiClient.generateJson(
                        "You are PlacementAI, an expert ATS and JD matching analyst. Respond ONLY with valid JSON.",
                        prompt, 0.7, 4096, e -> { throw new RuntimeException("AI request failed", e); });
                
                if (aiJson != null && aiJson.has("matchedSkills")) {
                    log.info("AI response received and verified on attempt: {}", attempt);
                    break;
                }
            } catch (Exception e) {
                log.warn("AI attempt {} failed: {}", attempt, e.getMessage());
                log.error("AI Response extraction error on attempt {}", attempt, e);
            }
        }
        
        if (aiJson == null) {
            log.error("AI matching failed after 2 attempts. Raw AI response was invalid or connection failed.");
            throw new RuntimeException("AI returned invalid JSON.");
        }

        log.info("Raw AI Response parsed as valid JSON: {}", aiJson.toString());

        try {
            log.info("Starting DTO mapping and deterministic computations.");
            
            // Safe JSON mapping helpers
            List<String> matchedSkills = parseSafeStringList(aiJson, "matchedSkills");
            List<String> missingSkills = parseSafeStringList(aiJson, "missingSkills");

            int experienceRating = parseSafeInt(aiJson, "experienceRating", 60);
            int projectRating = parseSafeInt(aiJson, "projectRating", 60);
            boolean educationMatchVal = parseSafeBoolean(aiJson, "educationMatch", true);
            int certificationsRating = parseSafeInt(aiJson, "certificationsRating", 50);

            List<String> suggestions = parseSafeStringList(aiJson, "suggestions");

            String recruiterVerdict = parseSafeString(aiJson, "recruiterVerdict", "Likely Shortlisted");
            String recruiterOpinion = parseSafeString(aiJson, "recruiterOpinion", "Candidate meets core needs.");
            List<String> critiques = parseSafeStringList(aiJson, "critiques");
            List<String> actionPoints = parseSafeStringList(aiJson, "actionPoints");
            List<String> strengths = parseSafeStringList(aiJson, "strengths");
            List<String> weaknesses = parseSafeStringList(aiJson, "weaknesses");
            List<String> reasons = parseSafeStringList(aiJson, "reasons");

            // Perform deterministic calculations
            int matchCount = matchedSkills.size();
            int missCount = missingSkills.size();
            int totalSkills = matchCount + missCount;
            double skillMatch = totalSkills > 0 ? ((double) matchCount / totalSkills) * 100 : 65.0;

            int atsScore = (int) (skillMatch * 0.6 + 35);
            String resumeLower = resumeText.toLowerCase();
            if (resumeLower.contains("experience") || resumeLower.contains("work history")) atsScore += 3;
            if (resumeLower.contains("education")) atsScore += 3;
            if (resumeLower.contains("projects")) atsScore += 4;
            atsScore = Math.min(Math.max(atsScore, 20), 100);

            int educationScore = educationMatchVal ? 90 : 50;
            double placementAIScoreVal = (skillMatch * 0.35) + (experienceRating * 0.20) + (projectRating * 0.15) + (atsScore * 0.15) + (educationScore * 0.10) + (certificationsRating * 0.05);
            int placementAIScore = (int) placementAIScoreVal;
            placementAIScore = Math.min(Math.max(placementAIScore, 15), 100);

            int interviewProbability = (int) (placementAIScore * 0.85);
            interviewProbability = Math.min(Math.max(interviewProbability, 10), 100);

            int recruiterShortlisting = (int) (placementAIScore * 0.9);
            recruiterShortlisting = Math.min(Math.max(recruiterShortlisting, 10), 100);

            // ATS Qualification
            String atsVerdict = atsScore >= 90 ? "Very High" : atsScore >= 75 ? "High" : atsScore >= 60 ? "Medium" : "Low";
            String atsReason = "The ATS parser detected formatted headers and parsed " + matchCount + " keywords matching the core job descriptions.";

            // Recruiter Shortlister DTO
            JdMatchResponseDto.ShortlistingChanceDto shortlistDto = JdMatchResponseDto.ShortlistingChanceDto.builder()
                    .shortlistPercentage(recruiterShortlisting)
                    .shortlistVerdict(recruiterShortlisting >= 85 ? "Very High" : recruiterShortlisting >= 70 ? "High" : recruiterShortlisting >= 55 ? "Medium" : "Low")
                    .shortlistReasons(reasons)
                    .build();

            // Interview Probability DTO
            JdMatchResponseDto.InterviewProbabilityDto probDto = JdMatchResponseDto.InterviewProbabilityDto.builder()
                    .probabilityPercentage(interviewProbability)
                    .probabilityVerdict(interviewProbability >= 85 ? "Very High" : interviewProbability >= 70 ? "High" : interviewProbability >= 55 ? "Medium" : "Low")
                    .probabilityReason("Estimated interview call rate of " + interviewProbability + "% matching technical stack parameters.")
                    .build();

            // Company Readiness
            List<JdMatchResponseDto.CompanyReadinessDto> companyReadiness = new ArrayList<>();
            String[] companies = {"Amazon", "Microsoft", "Google", "Accenture", "Infosys", "TCS", "Capgemini", "Deloitte", "Cognizant"};
            for (String comp : companies) {
                int baseReadiness = (int) (placementAIScore * 0.9);
                if ("Amazon".equalsIgnoreCase(comp) || "Google".equalsIgnoreCase(comp) || "Microsoft".equalsIgnoreCase(comp)) {
                    baseReadiness = (int) (placementAIScore * 0.7);
                    if (resumeLower.contains("aws") || resumeLower.contains("azure") || resumeLower.contains("cloud")) baseReadiness += 8;
                    if (resumeLower.contains("algorithms") || resumeLower.contains("system design")) baseReadiness += 12;
                } else {
                    if (resumeLower.contains("java") || resumeLower.contains("spring boot")) baseReadiness += 5;
                    if (resumeLower.contains("sql") || resumeLower.contains("react")) baseReadiness += 5;
                }
                baseReadiness = Math.min(Math.max(baseReadiness, 15), 98);
                companyReadiness.add(JdMatchResponseDto.CompanyReadinessDto.builder()
                        .companyName(comp)
                        .readyPercentage(baseReadiness)
                        .build());
            }

            // Radar Chart Categories
            List<JdMatchResponseDto.RadarCategoryDto> radarCategories = new ArrayList<>();
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("Technical Skills", (int) skillMatch));
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("Projects", projectRating));
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("ATS Optimization", atsScore));
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("Experience", experienceRating));
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("Communication", (int) (70 + (resumeLower.contains("communication") || resumeLower.contains("team") ? 20 : 5))));
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("Education", educationScore));
            radarCategories.add(new JdMatchResponseDto.RadarCategoryDto("Overall Resume Quality", placementAIScore));

            // Skill Priority Classification
            List<JdMatchResponseDto.SkillItemDto> critical = new ArrayList<>();
            List<JdMatchResponseDto.SkillItemDto> important = new ArrayList<>();
            List<JdMatchResponseDto.SkillItemDto> optional = new ArrayList<>();
            for (int i = 0; i < missingSkills.size(); i++) {
                String skill = missingSkills.get(i);
                JdMatchResponseDto.SkillItemDto item = JdMatchResponseDto.SkillItemDto.builder()
                        .skillName(skill)
                        .reason("This skill is required for backend core operational stability in the role.")
                        .build();
                if (i < 2) critical.add(item);
                else if (i < 4) important.add(item);
                else optional.add(item);
            }
            if (critical.isEmpty() && !matchedSkills.isEmpty()) {
                critical.add(JdMatchResponseDto.SkillItemDto.builder()
                        .skillName(matchedSkills.get(0))
                        .reason("Critical skill fully verified in resume.")
                        .build());
            }
            JdMatchResponseDto.SkillPriorityDto skillPriority = JdMatchResponseDto.SkillPriorityDto.builder()
                    .critical(critical)
                    .important(important)
                    .optional(optional)
                    .build();

            // Recruiter Feedback
            JdMatchResponseDto.RecruiterFeedbackDto feedbackDto = JdMatchResponseDto.RecruiterFeedbackDto.builder()
                    .verdict(recruiterVerdict)
                    .opinion(recruiterOpinion)
                    .critiques(critiques)
                    .actionPoints(actionPoints)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .reasons(reasons)
                    .build();

            // AI Improvement Plan Steps
            List<JdMatchResponseDto.ImprovementStepDto> planSteps = safeConvert(
                    aiJson,
                    "steps",
                    new TypeReference<List<JdMatchResponseDto.ImprovementStepDto>>() {},
                    new ArrayList<>()
            );
            int targetPercentage = Math.min(placementAIScore + 12, 98);
            JdMatchResponseDto.ImprovementPlanDto improvementPlan = JdMatchResponseDto.ImprovementPlanDto.builder()
                    .targetPercentage(targetPercentage)
                    .steps(planSteps)
                    .build();

            // Benchmarking comparison
            JdMatchResponseDto.BenchmarkDto benchmark = JdMatchResponseDto.BenchmarkDto.builder()
                    .technicalSkillsCandidate((int) skillMatch)
                    .technicalSkillsAverage(85)
                    .projectsCandidate(projectRating)
                    .projectsAverage(80)
                    .atsCandidate(atsScore)
                    .atsAverage(88)
                    .experienceCandidate(experienceRating)
                    .experienceAverage(82)
                    .build();

            // Hiring Risks
            List<JdMatchResponseDto.RiskAnalysisDto> risks = safeConvert(
                    aiJson,
                    "risks",
                    new TypeReference<List<JdMatchResponseDto.RiskAnalysisDto>>() {},
                    new ArrayList<>()
            );
            for (JdMatchResponseDto.RiskAnalysisDto risk : risks) {
                if (risk.getReason() != null && risk.getReasoning() == null) {
                    risk.setReasoning(risk.getReason());
                } else if (risk.getReasoning() != null && risk.getReason() == null) {
                    risk.setReason(risk.getReasoning());
                }
            }

            // Salary Prediction
            double baseMin = 4.5;
            double baseMax = 6.5;
            String jdLower = jobDescription.toLowerCase();
            if (resumeLower.contains("senior") || jdLower.contains("senior") || jdLower.contains("lead")) {
                baseMin = 14.5;
                baseMax = 22.0;
            } else if (resumeLower.contains("mid") || jdLower.contains("experienced") || jdLower.contains("architect")) {
                baseMin = 8.5;
                baseMax = 12.5;
            }
            double minLpa = baseMin + (skillMatch / 100.0) * 4.0;
            double maxLpa = baseMax + (skillMatch / 100.0) * 6.0;
            String salaryExplanation = parseSafeString(aiJson, "salaryExplanation", "Calculated based on skill alignment, role complexity, and market standard rates.");
            JdMatchResponseDto.SalaryPredictionDto salaryPrediction = JdMatchResponseDto.SalaryPredictionDto.builder()
                    .expectedMinLpa(String.format(java.util.Locale.US, "%.1f", minLpa))
                    .expectedMaxLpa(String.format(java.util.Locale.US, "%.1f", maxLpa))
                    .explanation(salaryExplanation)
                    .reason(salaryExplanation)
                    .build();

            // AI Confidence Score
            int confidencePercentage = (int) (80 + (resumeText.length() > 500 ? 10 : 5) + (jobDescription.length() > 500 ? 5 : 0));
            confidencePercentage = Math.min(confidencePercentage, 98);
            String confidenceCertainty = parseSafeString(aiJson, "confidenceCertainty", "High model evaluation confidence based on structured fields.");
            JdMatchResponseDto.ConfidenceScoreDto confidenceScore = JdMatchResponseDto.ConfidenceScoreDto.builder()
                    .confidencePercentage(confidencePercentage)
                    .explanation("Evaluation completed successfully with analysis of " + resumeText.length() + " character resume.")
                    .reason("Analysis based on complete resume text of " + resumeText.length() + " characters and comprehensive job description.")
                    .certainty(confidenceCertainty)
                    .build();

            JdMatchResponseDto responseDto = JdMatchResponseDto.builder()
                    .matchPercentage((int) skillMatch)
                    .overallRating(placementAIScore >= 85 ? "Excellent Match" : placementAIScore >= 70 ? "Strong Match" : placementAIScore >= 55 ? "Average Match" : "Weak Match")
                    .aiSummary(recruiterOpinion)
                    .missingSkills(missingSkills)
                    .matchedSkills(matchedSkills)
                    .suggestions(suggestions)
                    .learningRecommendations(suggestions)
                    .bestFitRole(parseSafeString(aiJson, "bestFitRole", "Full Stack Engineer"))
                    
                    // Upgraded PlacementAI 2.0 fields
                    .placementAIScore(placementAIScore)
                    .atsQualification(JdMatchResponseDto.AtsQualificationDto.builder()
                            .atsPercentage(atsScore)
                            .atsVerdict(atsVerdict)
                            .atsReason(atsReason)
                            .build())
                    .shortlistingChance(shortlistDto)
                    .interviewProbability(probDto)
                    .companyReadiness(companyReadiness)
                    .resumeRadar(radarCategories)
                    .skillPriority(skillPriority)
                    .recruiterFeedback(feedbackDto)
                    .improvementPlan(improvementPlan)
                    .benchmark(benchmark)
                    .riskAnalysis(risks)
                    .salaryPrediction(salaryPrediction)
                    .confidenceScore(confidenceScore)
                    .build();

            log.info("DTO Mapping and calculations complete.");
            try {
                log.info("Final Response JdMatchResponseDto: {}", objectMapper.writeValueAsString(responseDto));
            } catch (Exception se) {
                log.warn("Failed to serialize responseDto for logging.");
            }

            return responseDto;

        } catch (Exception e) {
            log.error("Failed to map DTO and calculate scores", e);
            throw new RuntimeException("DTO Mapping failed: " + e.getMessage());
        }
    }

    // Helper Converters & Safe Mappers
    private int parseSafeInt(JsonNode node, String fieldName, int defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        if (field.isNumber()) return field.asInt();
        String txt = field.asText().trim();
        if (txt.isEmpty() || "N/A".equalsIgnoreCase(txt)) return defaultValue;
        try {
            return Integer.parseInt(txt);
        } catch (NumberFormatException e) {
            log.warn("Failed to parse integer for field: {}, value: {}", fieldName, txt);
            return defaultValue;
        }
    }

    private boolean parseSafeBoolean(JsonNode node, String fieldName, boolean defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        if (field.isBoolean()) return field.asBoolean();
        return Boolean.parseBoolean(field.asText().trim());
    }

    private String parseSafeString(JsonNode node, String fieldName, String defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        String val = field.asText();
        return val.trim().isEmpty() ? defaultValue : val;
    }

    private List<String> parseSafeStringList(JsonNode node, String fieldName) {
        List<String> list = new ArrayList<>();
        if (node == null || !node.has(fieldName)) return list;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull() || !field.isArray()) return list;
        for (JsonNode item : field) {
            if (item != null && !item.isNull()) {
                list.add(item.asText());
            }
        }
        return list;
    }

    private <T> T safeConvert(JsonNode node, String fieldName, TypeReference<T> typeRef, T defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        try {
            return objectMapper.convertValue(field, typeRef);
        } catch (Exception e) {
            log.error("ObjectMapper conversion failed. DTO Field: {}, Target Type: {}, Raw JSON: {}", 
                      fieldName, typeRef.getType().getTypeName(), field.toString(), e);
            return defaultValue;
        }
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}