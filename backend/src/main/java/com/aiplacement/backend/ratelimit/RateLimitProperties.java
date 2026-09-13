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

    private LimitConfig login = new LimitConfig(15, 60);            // 15 per minute
    private LimitConfig signup = new LimitConfig(10, 3600);         // 10 per hour
    private LimitConfig chat = new LimitConfig(100, 60);            // 100 per minute
    private LimitConfig resumeUpload = new LimitConfig(120, 60);    // 120 per minute
    private LimitConfig ats = new LimitConfig(120, 60);             // 120 per minute
    private LimitConfig coding = new LimitConfig(60, 60);           // 60 per minute
    private LimitConfig jdMatch = new LimitConfig(60, 3600);        // 60 per hour

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
