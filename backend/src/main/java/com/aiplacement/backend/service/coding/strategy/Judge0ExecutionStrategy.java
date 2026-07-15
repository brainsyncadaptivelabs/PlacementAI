package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.dto.coding.ExecutionResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class Judge0ExecutionStrategy implements ExecutionStrategy {

    @Value("${judge0.api.url:http://localhost:2358}")
    private String judge0ApiUrl;

    @Value("${judge0.api.key:}")
    private String judge0ApiKey;

    private final WebClient.Builder webClientBuilder;

    private static final Set<String> SUPPORTED = Set.of(
            "c", "cpp", "java", "javascript", "typescript", "python", "go", "rust",
            "kotlin", "php", "ruby", "swift", "scala", "bash", "shell", "c#", "csharp", "json"
    );

    @Override
    public boolean supports(String language) {
        return language != null && SUPPORTED.contains(language.toLowerCase());
    }

    @Override
    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        String lang = request.getLanguage().toLowerCase();
        int languageId = Judge0LanguageMapper.getLanguageId(lang);

        String sourceCode = "";
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            sourceCode = request.getFiles().get(0).getContent();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("source_code", sourceCode);
        body.put("language_id", languageId);
        body.put("stdin", request.getStdin() != null ? request.getStdin() : "");
        body.put("cpu_time_limit", 5.0); // 5 seconds CPU time limit
        body.put("memory_limit", 262144); // 256MB memory limit

        try {
            WebClient.RequestHeadersSpec<?> requestSpec = webClientBuilder.build()
                    .post()
                    .uri(judge0ApiUrl + "/submissions?base64_encoded=false&wait=true")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body);

            if (judge0ApiKey != null && !judge0ApiKey.isBlank()) {
                requestSpec = requestSpec.header("X-Auth-Token", judge0ApiKey);
            }

            Judge0Response judge0Response = requestSpec.retrieve()
                    .bodyToMono(Judge0Response.class)
                    .block();

            return mapResponse(request, judge0Response);
        } catch (Exception e) {
            log.error("[CODING] [JUDGE0] Execution failed for language {}: {}", lang, e.getMessage());
            throw new RuntimeException("Code execution failed via Judge0: " + e.getMessage(), e);
        }
    }

    private CodeExecutionResponse mapResponse(CodeExecutionRequest request, Judge0Response response) {
        if (response == null) {
            throw new RuntimeException("Empty response received from Judge0");
        }

        ExecutionResult runResult = new ExecutionResult();
        ExecutionResult compileResult = null;

        int statusId = response.getStatus() != null ? response.getStatus().getId() : 3;

        if (statusId == 6) { // Compilation Error
            compileResult = ExecutionResult.builder()
                    .stderr(response.getCompile_output())
                    .output(response.getCompile_output())
                    .code(1)
                    .message("Compilation Error")
                    .build();
        } else {
            runResult = ExecutionResult.builder()
                    .stdout(response.getStdout())
                    .stderr(response.getStderr())
                    .output(response.getStdout() != null ? response.getStdout() : response.getStderr())
                    .code(response.getExit_code() != null ? response.getExit_code() : 0)
                    .signal(response.getExit_signal())
                    .message(response.getMessage())
                    .build();

            // Handle runtime error (statusId >= 7)
            if (statusId >= 7 && statusId <= 12) {
                runResult.setCode(response.getExit_code() != null ? response.getExit_code() : 1);
                runResult.setStderr(response.getStderr() != null ? response.getStderr() : "Runtime Error (status id: " + statusId + ")");
            }
            // Handle Time Limit Exceeded (statusId == 5)
            if (statusId == 5) {
                runResult.setCode(124);
                runResult.setStderr("Time Limit Exceeded");
            }
        }

        return CodeExecutionResponse.builder()
                .language(request.getLanguage())
                .version(request.getVersion())
                .run(runResult)
                .compile(compileResult)
                .build();
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
