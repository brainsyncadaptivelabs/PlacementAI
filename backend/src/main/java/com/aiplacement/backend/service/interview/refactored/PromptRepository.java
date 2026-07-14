package com.aiplacement.backend.service.interview.refactored;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromptRepository {

    private final ResourceLoader resourceLoader;
    private final Map<String, String> cachedTemplates = new ConcurrentHashMap<>();

    public String loadPrompt(String version, String key) {
        String cacheKey = version + "/" + key;
        return cachedTemplates.computeIfAbsent(cacheKey, k -> {
            try {
                String path = "classpath:prompts/" + version + "/" + key + ".txt";
                log.info("Loading prompt template from path: {}", path);
                Resource resource = resourceLoader.getResource(path);
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                    return reader.lines().collect(Collectors.joining("\n"));
                }
            } catch (Exception e) {
                log.error("Failed to load prompt template: {}", cacheKey, e);
                throw new RuntimeException("Prompt template not found: " + cacheKey, e);
            }
        });
    }

    public void evictCache() {
        cachedTemplates.clear();
        log.info("Prompt cache evicted.");
    }
}
