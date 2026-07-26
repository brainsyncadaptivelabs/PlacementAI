package com.aiplacement.backend.service.coding.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class Judge0MetricsService {

    private final MeterRegistry registry;
    private final StringRedisTemplate redisTemplate;

    public Judge0MetricsService(MeterRegistry registry, StringRedisTemplate redisTemplate) {
        this.registry = registry;
        this.redisTemplate = redisTemplate;

        // Register Redis queue size gauge
        registry.gauge("judge0.redis.queue.size", this, Judge0MetricsService::fetchRedisQueueSize);
    }

    public void recordCompilationTime(String language, long timeMs) {
        Timer.builder("judge0.compilation.time")
                .tag("language", language)
                .description("Time taken for code compilation")
                .register(registry)
                .record(timeMs, TimeUnit.MILLISECONDS);
    }

    public void recordExecutionTime(String language, String status, long timeMs) {
        Timer.builder("judge0.execution.time")
                .tag("language", language)
                .tag("status", status)
                .description("Time taken for code execution")
                .register(registry)
                .record(timeMs, TimeUnit.MILLISECONDS);
    }

    public void recordApiLatency(String endpoint, int statusCode, long durationMs) {
        Timer.builder("judge0.api.latency")
                .tag("endpoint", endpoint)
                .tag("status_code", String.valueOf(statusCode))
                .description("HTTP API latency to Judge0 service")
                .register(registry)
                .record(durationMs, TimeUnit.MILLISECONDS);
    }

    public void incrementRequests(String language, String status) {
        Counter.builder("judge0.requests.total")
                .tag("language", language)
                .tag("status", status)
                .description("Total Judge0 execution requests")
                .register(registry)
                .increment();
    }

    public void incrementFailures(String language, String reason) {
        Counter.builder("judge0.failures.total")
                .tag("language", language)
                .tag("reason", reason)
                .description("Total Judge0 execution failures")
                .register(registry)
                .increment();
    }

    public void incrementTimeouts(String language) {
        Counter.builder("judge0.timeouts.total")
                .tag("language", language)
                .description("Total Judge0 execution timeouts")
                .register(registry)
                .increment();
    }

    public void recordMemoryUsage(String language, long bytes) {
        registry.summary("judge0.memory.usage.bytes", "language", language)
                .record(bytes);
    }

    public void recordSubmissionStatus(String language, String status) {
        Counter.builder("judge0.submission.status.total")
                .tag("language", language)
                .tag("status", status)
                .description("Total Judge0 submission status outcomes")
                .register(registry)
                .increment();
    }

    public void recordLanguageUsage(String language) {
        Counter.builder("judge0.language.usage.total")
                .tag("language", language)
                .description("Total submissions per programming language")
                .register(registry)
                .increment();
    }

    public void recordQueueWaitTime(String language, long waitTimeMs) {
        Timer.builder("judge0.queue.wait.time")
                .tag("language", language)
                .description("Time submission spent waiting in queue")
                .register(registry)
                .record(waitTimeMs, TimeUnit.MILLISECONDS);
    }

    private double fetchRedisQueueSize() {
        try {
            Long size = redisTemplate.opsForList().size("resque:queue:default");
            return size != null ? size.doubleValue() : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }
}
