package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.coding.CodingEvaluation;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import com.aiplacement.backend.repository.coding.CodingEvaluationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiCodeReviewEngineImpl implements AiCodeReviewEngine {

    private final AIClient aiClient;
    private final CodingEvaluationRepository evaluationRepository;

    @Override
    @Transactional
    public CodingEvaluation review(CodingSubmission submission, String problemStatement, String role) {
        log.info("[CODING] [AI_REVIEW] Starting code review for submission ID: {}", submission.getId());

        String prompt = """
                You are a world-class code reviewer and senior engineer reviewing a candidate's solution for the role of %s.
                
                PROBLEM STATEMENT:
                %s
                
                CANDIDATE CODE (%s):
                %s
                
                EXECUTION RESULT: %s | Pass Rate: %d%%
                
                Evaluate the code across 13 dimensions. DO NOT reward brute force. Evaluate UNDERSTANDING and QUALITY.
                
                Return ONLY valid JSON matching this exact schema:
                {
                  "correctness": <0-100>,
                  "logic": <0-100>,
                  "readability": <0-100>,
                  "naming": <0-100>,
                  "structure": <0-100>,
                  "modularity": <0-100>,
                  "maintainability": <0-100>,
                  "performance": <0-100>,
                  "memoryUsage": <0-100>,
                  "errorHandling": <0-100>,
                  "security": <0-100>,
                  "scalability": <0-100>,
                  "bestPractices": <0-100>,
                  "overallScore": <0-100>,
                  "confidence": <0-100>,
                  "reviewText": "<Detailed 3-5 paragraph code review>",
                  "strengths": "<Top 3 things done well>",
                  "weaknesses": "<Top 3 issues found>",
                  "improvementSuggestions": "<Specific actionable improvements>",
                  "securityIssues": "<Any security vulnerabilities or empty string>",
                  "codeSmells": "<Code smells detected or empty string>"
                }
                """.formatted(
                role,
                problemStatement != null ? problemStatement.substring(0, Math.min(problemStatement.length(), 2000)) : "N/A",
                submission.getLanguage(),
                submission.getCode() != null ? submission.getCode().substring(0, Math.min(submission.getCode().length(), 3000)) : "",
                submission.getStatus() != null ? submission.getStatus() : "UNKNOWN",
                submission.getPassRate() != null ? submission.getPassRate() : 0
        );

        JsonNode response = null;
        try {
            response = aiClient.generateJson(
                    "You are a world-class code reviewer. Respond ONLY with valid JSON.",
                    prompt, 0.3, 3000, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.warn("[CODING] [AI_REVIEW] AI review failed: {}", e.getMessage());
        }

        CodingEvaluation eval;
        if (response != null) {
            eval = CodingEvaluation.builder()
                    .codingSubmission(submission)
                    .correctness(response.path("correctness").asDouble(50))
                    .logic(response.path("logic").asDouble(50))
                    .readability(response.path("readability").asDouble(50))
                    .naming(response.path("naming").asDouble(50))
                    .structure(response.path("structure").asDouble(50))
                    .modularity(response.path("modularity").asDouble(50))
                    .maintainability(response.path("maintainability").asDouble(50))
                    .performance(response.path("performance").asDouble(50))
                    .memoryUsage(response.path("memoryUsage").asDouble(50))
                    .errorHandling(response.path("errorHandling").asDouble(50))
                    .security(response.path("security").asDouble(50))
                    .scalability(response.path("scalability").asDouble(50))
                    .bestPractices(response.path("bestPractices").asDouble(50))
                    .overallScore(response.path("overallScore").asDouble(50))
                    .confidence(response.path("confidence").asDouble(60))
                    .reviewText(response.path("reviewText").asText(""))
                    .strengths(response.path("strengths").asText(""))
                    .weaknesses(response.path("weaknesses").asText(""))
                    .improvementSuggestions(response.path("improvementSuggestions").asText(""))
                    .securityIssues(response.path("securityIssues").asText(""))
                    .codeSmells(response.path("codeSmells").asText(""))
                    .build();
        } else {
            // Fallback based on pass rate
            double baseScore = submission.getPassRate() != null ? submission.getPassRate() * 0.7 : 40.0;
            eval = CodingEvaluation.builder()
                    .codingSubmission(submission)
                    .correctness(baseScore)
                    .logic(baseScore)
                    .readability(50.0).naming(50.0).structure(50.0)
                    .modularity(50.0).maintainability(50.0)
                    .performance(50.0).memoryUsage(50.0)
                    .errorHandling(50.0).security(50.0)
                    .scalability(50.0).bestPractices(50.0)
                    .overallScore(baseScore)
                    .confidence(40.0)
                    .reviewText("Code review unavailable. Scored based on test case pass rate.")
                    .strengths("").weaknesses("").improvementSuggestions("").securityIssues("").codeSmells("")
                    .build();
        }

        eval = evaluationRepository.save(eval);
        log.info("[CODING] [AI_REVIEW] Review completed. Score: {}", eval.getOverallScore());
        return eval;
    }
}
