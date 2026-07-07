package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingTestCase;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
import com.aiplacement.backend.repository.coding.CodingTestCaseRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodingProblemGeneratorEngineImpl implements CodingProblemGeneratorEngine {

    private final AIClient aiClient;
    private final CodingProblemRepository codingProblemRepository;
    private final CodingTestCaseRepository codingTestCaseRepository;
    private final MockInterviewRepository mockInterviewRepository;

    @Override
    @Transactional
    public CodingProblem generateProblem(AdaptiveState state, Long interviewId, Long questionId, String historyContext) {
        log.info("[CODING] [PROBLEM_GEN] Generating coding problem for interview: {}, role: {}, difficulty: {}",
                interviewId, state.getRole(), state.getCurrentDifficulty());

        String prompt = """
                You are a senior technical interviewer generating a coding interview problem.
                
                Candidate Role: %s
                Experience Level: %s
                Target Company: %s
                Current Difficulty: %s
                Topics Covered: %s
                Candidate History Context: %s
                
                Generate a UNIQUE coding problem that:
                1. Matches the role, experience level, and difficulty
                2. Has NOT been seen before in this interview (check topics covered)
                3. Tests real-world coding skills, not trivia
                4. Includes clear problem statement, constraints, and examples
                
                Return ONLY valid JSON matching this exact schema:
                {
                  "title": "Two Sum",
                  "difficulty": "Medium",
                  "tags": "Arrays,Hash Map",
                  "targetLanguages": "python,java,javascript",
                  "problemStatement": "Full problem description here...",
                  "constraints": "1 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9",
                  "examples": "Input: nums = [2,7,11,15], target = 9\\nOutput: [0,1]\\nExplanation: nums[0] + nums[1] = 9",
                  "hints": "Consider using a hash map for O(n) solution",
                  "timeComplexityTarget": "O(n)",
                  "spaceComplexityTarget": "O(n)",
                  "solutionApproach": "Use a hash map to store seen values. For each element, check if complement exists.",
                  "testCases": [
                    {"input": "[2,7,11,15]\\n9", "expectedOutput": "[0, 1]", "hidden": false, "boundary": false, "performance": false, "ordinal": 0, "description": "Basic test"},
                    {"input": "[3,2,4]\\n6", "expectedOutput": "[1, 2]", "hidden": false, "boundary": false, "performance": false, "ordinal": 1, "description": "No target at start"},
                    {"input": "[3,3]\\n6", "expectedOutput": "[0, 1]", "hidden": true, "boundary": false, "performance": false, "ordinal": 2, "description": "Duplicate elements"},
                    {"input": "[1]\\n2", "expectedOutput": "[]", "hidden": true, "boundary": true, "performance": false, "ordinal": 3, "description": "Single element edge case"},
                    {"input": "<large array of 10000 elements>", "expectedOutput": "<result>", "hidden": true, "boundary": false, "performance": true, "ordinal": 4, "description": "Performance test"}
                  ]
                }
                """.formatted(
                state.getRole(),
                state.getExperienceLevel(),
                state.getCompany(),
                state.getCurrentDifficulty(),
                String.join(", ", state.getTopicsCovered()),
                historyContext != null ? historyContext.substring(0, Math.min(historyContext.length(), 1500)) : "No previous context"
        );

        try {
            JsonNode response = aiClient.generateJson(
                    "You are a senior technical interviewer. Generate a coding problem. Respond ONLY with valid JSON.",
                    prompt, 0.5, 3000, e -> { throw new RuntimeException(e); });

            if (response == null) throw new RuntimeException("AI returned null for problem generation");

            // Build entity
            MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);

            CodingProblem problem = CodingProblem.builder()
                    .mockInterview(interview)
                    .title(response.path("title").asText("Coding Problem"))
                    .difficulty(response.path("difficulty").asText(state.getCurrentDifficulty()))
                    .tags(response.path("tags").asText(""))
                    .targetLanguages(response.path("targetLanguages").asText("python,java,javascript"))
                    .problemStatement(response.path("problemStatement").asText(""))
                    .constraints(response.path("constraints").asText(""))
                    .examples(response.path("examples").asText(""))
                    .hints(response.path("hints").asText(""))
                    .timeComplexityTarget(response.path("timeComplexityTarget").asText(""))
                    .spaceComplexityTarget(response.path("spaceComplexityTarget").asText(""))
                    .solutionApproach(response.path("solutionApproach").asText(""))
                    .build();

            // Link to interview question if provided
            if (questionId != null && interview != null) {
                interview.getQuestions().stream()
                        .filter(q -> q.getId() != null && q.getId().equals(questionId))
                        .findFirst()
                        .ifPresent(problem::setInterviewQuestion);
            }

            problem = codingProblemRepository.save(problem);

            // Persist test cases
            List<CodingTestCase> testCases = new ArrayList<>();
            JsonNode tcArray = response.path("testCases");
            if (tcArray.isArray()) {
                for (JsonNode tc : tcArray) {
                    testCases.add(CodingTestCase.builder()
                            .codingProblem(problem)
                            .input(tc.path("input").asText(""))
                            .expectedOutput(tc.path("expectedOutput").asText(""))
                            .hidden(tc.path("hidden").asBoolean(false))
                            .boundary(tc.path("boundary").asBoolean(false))
                            .performance(tc.path("performance").asBoolean(false))
                            .ordinal(tc.path("ordinal").asInt(0))
                            .timeoutMs(tc.path("performance").asBoolean(false) ? 10000 : 5000)
                            .memoryLimitMb(256)
                            .description(tc.path("description").asText(""))
                            .build());
                }
            }
            codingTestCaseRepository.saveAll(testCases);

            log.info("[CODING] [PROBLEM_GEN] Generated problem '{}' with {} test cases ({} hidden)",
                    problem.getTitle(), testCases.size(),
                    testCases.stream().filter(tc -> tc != null && tc.isHidden()).count());

            return problem;

        } catch (Exception e) {
            log.error("[CODING] [PROBLEM_GEN] Failed to generate problem: {}", e.getMessage());
            // Return a minimal fallback problem
            return buildFallbackProblem(interviewId, state);
        }
    }

    private CodingProblem buildFallbackProblem(Long interviewId, AdaptiveState state) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        CodingProblem fallback = CodingProblem.builder()
                .mockInterview(interview)
                .title("Reverse a String")
                .difficulty(state.getCurrentDifficulty())
                .tags("Strings,Arrays")
                .targetLanguages("python,java,javascript")
                .problemStatement("Write a function to reverse a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.")
                .constraints("1 <= s.length <= 10^5\ns[i] is a printable ASCII character")
                .examples("Input: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]")
                .timeComplexityTarget("O(n)")
                .spaceComplexityTarget("O(1)")
                .build();
        fallback = codingProblemRepository.save(fallback);

        List<CodingTestCase> tcs = List.of(
            CodingTestCase.builder().codingProblem(fallback).input("[\"h\",\"e\",\"l\",\"l\",\"o\"]").expectedOutput("[\"o\",\"l\",\"l\",\"e\",\"h\"]").hidden(false).ordinal(0).timeoutMs(5000).memoryLimitMb(256).build(),
            CodingTestCase.builder().codingProblem(fallback).input("[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]").expectedOutput("[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]").hidden(true).ordinal(1).timeoutMs(5000).memoryLimitMb(256).build()
        );
        codingTestCaseRepository.saveAll(tcs);
        return fallback;
    }
}
