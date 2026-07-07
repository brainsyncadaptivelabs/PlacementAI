package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.service.coding.strategy.ExecutionStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Provider-agnostic code execution service.
 * Routes to the appropriate ExecutionStrategy (Piston for general languages, H2 for SQL).
 * Replaces direct Piston API calls with strategy dispatch — fully backward compatible.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionServiceImpl implements CodeExecutionService {

    private final List<ExecutionStrategy> strategies;

    @Override
    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            throw new IllegalArgumentException("Language must be specified");
        }

        String lang = request.getLanguage().toLowerCase();
        ExecutionStrategy strategy = strategies.stream()
                .filter(s -> s.supports(lang))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unsupported language: " + request.getLanguage() +
                        ". Supported: python, java, javascript, typescript, cpp, c, go, rust, kotlin, sql"));

        log.info("[CODING] [EXECUTION] Routing language '{}' to strategy: {}", lang, strategy.getClass().getSimpleName());
        return strategy.execute(request);
    }
}
