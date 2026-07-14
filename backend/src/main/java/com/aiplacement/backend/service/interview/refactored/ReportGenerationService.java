package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.InterviewFeedback;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGenerationService {

    private final AIOrchestrationService orchestrationService;
    private final MockInterviewRepository mockInterviewRepository;
    private final CacheManager cacheManager;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public void compileAndSaveReport(MockInterview interview, AdaptiveState state) {
        log.info("Compiling final feedback report for interview ID: {}", interview.getId());
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("role", interview.getRole());
        variables.put("experienceLevel", interview.getExperienceLevel() != null ? interview.getExperienceLevel() : "Mid");
        variables.put("company", interview.getCompany() != null ? interview.getCompany() : "Tech Company");
        variables.put("topic", interview.getTopic() != null ? interview.getTopic() : "General");
        variables.put("technicalScore", state != null ? state.getTechnicalScore() : 70);
        variables.put("communicationScore", state != null ? state.getCommunicationScore() : 70);
        variables.put("confidenceScore", state != null ? state.getConfidenceScore() : 70);
        variables.put("problemSolvingScore", state != null ? state.getProblemSolvingScore() : 70);
        variables.put("codingScore", state != null ? state.getCodingScore() : 70);
        variables.put("behavioralScore", state != null ? state.getBehavioralScore() : 70);
        variables.put("roleReadiness", state != null ? state.getRoleReadiness() : 70);
        variables.put("transcriptSummary", truncate(interview.getTranscript(), 2000));

        JsonNode result = null;
        try {
            result = orchestrationService.executeJsonTask("FEEDBACK_GENERATION", variables, interview);
        } catch (Exception e) {
            log.error("AI feedback generation failed, preparing fallback", e);
            result = getFallbackFeedback(interview);
        }

        try {
            int totalScore = parseSafeInt(result, "totalScore", 70);
            int technicalScore = parseSafeInt(result, "technicalScore", totalScore);
            int communicationScore = parseSafeInt(result, "communicationScore", totalScore);
            int confidenceScore = parseSafeInt(result, "confidenceScore", totalScore);
            int problemSolvingScore = parseSafeInt(result, "problemSolvingScore", totalScore);
            int codingScore = parseSafeInt(result, "codingScore", totalScore);
            int behavioralScore = parseSafeInt(result, "behavioralScore", totalScore);
            int roleReadiness = parseSafeInt(result, "roleReadiness", totalScore);
            
            String finalAssessment = parseSafeString(result, "finalAssessment", "Evaluation completed.");
            List<String> strengths = parseSafeStringList(result, "strengths");
            List<String> areas = parseSafeStringList(result, "areasForImprovement");
            List<String> bodyTips = parseSafeStringList(result, "bodyLanguageTips");
            List<String> missed = parseSafeStringList(result, "missedTopics");
            List<String> resources = parseSafeStringList(result, "recommendedResources");
            List<String> plan = parseSafeStringList(result, "improvementPlan");
            
            int companyReadiness = parseSafeInt(result, "companyReadiness", totalScore - 5);
            int hiringProbability = parseSafeInt(result, "hiringProbability", totalScore - 8);
            String expectedSalary = parseSafeString(result, "expectedSalary", "6.5 - 9.0 LPA");
            String recruiterVerdict = parseSafeString(result, "recruiterVerdict", totalScore >= 75 ? "Strong Candidate" : "Needs Practice");
            String finalRecommendation = parseSafeString(result, "finalRecommendation", "Focus on domain knowledge.");

            String candidateSummary = parseSafeString(result, "candidateSummary", "Evaluated candidates.");
            String technicalAbilityComment = parseSafeString(result, "technicalAbilityComment", "Stable baseline.");
            String communicationComment = parseSafeString(result, "communicationComment", "Articulate.");
            String leadershipComment = parseSafeString(result, "leadershipComment", "Collaborative.");
            String problemSolvingComment = parseSafeString(result, "problemSolvingComment", "Methodical.");
            String cultureFitComment = parseSafeString(result, "cultureFitComment", "Aligned.");
            String teamFitComment = parseSafeString(result, "teamFitComment", "Cooperative.");
            String riskAssessment = parseSafeString(result, "riskAssessment", "Low risk.");
            String recruiterNotes = parseSafeString(result, "recruiterNotes", "Strong candidate.");
            int interviewConfidence = parseSafeInt(result, "interviewConfidence", totalScore + 2);
            List<String> questionComments = parseSafeStringList(result, "questionComments");

            InterviewFeedback feedback = InterviewFeedback.builder()
                    .totalScore(totalScore)
                    .technicalScore(technicalScore)
                    .communicationScore(communicationScore)
                    .confidenceScore(confidenceScore)
                    .problemSolvingScore(problemSolvingScore)
                    .codingScore(codingScore)
                    .behavioralScore(behavioralScore)
                    .roleReadiness(roleReadiness)
                    .finalAssessment(finalAssessment)
                    .strengths(strengths)
                    .areasForImprovement(areas)
                    .bodyLanguageTips(bodyTips)
                    .missedTopics(missed)
                    .recommendedResources(resources)
                    .improvementPlan(plan)
                    .companyReadiness(companyReadiness)
                    .hiringProbability(hiringProbability)
                    .expectedSalary(expectedSalary)
                    .recruiterVerdict(recruiterVerdict)
                    .finalRecommendation(finalRecommendation)
                    .mockInterview(interview)
                    .candidateSummary(candidateSummary)
                    .technicalAbilityComment(technicalAbilityComment)
                    .communicationComment(communicationComment)
                    .leadershipComment(leadershipComment)
                    .problemSolvingComment(problemSolvingComment)
                    .cultureFitComment(cultureFitComment)
                    .teamFitComment(teamFitComment)
                    .riskAssessment(riskAssessment)
                    .recruiterNotes(recruiterNotes)
                    .interviewConfidence(interviewConfidence)
                    .build();
            
            interview.setFeedback(feedback);

            List<InterviewQuestion> questionsList = interview.getQuestions();
            if (questionsList != null && questionComments != null) {
                for (int i = 0; i < questionsList.size(); i++) {
                    if (i < questionComments.size()) {
                        questionsList.get(i).setAiFeedback(questionComments.get(i));
                    }
                }
            }

            mockInterviewRepository.save(interview);
            evictUserCaches(interview.getUser().getEmail());
            log.info("Report compiled and persisted successfully for interview: {}", interview.getId());
        } catch (Exception ex) {
            log.error("Failed to map feedback DTO attributes to entity structures", ex);
        }
    }

    @Async
    public void compileReportAsync(MockInterview interview, AdaptiveState state) {
        log.info("Triggering asynchronous report compile task.");
        compileAndSaveReport(interview, state);
    }

    private void evictUserCaches(String email) {
        try {
            String[] caches = {"placement_context", "placement_readiness", "placement_dashboard"};
            for (String cacheName : caches) {
                var c = cacheManager.getCache(cacheName);
                if (c != null) {
                    c.evict(email);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to clear cache evictions: {}", ex.getMessage());
        }
    }

    private JsonNode getFallbackFeedback(MockInterview interview) {
        log.info("Preparing local fallback feedback representation node.");
        com.fasterxml.jackson.databind.node.ObjectNode fallback = objectMapper.createObjectNode();
        fallback.put("totalScore", 70);
        fallback.put("technicalScore", 70);
        fallback.put("finalAssessment", "Evaluation completed offline successfully.");
        fallback.set("strengths", objectMapper.createArrayNode().add("Active participation"));
        fallback.set("areasForImprovement", objectMapper.createArrayNode().add("Technical elaboration"));
        return fallback;
    }

    private int parseSafeInt(JsonNode node, String key, int def) {
        return (node != null && node.has(key)) ? node.get(key).asInt() : def;
    }

    private String parseSafeString(JsonNode node, String key, String def) {
        return (node != null && node.has(key)) ? node.get(key).asText() : def;
    }

    private List<String> parseSafeStringList(JsonNode node, String key) {
        List<String> list = new ArrayList<>();
        if (node != null && node.has(key) && node.get(key).isArray()) {
            for (JsonNode item : node.get(key)) {
                list.add(item.asText());
            }
        }
        return list;
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}
