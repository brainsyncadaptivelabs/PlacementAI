package com.aiplacement.backend.service.coding.cache;

import com.aiplacement.backend.exception.Judge0BadRequestException;
import com.aiplacement.backend.exception.RateLimitUnavailableException;
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

    // Note: Per-user rate limiting is currently enforced. Per-assessment rate limiting
    // key prefixes (e.g. judge0:ratelimit:assessment:{assessmentId}:{userId}) can be added as a P2 follow-up.
    public void checkRateLimit(String userId) {
        if (userId == null || userId.isBlank() || "anonymous".equalsIgnoreCase(userId)) {
            throw new com.aiplacement.backend.exception.UnauthorizedException("User must be authenticated for rate limit evaluation");
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
            // FAIL-CLOSED DECISION: When Redis is unavailable or throws a connection error, rate limit checks cannot be evaluated.
            // We explicitly throw RateLimitUnavailableException to reject the submission (HTTP 503 Service Unavailable)
            // rather than silently failing open, preventing untracked Judge0 sandbox resource exhaustion when Redis is down.
            log.error("[CODING] [RATE_LIMIT] Fail-closed: Redis rate limit check failed for user {}: {}", userId, e.getMessage());
            throw new RateLimitUnavailableException("Submission rate limit check temporarily unavailable. Please try again shortly.", e);
        }
    }
}
