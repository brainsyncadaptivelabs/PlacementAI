package com.aiplacement.backend.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
public class PlacementMetrics {

    private final Counter chatCounter;
    private final Counter atsCounter;
    private final Counter resumeCounter;
    private final Counter interviewCounter;
    private final Counter widgetCounter;
    private final AtomicInteger activeUsersGauge;

    public PlacementMetrics(MeterRegistry registry) {
        this.chatCounter = Counter.builder("placementai.chats.total")
                .description("Total number of chat messages sent")
                .register(registry);

        this.atsCounter = Counter.builder("placementai.ats.scans.total")
                .description("Total number of ATS resume scans")
                .register(registry);

        this.resumeCounter = Counter.builder("placementai.resumes.uploaded.total")
                .description("Total number of resumes uploaded")
                .register(registry);

        this.interviewCounter = Counter.builder("placementai.interviews.mock.total")
                .description("Total number of mock interviews conducted")
                .register(registry);

        this.widgetCounter = Counter.builder("placementai.widgets.generated.total")
                .description("Total number of interactive widgets generated")
                .register(registry);

        this.activeUsersGauge = registry.gauge("placementai.users.active", new AtomicInteger(0));
    }

    private final java.util.concurrent.ConcurrentHashMap<String, Long> activeUsers = new java.util.concurrent.ConcurrentHashMap<>();

    public void recordUserActivity(String email) {
        if (email != null && !email.isBlank() && !"anonymous".equals(email) && !"anonymousUser".equals(email)) {
            activeUsers.put(email, System.currentTimeMillis());
            activeUsersGauge.set(activeUsers.size());
        }
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void cleanExpiredUsers() {
        long threshold = System.currentTimeMillis() - 15 * 60 * 1000; // 15 minutes
        activeUsers.entrySet().removeIf(entry -> entry.getValue() < threshold);
        activeUsersGauge.set(activeUsers.size());
    }

    public void incrementChats() {
        chatCounter.increment();
    }

    public void incrementAtsScans() {
        atsCounter.increment();
    }

    public void incrementResumeUploads() {
        resumeCounter.increment();
    }

    public void incrementMockInterviews() {
        interviewCounter.increment();
    }

    public void incrementWidgetsGenerated() {
        widgetCounter.increment();
    }

    public void setActiveUsers(int count) {
        activeUsersGauge.set(count);
    }
}
