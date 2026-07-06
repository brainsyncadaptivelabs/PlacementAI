package com.aiplacement.backend.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
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
    private final RateLimitProperties properties;
    private final Map<String, Bucket> inMemoryBuckets = new ConcurrentHashMap<>();

    public RateLimitService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            RateLimitProperties properties
    ) {
        this.redisTemplate = redisTemplate;
        this.properties = properties;
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

    private Bucket createNewBucket(RateLimitProperties.LimitConfig limit) {
        Refill refill = Refill.intervally(limit.getCapacity(), Duration.ofSeconds(limit.getDurationSeconds()));
        Bandwidth limitBandwidth = Bandwidth.classic(limit.getCapacity(), refill);
        return Bucket.builder()
                .addLimit(limitBandwidth)
                .build();
    }
}
