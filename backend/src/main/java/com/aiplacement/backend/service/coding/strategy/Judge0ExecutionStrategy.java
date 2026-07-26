package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.dto.coding.ExecutionResult;
import com.aiplacement.backend.exception.*;
import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.bulkhead.BulkheadFullException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Component
@Slf4j
public class Judge0ExecutionStrategy implements ExecutionStrategy {

    private final Judge0Properties properties;
    private final WebClient webClient;
    private final com.aiplacement.backend.service.coding.observability.Judge0MetricsService metricsService;
    private final com.aiplacement.backend.service.coding.observability.Judge0ExecutionAuditLogger auditLogger;
    private final com.aiplacement.backend.service.coding.cache.Judge0CacheService cacheService;
    private final com.aiplacement.backend.service.coding.cache.Judge0RateLimiter rateLimiter;

    private final CircuitBreaker circuitBreaker;
    private final Retry retry;
    private final Bulkhead bulkhead;

    private static final Set<String> SUPPORTED = Set.of(
            "c", "cpp", "java", "javascript", "typescript", "python", "go", "rust",
            "kotlin", "php", "ruby", "swift", "scala", "bash", "shell", "c#", "csharp", "json"
    );

    public Judge0ExecutionStrategy(Judge0Properties properties, WebClient.Builder webClientBuilder) {
        this(properties, webClientBuilder, null, null, null, null);
    }

