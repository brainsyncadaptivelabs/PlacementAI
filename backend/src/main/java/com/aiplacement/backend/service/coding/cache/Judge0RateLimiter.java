package com.aiplacement.backend.service.coding.cache;

import com.aiplacement.backend.exception.Judge0BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class Judge0RateLimiter {

    private final StringRedisTemplate redisTemplate;

    private static final String RATE_LIMIT_PREFIX = "judge0:ratelimit:user:";
    private static final int MAX_REQUESTS_PER_WINDOW = 5;
    private static final Duration WINDOW_DURATION = Duration.ofSeconds(10);

    public void checkRateLimit(String userId) {
        if (userId == null || userId.isBlank()) {
            userId = "anonymous";
        }

        String key = RATE_LIMIT_PREFIX + userId;
        try {
            Long currentRequests = redisTemplate.opsForValue().increment(key);
            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(key, WINDOW_DURATION);
            }

            if (currentRequests != null && currentRequests > MAX_REQUESTS_PER_WINDOW) {
                log.warn("[CODING] [RATE_LIMIT] User {} exceeded rate limit ({} > {})",
                        userId, currentRequests, MAX_REQUESTS_PER_WINDOW);
                throw new Judge0BadRequestException("Submission rate limit exceeded. Please wait a few seconds before trying again.");
            }
        } catch (Judge0BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.warn("[CODING] [RATE_LIMIT] Failed evaluating rate limit: {}", e.getMessage());
        }
    }
}
