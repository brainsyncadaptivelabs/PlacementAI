package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Executes code via the Piston API for all general-purpose languages.
 * Supports: Python, Java, JavaScript, TypeScript, C++, C, Go, Rust, Kotlin
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PistonExecutionStrategy implements ExecutionStrategy {

    @Value("${piston.api.url}")
    private String pistonApiUrl;

    private final WebClient.Builder webClientBuilder;

    private static final Set<String> SUPPORTED = Set.of(
            "python", "java", "javascript", "typescript", "cpp", "c", "go", "rust", "kotlin"
    );

    // Piston canonical language identifiers
    private static final Map<String, String> PISTON_NAMES = Map.of(
            "python", "python", "java", "java", "javascript", "javascript",
            "typescript", "typescript", "cpp", "c++", "c", "c",
            "go", "go", "rust", "rust", "kotlin", "kotlin"
    );

    @Override
    public boolean supports(String language) {
        return language != null && SUPPORTED.contains(language.toLowerCase());
    }

    @Override
    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        String lang = request.getLanguage().toLowerCase();
        String pistonLang = PISTON_NAMES.getOrDefault(lang, lang);

        Map<String, Object> body = new HashMap<>();
        body.put("language", pistonLang);
        body.put("version", request.getVersion() != null ? request.getVersion() : "*");
        body.put("files", request.getFiles());
        body.put("stdin", request.getStdin() != null ? request.getStdin() : "");
        body.put("run_timeout", 10000);
        body.put("compile_timeout", 15000);
        body.put("run_memory_limit", 256 * 1024 * 1024L);

        try {
            return webClientBuilder.build()
                    .post()
                    .uri(pistonApiUrl + "/execute")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(CodeExecutionResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("[CODING] [PISTON] Execution failed for language {}: {}", lang, e.getMessage());
            throw new RuntimeException("Code execution failed: " + e.getMessage(), e);
        }
    }
}
