package com.aiplacement.backend.service.coding.cache;

import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class Judge0CacheService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "judge0:cache:";
    private static final String LOCK_PREFIX = "judge0:lock:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(1);
    private static final Duration LOCK_TTL = Duration.ofSeconds(10);

    public String computeExecutionHash(String sourceCode, String language, String stdin) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String raw = (language != null ? language.toLowerCase() : "") + ":" + (sourceCode != null ? sourceCode : "") + ":" + (stdin != null ? stdin : "");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return String.valueOf((sourceCode + language + stdin).hashCode());
        }
    }

    public Optional<CodeExecutionResponse> getCachedResult(String hash) {
        try {
            String cachedJson = redisTemplate.opsForValue().get(CACHE_PREFIX + hash);
            if (cachedJson != null && !cachedJson.isBlank()) {
                log.info("[CODING] [CACHE] Hit for execution hash: {}", hash);
                CodeExecutionResponse response = objectMapper.readValue(cachedJson, CodeExecutionResponse.class);
                return Optional.of(response);
            }
        } catch (Exception e) {
            log.warn("[CODING] [CACHE] Failed reading from cache: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public void cacheResult(String hash, CodeExecutionResponse response) {
        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(CACHE_PREFIX + hash, json, DEFAULT_TTL);
            log.debug("[CODING] [CACHE] Cached execution result for hash: {}", hash);
        } catch (Exception e) {
            log.warn("[CODING] [CACHE] Failed writing to cache: {}", e.getMessage());
        }
    }

    public boolean acquireDistributedLock(String hash) {
        try {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(LOCK_PREFIX + hash, "LOCKED", LOCK_TTL);
            return Boolean.TRUE.equals(acquired);
        } catch (Exception e) {
            log.warn("[CODING] [LOCK] Lock acquisition error: {}", e.getMessage());
            return true; // Fallback to allowing execution if Redis is unavailable
        }
    }

    public void releaseDistributedLock(String hash) {
        try {
            redisTemplate.delete(LOCK_PREFIX + hash);
        } catch (Exception e) {
            log.warn("[CODING] [LOCK] Lock release error: {}", e.getMessage());
        }
    }
}
