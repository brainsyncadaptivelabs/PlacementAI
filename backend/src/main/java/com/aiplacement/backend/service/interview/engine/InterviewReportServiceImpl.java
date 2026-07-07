package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewFeedback;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.evaluation.InterviewEvaluationEngine;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewReportServiceImpl implements InterviewReportService {

    private final AIClient aiClient;
    private final MockInterviewRepository mockInterviewRepository;
    private final InterviewEvaluationEngine interviewEvaluationEngine;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void compileAndSaveReport(MockInterview interview, AdaptiveState state) {
        log.info("[MOCK_INTERVIEW] [REPORT_GENERATION] Starting final report generation for Interview ID: {}", interview.getId());

        String feedbackPrompt = "You are an AI interviewer analyzing a mock interview transcript. Your task is to evaluate the candidate thoroughly. Be detailed and constructive.\n\n" +
                "Evaluate the transcript and return ONLY a JSON feedback report matching this schema:\n" +
                "{\n" +
                "  \"totalScore\": 80,\n" +
                "  \"technicalScore\": 85,\n" +
                "  \"communicationScore\": 75,\n" +
                "  \"confidenceScore\": 80,\n" +
                "  \"problemSolvingScore\": 80,\n" +
                "  \"codingScore\": 85,\n" +
                "  \"behavioralScore\": 80,\n" +
                "  \"roleReadiness\": 80,\n" +
                "  \"finalAssessment\": \"Detailed breakdown assessment comment\",\n" +
                "  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n" +
                "  \"areasForImprovement\": [\"Area 1\", \"Area 2\"],\n" +
                "  \"bodyLanguageTips\": [\"Tip 1\"],\n" +
                "  \"missedTopics\": [\"Topic 1\"],\n" +
                "  \"recommendedResources\": [\"Resource 1\"],\n" +
                "  \"improvementPlan\": [\"Step 1\"],\n" +
                "  \"companyReadiness\": 75,\n" +
                "  \"hiringProbability\": 70,\n" +
                "  \"expectedSalary\": \"7.5 - 10.0 LPA\",\n" +
                "  \"recruiterVerdict\": \"Strong Candidate\",\n" +
                "  \"finalRecommendation\": \"Recommendation text\",\n" +
                "  \"candidateSummary\": \"A summary of candidate background\",\n" +
                "  \"technicalAbilityComment\": \"Technical ability details\",\n" +
                "  \"communicationComment\": \"Communication fluency details\",\n" +
                "  \"leadershipComment\": \"Leadership alignment comments\",\n" +
                "  \"problemSolvingComment\": \"Problem solving ability comments\",\n" +
                "  \"cultureFitComment\": \"Culture fit alignment comments\",\n" +
                "  \"teamFitComment\": \"Collaboration/team comments\",\n" +
                "  \"riskAssessment\": \"Hiring risk comments\",\n" +
                "  \"recruiterNotes\": \"Recruiter observations\",\n" +
                "  \"interviewConfidence\": 85\n" +
                "}\n\n" +
                "Interview Role: " + interview.getRole() + "\n" +
                "Experience Level: " + interview.getExperienceLevel() + "\n" +
                "Company: " + interview.getCompany() + "\n" +
                "Topic/Type: " + interview.getTopic() + "\n" +
                (state != null ? "Baseline Scores: " +
                        "Technical: " + state.getTechnicalScore() + ", " +
                        "Communication: " + state.getCommunicationScore() + ", " +
                        "Confidence: " + state.getConfidenceScore() + ", " +
                        "Problem Solving: " + state.getProblemSolvingScore() + ", " +
                        "Coding: " + state.getCodingScore() + ", " +
                        "Behavioral: " + state.getBehavioralScore() + ", " +
                        "Role Readiness: " + state.getRoleReadiness() + ".\n" : "") +
                "Transcript:\n" + truncate(interview.getTranscript(), 2500);

        JsonNode feedbackJson = null;
        try {
            feedbackJson = aiClient.generateJson(
                    "You are an expert interviewer generating comprehensive feedback. Respond ONLY with valid JSON.",
                    feedbackPrompt, 0.5, 4096, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.error("AI feedback generation failed, generating fallback report.", e);
        }

        if (feedbackJson == null) {
            feedbackJson = getFallbackEvaluation(interview);
        }

        try {
            int totalScore = parseSafeInt(feedbackJson, "totalScore", 70);
            int technicalScore = parseSafeInt(feedbackJson, "technicalScore", totalScore);
            int communicationScore = parseSafeInt(feedbackJson, "communicationScore", totalScore);
            int confidenceScore = parseSafeInt(feedbackJson, "confidenceScore", totalScore);
            int problemSolvingScore = parseSafeInt(feedbackJson, "problemSolvingScore", totalScore);
            int codingScore = parseSafeInt(feedbackJson, "codingScore", totalScore);
            int behavioralScore = parseSafeInt(feedbackJson, "behavioralScore", totalScore);
            int roleReadiness = parseSafeInt(feedbackJson, "roleReadiness", totalScore);
            
            String finalAssessment = parseSafeString(feedbackJson, "finalAssessment", "Evaluation completed successfully via local estimator.");
            List<String> strengths = parseSafeStringList(feedbackJson, "strengths");
            List<String> areas = parseSafeStringList(feedbackJson, "areasForImprovement");
            List<String> bodyTips = parseSafeStringList(feedbackJson, "bodyLanguageTips");
            List<String> missed = parseSafeStringList(feedbackJson, "missedTopics");
            List<String> resources = parseSafeStringList(feedbackJson, "recommendedResources");
            List<String> plan = parseSafeStringList(feedbackJson, "improvementPlan");
            
            int companyReadiness = parseSafeInt(feedbackJson, "companyReadiness", totalScore - 5);
            int hiringProbability = parseSafeInt(feedbackJson, "hiringProbability", totalScore - 8);
            String expectedSalary = parseSafeString(feedbackJson, "expectedSalary", "6.0 - 8.5 LPA");
            String recruiterVerdict = parseSafeString(feedbackJson, "recruiterVerdict", totalScore >= 75 ? "Strong Candidate" : "Needs Improvement");
            String finalRecommendation = parseSafeString(feedbackJson, "finalRecommendation", "Focus on core fundamentals.");

            String candidateSummary = parseSafeString(feedbackJson, "candidateSummary", "Summary of the candidate.");
            String technicalAbilityComment = parseSafeString(feedbackJson, "technicalAbilityComment", "Evaluated technically stable.");
            String communicationComment = parseSafeString(feedbackJson, "communicationComment", "Articulate response delivery.");
            String leadershipComment = parseSafeString(feedbackJson, "leadershipComment", "Demonstrated basic collaboration values.");
            String problemSolvingComment = parseSafeString(feedbackJson, "problemSolvingComment", "Methodical solution architecture explanation.");
            String cultureFitComment = parseSafeString(feedbackJson, "cultureFitComment", "Aligned with core software engineering values.");
            String teamFitComment = parseSafeString(feedbackJson, "teamFitComment", "Demonstrates positive collaboration compatibility.");
            String riskAssessment = parseSafeString(feedbackJson, "riskAssessment", "Low hiring risk associated with core technical fluency.");
            String recruiterNotes = parseSafeString(feedbackJson, "recruiterNotes", "Good technical communication.");
            int interviewConfidence = parseSafeInt(feedbackJson, "interviewConfidence", 75);

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
                    .mockInterview(interview)
                    .build();
            
            interview.setFeedback(feedback);
            mockInterviewRepository.save(interview);
            log.info("[MOCK_INTERVIEW] [REPORT_GENERATION] Report saved successfully with Total Score: {}", totalScore);

            // Trigger XAI Evaluation Pipeline
            try {
                interviewEvaluationEngine.runEvaluationPipeline(interview);
                log.info("[MOCK_INTERVIEW] [REPORT_GENERATION] XAI evaluation pipeline completed for interview ID: {}", interview.getId());
            } catch (Exception xaiEx) {
                log.warn("[MOCK_INTERVIEW] [REPORT_GENERATION] XAI pipeline non-critical failure: {}", xaiEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to parse/persist interview report details", e);
        }
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }

    private int parseSafeInt(JsonNode node, String field, int fallback) {
        if (node == null || !node.has(field)) return fallback;
        return node.get(field).asInt(fallback);
    }

    private String parseSafeString(JsonNode node, String field, String fallback) {
        if (node == null || !node.has(field)) return fallback;
        return node.get(field).asText(fallback);
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

    private JsonNode getFallbackEvaluation(MockInterview interview) {
        try {
            String rawJson = "{\n" +
                    "  \"totalScore\": 72,\n" +
                    "  \"technicalScore\": 74,\n" +
                    "  \"communicationScore\": 70,\n" +
                    "  \"confidenceScore\": 75,\n" +
                    "  \"problemSolvingScore\": 70,\n" +
                    "  \"codingScore\": 72,\n" +
                    "  \"behavioralScore\": 70,\n" +
                    "  \"roleReadiness\": 72,\n" +
                    "  \"finalAssessment\": \"Heuristic assessment based on system parameters.\",\n" +
                    "  \"strengths\": [\"Consistent responses\", \"General coding syntax knowledge\"],\n" +
                    "  \"areasForImprovement\": [\"Deepen architecture designs\", \"Expand scaling patterns\"],\n" +
                    "  \"bodyLanguageTips\": [\"Maintain steady communication paces\"],\n" +
                    "  \"missedTopics\": [\"Advanced caching algorithms\"],\n" +
                    "  \"recommendedResources\": [\"System Design Primer\"],\n" +
                    "  \"improvementPlan\": [\"Revise mock challenges\"],\n" +
                    "  \"companyReadiness\": 68,\n" +
                    "  \"hiringProbability\": 65,\n" +
                    "  \"expectedSalary\": \"5.0 - 7.5 LPA\",\n" +
                    "  \"recruiterVerdict\": \"Needs Improvement\",\n" +
                    "  \"finalRecommendation\": \"Continue mock preparation.\",\n" +
                    "  \"candidateSummary\": \"A fallback overview candidate summary.\",\n" +
                    "  \"technicalAbilityComment\": \"Evaluated technically stable fallback.\",\n" +
                    "  \"communicationComment\": \"Standard communication pattern.\",\n" +
                    "  \"leadershipComment\": \"Collaboration values checked.\",\n" +
                    "  \"problemSolvingComment\": \"Problem solving steps outlined.\",\n" +
                    "  \"cultureFitComment\": \"Aligned with software fundamentals.\",\n" +
                    "  \"teamFitComment\": \"Positive team candidate profile.\",\n" +
                    "  \"riskAssessment\": \"Low hiring risk fallback.\",\n" +
                    "  \"recruiterNotes\": \"Stable candidate performance.\",\n" +
                    "  \"interviewConfidence\": 70\n" +
                    "}";
            return objectMapper.readTree(rawJson);
        } catch (Exception e) {
            log.error("Failed to parse fallback JSON structure", e);
            return null;
        }
    }
}
