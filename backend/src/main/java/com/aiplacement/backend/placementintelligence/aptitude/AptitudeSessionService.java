package com.aiplacement.backend.placementintelligence.aptitude;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class AptitudeSessionService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> localSessions = new ConcurrentHashMap<>();

    private static final String REDIS_PREFIX = "aptitude:session:";
    private static final long SESSION_TTL_MINUTES = 30;

    public void saveSession(String sessionId, String email, List<Question> questions, double theta, String mode) {
        try {
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("email", email);
            sessionData.put("mode", mode);
            sessionData.put("theta", theta);
            sessionData.put("submitted", false);

            List<Map<String, Object>> qMaps = new ArrayList<>();
            for (Question q : questions) {
                qMaps.add(q.toMap());
            }
            sessionData.put("questions", qMaps);

            String json = objectMapper.writeValueAsString(sessionData);

            boolean savedInRedis = false;
            if (redisTemplate != null) {
                try {
                    redisTemplate.opsForValue().set(REDIS_PREFIX + sessionId, json, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
                    savedInRedis = true;
                } catch (Exception e) {
                    // Fall back to local sessions
                }
            }
            if (!savedInRedis) {
                localSessions.put(sessionId, json);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to save aptitude session", e);
        }
    }

    public Map<String, Object> getSession(String sessionId, String email) {
        try {
            String json = null;
            if (redisTemplate != null) {
                try {
                    json = redisTemplate.opsForValue().get(REDIS_PREFIX + sessionId);
                } catch (Exception e) {
                    // Fall back to local sessions
                }
            }

            if (json == null) {
                json = localSessions.get(sessionId);
            }

            if (json == null) return null;

            @SuppressWarnings("unchecked")
            Map<String, Object> sessionData = objectMapper.readValue(json, Map.class);

            String owner = (String) sessionData.get("email");
            if (owner == null || !owner.equals(email)) {
                throw new SecurityException("Access denied: session belongs to another user");
            }

            return sessionData;
        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            return null;
        }
    }

    public void markSubmitted(String sessionId, String email) {
        try {
            Map<String, Object> sessionData = getSession(sessionId, email);
            if (sessionData == null) return;

            sessionData.put("submitted", true);
            String json = objectMapper.writeValueAsString(sessionData);

            boolean submittedInRedis = false;
            if (redisTemplate != null) {
                try {
                    redisTemplate.opsForValue().set(REDIS_PREFIX + sessionId, json, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
                    submittedInRedis = true;
                } catch (Exception e) {
                    // Fall back to local sessions
                }
            }
            if (!submittedInRedis) {
                localSessions.put(sessionId, json);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to mark session as submitted", e);
        }
    }

    public void removeSession(String sessionId) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(REDIS_PREFIX + sessionId);
            } catch (Exception e) {
                // ignore and clean local
            }
        }
        localSessions.remove(sessionId);
    }
}
