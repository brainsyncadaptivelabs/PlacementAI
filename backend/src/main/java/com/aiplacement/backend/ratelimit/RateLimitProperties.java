package com.aiplacement.backend.ratelimit;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ratelimit")
@Getter
@Setter
public class RateLimitProperties {

    private LimitConfig login = new LimitConfig(5, 60);             // 5 per minute
    private LimitConfig signup = new LimitConfig(3, 3600);           // 3 per hour
    private LimitConfig chat = new LimitConfig(60, 60);             // 60 per minute
    private LimitConfig resumeUpload = new LimitConfig(10, 3600);    // 10 per hour
    private LimitConfig ats = new LimitConfig(20, 3600);             // 20 per hour
    private LimitConfig mockInterview = new LimitConfig(15, 3600);   // 15 per hour

    @Getter
    @Setter
    public static class LimitConfig {
        private int capacity;
        private int durationSeconds;

        public LimitConfig() {}

        public LimitConfig(int capacity, int durationSeconds) {
            this.capacity = capacity;
            this.durationSeconds = durationSeconds;
        }
    }
}
