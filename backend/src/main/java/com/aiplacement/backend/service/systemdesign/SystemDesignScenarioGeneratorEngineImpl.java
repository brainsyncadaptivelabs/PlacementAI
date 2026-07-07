package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;

import com.aiplacement.backend.entity.interview.SystemDesignScenario;
import com.aiplacement.backend.repository.interview.InterviewQuestionRepository;
import com.aiplacement.backend.repository.interview.SystemDesignScenarioRepository;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemDesignScenarioGeneratorEngineImpl implements SystemDesignScenarioGeneratorEngine {

    private final AIClient aiClient;
    private final SystemDesignScenarioRepository scenarioRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;

    @Override
    @Transactional
    public SystemDesignScenario generateScenario(AdaptiveState state, Long interviewId, Long questionId, String historyContext) {
        log.info("[SYSTEM_DESIGN] [SCENARIO_GEN] Generating scenario for interview: {}, role: {}", interviewId, state.getRole());

        String prompt = """
                You are a principal systems architect. Generate a system design scenario for a technical interview.
                
                Candidate Role: %s
                Experience Level: %s
                Target Company: %s
                Difficulty Level: %s
                Candidate History Context: %s
                
                The scenario must match their profile. For example:
                - Senior / Lead: Focus on replication, sharding, multi-region routing, partition recovery, distributed locks.
                - Junior: Focus on basic database choice, caching, simple load balancing, REST API layout.
                
                Return ONLY valid JSON matching this exact schema:
                {
                  "title": "Design a Distributed Rate Limiter",
                  "description": "Design an enterprise-grade rate limiter that can handle requests across multiple data centers, preventing denial of service attacks...",
                  "targetScale": "1M QPS aggregate across 3 regions",
                  "slaRequirements": "99.999%% reliability, write latency < 5ms, read latency < 2ms",
                  "expectedComponents": "[\\\"API Gateway\\\", \\\"Redis Cache\\\", \\\"Token Bucket Worker\\\", \\\"Distributed Counter\\\"]",
                  "hints": "Think about Token Bucket vs Sliding Window Log algorithms. Consider how to handle race conditions in Redis.",
                  "tradeOffInstructions": "Compare storage overhead of sliding window log against precision of token bucket under sudden spikes."
                }
                """.formatted(
                state.getRole(),
                state.getExperienceLevel(),
                state.getCompany(),
                state.getCurrentDifficulty(),
                historyContext != null ? historyContext.substring(0, Math.min(historyContext.length(), 1500)) : "No previous context"
        );

        try {
            JsonNode response = aiClient.generateJson(
                    "You are a principal systems architect. Respond ONLY with valid JSON.",
                    prompt, 0.4, 2048, e -> { throw new RuntimeException(e); });

            if (response == null) throw new RuntimeException("AI returned null for system design scenario");

            InterviewQuestion question = interviewQuestionRepository.findById(questionId).orElse(null);

            SystemDesignScenario scenario = SystemDesignScenario.builder()
                    .interviewQuestion(question)
                    .title(response.path("title").asText("Distributed System Design"))
                    .description(response.path("description").asText("Design a large-scale system."))
                    .targetScale(response.path("targetScale").asText("N/A"))
                    .slaRequirements(response.path("slaRequirements").asText("N/A"))
                    .expectedComponents(response.path("expectedComponents").asText("[]"))
                    .hints(response.path("hints").asText(""))
                    .tradeOffInstructions(response.path("tradeOffInstructions").asText(""))
                    .build();

            scenario = scenarioRepository.save(scenario);
            log.info("[SYSTEM_DESIGN] [SCENARIO_GEN] Generated and saved scenario: '{}'", scenario.getTitle());
            return scenario;

        } catch (Exception e) {
            log.error("[SYSTEM_DESIGN] [SCENARIO_GEN] Fallback scenario generated due to error: {}", e.getMessage());
            return buildFallbackScenario(interviewId, questionId);
        }
    }

    private SystemDesignScenario buildFallbackScenario(Long interviewId, Long questionId) {
        InterviewQuestion question = interviewQuestionRepository != null && questionId != null
                ? interviewQuestionRepository.findById(questionId).orElse(null)
                : null;
        SystemDesignScenario fallback = SystemDesignScenario.builder()
                .interviewQuestion(question)
                .title("Design a URL Shortener like Bit.ly")
                .description("Design a URL shortening service that takes a long URL and generates a short alias. The service should support high availability, read-heavy traffic, and redirection logic.")
                .targetScale("100M new URLs shortened per month, 10B redirections per month")
                .slaRequirements("Uptime 99.99%, redirection redirection latency < 10ms")
                .expectedComponents("[\"Application Servers\", \"Relational Database\", \"NoSQL Key-Value store\", \"CDN\", \"Cache\"]")
                .hints("Think about hashing algorithm options (MD5 vs Base62) and handling hash collisions.")
                .tradeOffInstructions("Compare write-through caching against lazy loading for hot shortened URLs.")
                .build();
        return scenarioRepository.save(fallback);
    }
}
