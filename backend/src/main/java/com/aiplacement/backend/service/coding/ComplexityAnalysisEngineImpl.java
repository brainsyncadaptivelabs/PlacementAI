package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.coding.CodingComplexity;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import com.aiplacement.backend.repository.coding.CodingComplexityRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplexityAnalysisEngineImpl implements ComplexityAnalysisEngine {

    private final AIClient aiClient;
    private final CodingComplexityRepository complexityRepository;

    @Override
    @Transactional
    public CodingComplexity analyze(CodingSubmission submission, String problemStatement,
                                    String expectedTimeComplexity, String expectedSpaceComplexity) {
        log.info("[CODING] [COMPLEXITY] Analyzing complexity for submission ID: {}", submission.getId());

        String code = submission.getCode() != null
                ? submission.getCode().substring(0, Math.min(submission.getCode().length(), 3000))
                : "";

        String prompt = """
                You are an expert algorithm analyst specializing in complexity analysis.
                
                PROBLEM STATEMENT: %s
                CANDIDATE CODE (%s):
                %s
                
                EXPECTED TIME COMPLEXITY: %s
                EXPECTED SPACE COMPLEXITY: %s
                
                Analyze the code and return ONLY valid JSON:
                {
                  "estimatedTimeComplexity": "O(n^2)",
                  "estimatedSpaceComplexity": "O(n)",
                  "isBruteForce": false,
                  "isOptimal": true,
                  "hasInfiniteLoopRisk": false,
                  "hasRecursionIssue": false,
                  "hasMemoryLeak": false,
                  "complexityScore": 85,
                  "detectedPatterns": "Sliding Window, Two Pointers",
                  "analysis": "<2-3 paragraph detailed complexity explanation>",
                  "optimizationSuggestions": "<Specific optimization suggestions if applicable>"
                }
                """.formatted(
                problemStatement != null ? problemStatement.substring(0, Math.min(problemStatement.length(), 1500)) : "N/A",
                submission.getLanguage(),
                code,
                expectedTimeComplexity != null ? expectedTimeComplexity : "Not specified",
                expectedSpaceComplexity != null ? expectedSpaceComplexity : "Not specified"
        );

        JsonNode response = null;
        try {
            response = aiClient.generateJson(
                    "You are an expert algorithm analyst. Respond ONLY with valid JSON.",
                    prompt, 0.2, 2048, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.warn("[CODING] [COMPLEXITY] Analysis failed: {}", e.getMessage());
        }

        CodingComplexity complexity;
        if (response != null) {
            complexity = CodingComplexity.builder()
                    .codingSubmission(submission)
                    .estimatedTimeComplexity(response.path("estimatedTimeComplexity").asText("Unknown"))
                    .estimatedSpaceComplexity(response.path("estimatedSpaceComplexity").asText("Unknown"))
                    .expectedTimeComplexity(expectedTimeComplexity)
                    .expectedSpaceComplexity(expectedSpaceComplexity)
                    .isBruteForce(response.path("isBruteForce").asBoolean(false))
                    .isOptimal(response.path("isOptimal").asBoolean(false))
                    .hasInfiniteLoopRisk(response.path("hasInfiniteLoopRisk").asBoolean(false))
                    .hasRecursionIssue(response.path("hasRecursionIssue").asBoolean(false))
                    .hasMemoryLeak(response.path("hasMemoryLeak").asBoolean(false))
                    .complexityScore(response.path("complexityScore").asDouble(50))
                    .detectedPatterns(response.path("detectedPatterns").asText(""))
                    .analysis(response.path("analysis").asText(""))
                    .optimizationSuggestions(response.path("optimizationSuggestions").asText(""))
                    .build();
        } else {
            complexity = CodingComplexity.builder()
                    .codingSubmission(submission)
                    .estimatedTimeComplexity("Unknown")
                    .estimatedSpaceComplexity("Unknown")
                    .expectedTimeComplexity(expectedTimeComplexity)
                    .expectedSpaceComplexity(expectedSpaceComplexity)
                    .complexityScore(50.0)
                    .analysis("Complexity analysis unavailable.")
                    .build();
        }

        complexity = complexityRepository.save(complexity);
        log.info("[CODING] [COMPLEXITY] Analysis done. Time: {}, Brute force: {}, Score: {}",
                complexity.getEstimatedTimeComplexity(), complexity.isBruteForce(), complexity.getComplexityScore());
        return complexity;
    }
}
