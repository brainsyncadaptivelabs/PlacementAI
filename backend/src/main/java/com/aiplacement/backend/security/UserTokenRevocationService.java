package com.aiplacement.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserTokenRevocationService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private final Set<String> fallbackBlocklist = ConcurrentHashMap.newKeySet();

    private static final String REVOKED_KEY_PREFIX = "revoked_user:";

    public void revokeUserTokens(Long userId, String email) {
        log.info("[TOKEN_REVOCATION] Revoking all active tokens for userId: {}, email: {}", userId, email);
        String key = REVOKED_KEY_PREFIX + userId;
        fallbackBlocklist.add(email.toLowerCase());
        
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, "true", 24, TimeUnit.HOURS);
                if (email != null) {
                    redisTemplate.opsForValue().set(REVOKED_KEY_PREFIX + email.toLowerCase(), "true", 24, TimeUnit.HOURS);
                }
                log.info("[TOKEN_REVOCATION] Successfully posted revocation flag to Redis for user {}", userId);
            } catch (Exception e) {
                log.warn("[TOKEN_REVOCATION] Failed to write to Redis, fallback in-memory blocklist active", e);
            }
        }
    }

    public void clearUserRevocation(Long userId, String email) {
        log.info("[TOKEN_REVOCATION] Clearing token revocation flag for userId: {}, email: {}", userId, email);
        if (email != null) {
            fallbackBlocklist.remove(email.toLowerCase());
        }
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(REVOKED_KEY_PREFIX + userId);
                if (email != null) {
                    redisTemplate.delete(REVOKED_KEY_PREFIX + email.toLowerCase());
                }
            } catch (Exception e) {
                log.warn("[TOKEN_REVOCATION] Failed to delete revocation flag from Redis", e);
            }
        }
    }

    public boolean isRevoked(Long userId, String email) {
        if (email != null && fallbackBlocklist.contains(email.toLowerCase())) {
            return true;
        }
        if (redisTemplate != null) {
            try {
                if (userId != null && Boolean.TRUE.equals(redisTemplate.hasKey(REVOKED_KEY_PREFIX + userId))) {
                    return true;
                }
                if (email != null && Boolean.TRUE.equals(redisTemplate.hasKey(REVOKED_KEY_PREFIX + email.toLowerCase()))) {
                    return true;
                }
            } catch (Exception e) {
                log.warn("[TOKEN_REVOCATION] Error reading Redis blocklist", e);
            }
        }
        return false;
    }
}