    public Judge0ExecutionStrategy(
            Judge0Properties properties,
            WebClient.Builder webClientBuilder,
            com.aiplacement.backend.service.coding.observability.Judge0MetricsService metricsService,
            com.aiplacement.backend.service.coding.observability.Judge0ExecutionAuditLogger auditLogger,
            com.aiplacement.backend.service.coding.cache.Judge0CacheService cacheService,
            com.aiplacement.backend.service.coding.cache.Judge0RateLimiter rateLimiter) {
        this.properties = properties;
        this.metricsService = metricsService;
        this.auditLogger = auditLogger;
        this.cacheService = cacheService;
        this.rateLimiter = rateLimiter;

        // Configure Reactor Netty HTTP Client with explicit timeouts
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, properties.getTimeout().getConnectMs())
                .responseTimeout(Duration.ofMillis(properties.getTimeout().getResponseMs()))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(properties.getTimeout().getReadMs(), TimeUnit.MILLISECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(properties.getTimeout().getWriteMs(), TimeUnit.MILLISECONDS))
                );

        String baseUrl = resolveBaseUrl(properties);
        this.webClient = webClientBuilder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(baseUrl)
                .build();

        // Resilience4j CircuitBreaker configuration
        CircuitBreakerConfig cbConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .minimumNumberOfCalls(5)
                .slidingWindowSize(10)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .build();
        this.circuitBreaker = CircuitBreaker.of("judge0CircuitBreaker", cbConfig);

        // Resilience4j Retry configuration
        RetryConfig retryConfig = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(500))
                .retryExceptions(WebClientResponseException.ServiceUnavailable.class,
                        WebClientResponseException.BadGateway.class,
                        WebClientResponseException.GatewayTimeout.class,
                        java.io.IOException.class)
                .ignoreExceptions(Judge0BadRequestException.class, CompilationFailedException.class)
                .build();
        this.retry = Retry.of("judge0Retry", retryConfig);

        // Resilience4j Bulkhead configuration
        BulkheadConfig bulkheadConfig = BulkheadConfig.custom()
                .maxConcurrentCalls(20)
                .maxWaitDuration(Duration.ofSeconds(2))
                .build();
        this.bulkhead = Bulkhead.of("judge0Bulkhead", bulkheadConfig);
    }

    private static String resolveBaseUrl(Judge0Properties properties) {
        return properties.getNormalizedUrl();
    }


    @PostConstruct
    public void validateStartupConfig() {
        String baseUrl = resolveBaseUrl(properties);
        try {
            URI uri = URI.create(baseUrl);
            if (uri.getScheme() == null || (!uri.getScheme().equalsIgnoreCase("http") && !uri.getScheme().equalsIgnoreCase("https"))) {
                throw new IllegalArgumentException("Invalid URI scheme: " + uri.getScheme());
            }
        } catch (Exception e) {
            log.error("[CODING] [JUDGE0] Startup validation failed for URL '{}': {}", baseUrl, e.getMessage());
            throw new IllegalStateException("Judge0 configuration error: Invalid URL '" + baseUrl + "'", e);
        }

        String apiKey = resolveApiKey(properties);
        log.info("[CODING] [JUDGE0] Startup validation successful. Base URL: {}, Auth Key Configured: {}",
                baseUrl, apiKey != null && !apiKey.isBlank());
    }

    private String resolveApiKey(Judge0Properties properties) {
        if (properties.getKey() != null && !properties.getKey().isBlank()) {
            return properties.getKey();
        }
        if (properties.getApi() != null && properties.getApi().getKey() != null && !properties.getApi().getKey().isBlank()) {
            return properties.getApi().getKey();
        }
        return null;
    }

    @Override
    public boolean supports(String language) {
        return language != null && SUPPORTED.contains(language.toLowerCase());
    }

    @Override
    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        String requestId = UUID.randomUUID().toString();
        String lang = request.getLanguage().toLowerCase();
        int languageId = Judge0LanguageMapper.getLanguageId(lang);
        long startMs = System.currentTimeMillis();

        if (rateLimiter != null) {
            rateLimiter.checkRateLimit(requestId);
        }

        String sourceCode = "";
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            sourceCode = request.getFiles().get(0).getContent();
        }
        String rawStdin = request.getStdin() != null ? request.getStdin() : "";

        // Redis Result Cache Check
        String cacheHash = null;
        if (cacheService != null) {
            cacheHash = cacheService.computeExecutionHash(sourceCode, lang, rawStdin);
            Optional<CodeExecutionResponse> cachedResponse = cacheService.getCachedResult(cacheHash);
            if (cachedResponse.isPresent()) {
                log.info("[CODING] [JUDGE0] [REQ:{}] Execution result served directly from Redis cache", requestId);
                return cachedResponse.get();
            }
        }

        log.info("[CODING] [JUDGE0] [REQ:{}] Initiating base64-encoded execution for language '{}' (ID: {})",
                requestId, lang, languageId);

        // Base64 encode inputs
        String encodedSourceCode = Base64.getEncoder().encodeToString(sourceCode.getBytes(StandardCharsets.UTF_8));
        String encodedStdin = Base64.getEncoder().encodeToString(rawStdin.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> body = new HashMap<>();
        body.put("source_code", encodedSourceCode);
        body.put("language_id", languageId);
        body.put("stdin", encodedStdin);

        // Configure language-tailored execution profile limits
        LanguageExecutionProfile profile = LanguageExecutionProfile.getProfileForLanguage(lang);
        body.put("cpu_time_limit", profile.getCpuTimeLimit());
        body.put("wall_time_limit", profile.getWallTimeLimit());
        body.put("memory_limit", profile.getMemoryLimitKb());
        body.put("stack_limit", profile.getStackLimitKb());
        body.put("max_processes_and_or_threads", profile.getMaxProcessesAndOrThreads());
        body.put("max_file_size", properties.getLimits().getMaxFileSize());
        body.put("max_output_size", properties.getLimits().getMaxOutputSize());

        // Decorate HTTP execution with Resilience4j
        Supplier<Judge0Response> supplier = () -> invokeJudge0Api(requestId, body);
        Supplier<Judge0Response> decoratedSupplier = Bulkhead.decorateSupplier(bulkhead,
                CircuitBreaker.decorateSupplier(circuitBreaker,
                        Retry.decorateSupplier(retry, supplier)));

        Judge0Response judge0Response;
        try {
            judge0Response = decoratedSupplier.get();
        } catch (CallNotPermittedException e) {
            if (metricsService != null) metricsService.incrementFailures(lang, "CircuitBreakerOpen");
            log.error("[CODING] [JUDGE0] [REQ:{}] Circuit breaker is OPEN. Fast failing request.", requestId);
            throw new Judge0UnavailableException("Judge0 service is currently unavailable (Circuit Breaker OPEN)", e);
        } catch (BulkheadFullException e) {
            if (metricsService != null) metricsService.incrementFailures(lang, "BulkheadFull");
            log.error("[CODING] [JUDGE0] [REQ:{}] Bulkhead is FULL. Rejecting request.", requestId);
            throw new Judge0UnavailableException("Judge0 execution engine is at maximum capacity", e);
        } catch (WebClientResponseException e) {
            if (metricsService != null) metricsService.incrementFailures(lang, "HTTP_" + e.getStatusCode().value());
            log.error("[CODING] [JUDGE0] [REQ:{}] HTTP {} error from Judge0: {}", requestId, e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().is4xxClientError()) {
                throw new Judge0BadRequestException("Judge0 rejected payload: " + e.getMessage(), e);
            }
            throw new Judge0UnavailableException("Judge0 upstream HTTP error: " + e.getStatusCode(), e);
        } catch (Exception e) {
            if (metricsService != null) metricsService.incrementFailures(lang, "ExecutionException");
            log.error("[CODING] [JUDGE0] [REQ:{}] Execution failed: {}", requestId, e.getMessage(), e);
            if (e.getCause() instanceof java.util.concurrent.TimeoutException || e.getMessage().contains("Timeout")) {
                if (metricsService != null) metricsService.incrementTimeouts(lang);
                throw new ExecutionTimeoutException("Code execution timed out connecting to Judge0", e);
            }
            throw new CodeExecutionException("Code execution failed via Judge0: " + e.getMessage(), e);
        }

        long totalDurationMs = System.currentTimeMillis() - startMs;
        int statusId = judge0Response != null && judge0Response.getStatus() != null ? judge0Response.getStatus().getId() : 3;

        if (metricsService != null) {
            metricsService.recordExecutionTime(lang, String.valueOf(statusId), totalDurationMs);
            metricsService.incrementRequests(lang, String.valueOf(statusId));
            if (judge0Response != null && judge0Response.getMemory() != null) {
                metricsService.recordMemoryUsage(lang, judge0Response.getMemory() * 1024L);
            }
        }

        if (auditLogger != null) {
            auditLogger.logExecutionAudit(null, lang, String.valueOf(statusId), totalDurationMs,
                    judge0Response != null && judge0Response.getMemory() != null ? judge0Response.getMemory() / 1024L : 0L, "SUCCESS");
        }

        log.info("[CODING] [JUDGE0] [REQ:{}] Successfully executed language '{}' in {}ms. Status ID: {}",
                requestId, lang, totalDurationMs, statusId);

        CodeExecutionResponse response = mapResponse(request, judge0Response);
        if (cacheService != null && cacheHash != null) {
            cacheService.cacheResult(cacheHash, response);
        }
        return response;
    }

    private Judge0Response invokeJudge0Api(String requestId, Map<String, Object> body) {
        long apiStart = System.currentTimeMillis();
        WebClient.RequestHeadersSpec<?> requestSpec = webClient
                .post()
                .uri("/submissions?base64_encoded=true&wait=true")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body);

        String apiKey = resolveApiKey(properties);
        if (apiKey != null && !apiKey.isBlank()) {
            requestSpec = requestSpec.header("X-Auth-Token", apiKey);
        }

        Judge0Response response = requestSpec.retrieve()
                .bodyToMono(Judge0Response.class)
                .block();

        long apiDuration = System.currentTimeMillis() - apiStart;
        log.debug("[CODING] [JUDGE0] [REQ:{}] Raw HTTP POST call took {}ms", requestId, apiDuration);
        return response;
    }

    private CodeExecutionResponse mapResponse(CodeExecutionRequest request, Judge0Response response) {
        if (response == null) {
            throw new Judge0UnavailableException("Empty response received from Judge0 engine");
        }

        // Safely decode base64 strings returned by Judge0
        String decodedStdout = safeBase64Decode(response.getStdout());
        String decodedStderr = safeBase64Decode(response.getStderr());
        String decodedCompileOutput = safeBase64Decode(response.getCompile_output());
        String decodedMessage = safeBase64Decode(response.getMessage());

        ExecutionResult runResult = new ExecutionResult();
        ExecutionResult compileResult = null;

        int statusId = response.getStatus() != null ? response.getStatus().getId() : 3;

        if (statusId == 6) { // Compilation Error
            compileResult = ExecutionResult.builder()
                    .stderr(decodedCompileOutput)
                    .output(decodedCompileOutput)
                    .code(1)
                    .message("Compilation Error")
                    .build();
        } else {
            runResult = ExecutionResult.builder()
                    .stdout(decodedStdout)
                    .stderr(decodedStderr)
                    .output(decodedStdout != null ? decodedStdout : decodedStderr)
                    .code(response.getExit_code() != null ? response.getExit_code() : 0)
                    .signal(response.getExit_signal())
                    .message(decodedMessage)
                    .build();

            // Handle runtime error (statusId >= 7 and <= 12)
            if (statusId >= 7 && statusId <= 12) {
                runResult.setCode(response.getExit_code() != null ? response.getExit_code() : 1);
                runResult.setStderr(decodedStderr != null ? decodedStderr : "Runtime Error (status id: " + statusId + ")");
            }
            // Handle Time Limit Exceeded (statusId == 5)
            if (statusId == 5) {
                runResult.setCode(124);
                runResult.setStderr("Time Limit Exceeded");
            }
            // Handle Judge0 Internal Errors (statusId >= 13)
            if (statusId >= 13) {
                runResult.setCode(1);
                runResult.setStderr(decodedMessage != null ? decodedMessage : "Internal Judge0 Error (status id: " + statusId + ")");
            }
        }

        return CodeExecutionResponse.builder()
                .language(request.getLanguage())
                .version(request.getVersion())
                .run(runResult)
                .compile(compileResult)
                .build();
    }

    private String safeBase64Decode(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        try {
            byte[] decoded = Base64.getDecoder().decode(input.trim().getBytes(StandardCharsets.UTF_8));
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Fallback if raw string was returned by Judge0
            return input;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Judge0Response {
        private String stdout;
        private String stderr;
        private String compile_output;
        private String message;
        private Integer exit_code;
        private String exit_signal;
        private String time;
        private Integer memory;
        private Judge0Status status;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Judge0Status {
        private int id;
        private String description;
    }
}
