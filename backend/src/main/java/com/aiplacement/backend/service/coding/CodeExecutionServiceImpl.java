package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CodeExecutionServiceImpl implements CodeExecutionService {

    @Value("${piston.api.url}")
    private String pistonApiUrl;

    private final WebClient.Builder webClientBuilder;

    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("java", "python", "cpp", "c", "javascript");

    @Override
    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        if (!SUPPORTED_LANGUAGES.contains(request.getLanguage().toLowerCase())) {
            throw new IllegalArgumentException("Unsupported language: " + request.getLanguage());
        }

        Map<String, Object> pistonRequest = new HashMap<>();
        pistonRequest.put("language", request.getLanguage());
        pistonRequest.put("version", request.getVersion());
        pistonRequest.put("files", request.getFiles());
        pistonRequest.put("stdin", request.getStdin());
        pistonRequest.put("run_timeout", 5000); // 5 seconds
        pistonRequest.put("compile_timeout", 10000); // 10 seconds
        pistonRequest.put("run_memory_limit", 256 * 1024 * 1024); // 256 MB

        return webClientBuilder.build()
                .post()
                .uri(pistonApiUrl + "/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(pistonRequest)
                .retrieve()
                .bodyToMono(CodeExecutionResponse.class)
                .block();
    }
}
