package com.aiplacement.backend.service.coding.cache;

import com.aiplacement.backend.exception.Judge0BadRequestException;
import com.aiplacement.backend.exception.RateLimitUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Judge0RateLimiterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private Judge0RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new Judge0RateLimiter(redisTemplate);
    }

    @Test
    void checkRateLimit_underLimit_allowsRequest() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("judge0:ratelimit:user:user-123")).thenReturn(1L);

        rateLimiter.checkRateLimit("user-123");

        verify(redisTemplate).expire(eq("judge0:ratelimit:user:user-123"), any());
    }

    @Test
    void checkRateLimit_overLimit_throwsJudge0BadRequestException() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("judge0:ratelimit:user:user-123")).thenReturn(6L);

        assertThatThrownBy(() -> rateLimiter.checkRateLimit("user-123"))
                .isInstanceOf(Judge0BadRequestException.class)
                .hasMessageContaining("Submission rate limit exceeded");
    }

    @Test
    void checkRateLimit_redisFailure_failsClosed_throwsRateLimitUnavailableException() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(any())).thenThrow(new RedisConnectionFailureException("Redis down"));

        assertThatThrownBy(() -> rateLimiter.checkRateLimit("user-123"))
                .isInstanceOf(RateLimitUnavailableException.class)
                .hasMessageContaining("Submission rate limit check temporarily unavailable");
    }
}
