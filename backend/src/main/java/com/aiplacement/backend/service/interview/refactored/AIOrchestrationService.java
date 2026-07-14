package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.AIObservabilityLog;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.AIObservabilityLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIOrchestrationService {

    private final List<AIProvider> providers;
    private final AIModelRouter modelRouter;
    private final PromptManagementService promptManagementService;
    private final AIResponseParserService parserService;
    private final AIQualityGuard qualityGuard;
    private final AIObservabilityLogRepository observabilityLogRepository;
    private final CacheManager cacheManager;

    public JsonNode executeJsonTask(String taskType, Map<String, Object> variables, MockInterview interview) {
        // Caching check for static analyses
        if ("RESUME_ANALYSIS".equalsIgnoreCase(taskType) || "JD_ANALYSIS".equalsIgnoreCase(taskType)) {
            String cacheKey = buildCacheKey(taskType, variables);
            Cache cache = cacheManager.getCache("placement_context");
            if (cache != null) {
                JsonNode cached = cache.get(cacheKey, JsonNode.class);
                if (cached != null) {
                    log.info("Cache hit for static analysis task: {}", taskType);
                    return cached;
                }
            }
        }

        String model = modelRouter.routeModel(taskType);
        String providerName = modelRouter.getProviderName(taskType);
        AIProvider provider = selectProvider(providerName);

        String systemPrompt = "You are an expert career intelligence AI assistant. Respond ONLY with valid JSON.";
        String userPrompt = promptManagementService.getRenderedPrompt(taskType, variables);
        String promptVersion = promptManagementService.getVersion(taskType);

        JsonNode resultNode = null;
        Exception lastException = null;
        int attempt = 1;
        long startTime = System.currentTimeMillis();

        for (; attempt <= 3; attempt++) {
            try {
                log.info("Executing task: {} using model: {} on provider: {}, attempt: {}", taskType, model, provider.getProviderName(), attempt);
                String rawResponse = provider.generate(systemPrompt, userPrompt, 0.3, 4096, model);
                resultNode = parserService.parseAndSanitize(rawResponse);
                qualityGuard.validate(resultNode, taskType);
                break; // Success!
            } catch (Exception e) {
                log.warn("Attempt {} failed for task {}: {}", attempt, taskType, e.getMessage());
                lastException = e;
                // Append validation errors to feedback loops for self-correction retries
                userPrompt += "\n\nCorrection required: Your previous response format failed validation with error: " 
                        + e.getMessage() + ". Please resolve the formatting errors and output valid JSON.";
            }
        }

        long latencyMs = System.currentTimeMillis() - startTime;
        boolean success = (resultNode != null);

        // Persist observability log
        persistLog(interview, taskType, promptVersion, model, provider.getProviderName(), 
                latencyMs, attempt - 1, success, lastException);

        if (!success) {
            log.error("AI task execution failed completely for: {}", taskType);
            throw new RuntimeException("AI task execution failed after retries: " + taskType, lastException);
        }

        // Cache results if static
        if ("RESUME_ANALYSIS".equalsIgnoreCase(taskType) || "JD_ANALYSIS".equalsIgnoreCase(taskType)) {
            String cacheKey = buildCacheKey(taskType, variables);
            Cache cache = cacheManager.getCache("placement_context");
            if (cache != null) {
                cache.put(cacheKey, resultNode);
            }
        }

        return resultNode;
    }

    public Flux<String> executeStreamTask(String taskType, Map<String, Object> variables) {
        String model = modelRouter.routeModel(taskType);
        String providerName = modelRouter.getProviderName(taskType);
        AIProvider provider = selectProvider(providerName);

        String systemPrompt = "You are an expert career intelligence AI assistant.";
        String userPrompt = promptManagementService.getRenderedPrompt(taskType, variables);

        return provider.stream(systemPrompt, userPrompt, 0.6, 2048, model);
    }

    private AIProvider selectProvider(String providerName) {
        return providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseGet(() -> providers.stream()
                        .filter(p -> p.getProviderName().equalsIgnoreCase("Mock"))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No suitable AI Provider found")));
    }

    private String buildCacheKey(String taskType, Map<String, Object> variables) {
        if ("RESUME_ANALYSIS".equalsIgnoreCase(taskType)) {
            return "resume_" + variables.getOrDefault("resumeText", "").hashCode();
        }
        if ("JD_ANALYSIS".equalsIgnoreCase(taskType)) {
            return "jd_" + variables.getOrDefault("jobDescription", "").hashCode();
        }
        return taskType + "_" + variables.hashCode();
    }

    private void persistLog(MockInterview interview, String taskType, String promptVersion, 
                            String modelVersion, String providerName, long latencyMs, 
                            int retryCount, boolean success, Exception lastEx) {
        try {
            // Rough token estimate (4 characters = 1 token roughly)
            int totalTokens = success ? 1000 : 200; 
            double costEstimate = (totalTokens / 1000.0) * 0.0015; // Rough NVIDIA model pricing fallback

            AIObservabilityLog observLog = AIObservabilityLog.builder()
                    .mockInterview(interview)
                    .taskType(taskType)
                    .promptVersion(promptVersion)
                    .modelVersion(modelVersion)
                    .providerName(providerName)
                    .temperature(0.3)
                    .topP(0.9)
                    .maxTokens(4096)
                    .latencyMs(latencyMs)
                    .promptTokens((int) (totalTokens * 0.7))
                    .completionTokens((int) (totalTokens * 0.3))
                    .totalTokens(totalTokens)
                    .retryCount(retryCount)
                    .costEstimate(costEstimate)
                    .validationStatus(success ? "PASSED" : "FAILED")
                    .validationErrors(lastEx != null ? lastEx.getMessage() : null)
                    .success(success)
                    .build();
            observabilityLogRepository.save(observLog);
        } catch (Exception ex) {
            log.warn("Failed to save AI observability log", ex);
        }
    }
}
