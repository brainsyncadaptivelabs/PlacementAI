package com.aiplacement.backend.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;
    private final Map<String, Bucket> inMemoryBuckets = new ConcurrentHashMap<>();

    public RateLimitService(
            @Autowired(required = false) StringRedisTemplate redisTemplate
    ) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String key, String type, RateLimitProperties.LimitConfig limit) {
        if (redisTemplate != null) {
            try {
                String redisKey = "ratelimit:" + type + ":" + key;
                Long current = redisTemplate.opsForValue().increment(redisKey);
                if (current != null) {
                    if (current == 1) {
                        redisTemplate.expire(redisKey, Duration.ofSeconds(limit.getDurationSeconds()));
                    }
                    return current <= limit.getCapacity();
                }
            } catch (Exception e) {
                log.warn("[RateLimit] Redis check failed, falling back to in-memory Bucket4j. Reason: {}", e.getMessage());
            }
        }

        // In-memory fallback using Bucket4j
        String inMemoryKey = type + ":" + key;
        Bucket bucket = inMemoryBuckets.computeIfAbsent(inMemoryKey, k -> createNewBucket(limit));
        return bucket.tryConsume(1);
    }

    public void clearInMemoryBuckets() {
        inMemoryBuckets.clear();
        if (redisTemplate != null) {
            try {
                java.util.Set<String> keys = redisTemplate.keys("ratelimit:*");
                if (keys != null && !keys.isEmpty()) {
                    redisTemplate.delete(keys);
                }
            } catch (Exception e) {
                // Ignore
            }
        }
    }

    private Bucket createNewBucket(RateLimitProperties.LimitConfig limit) {
        Bandwidth limitBandwidth = Bandwidth.builder()
                .capacity(limit.getCapacity())
                .refillIntervally(limit.getCapacity(), Duration.ofSeconds(limit.getDurationSeconds()))
                .build();
        return Bucket.builder()
                .addLimit(limitBandwidth)
                .build();
    }
}
