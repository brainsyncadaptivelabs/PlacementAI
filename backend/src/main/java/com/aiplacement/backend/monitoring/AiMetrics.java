package com.aiplacement.backend.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class AiMetrics {

    private final Timer aiLatencyTimer;
    private final Counter reflectionCounter;
    private final Counter aiRequestCounter;

    public AiMetrics(MeterRegistry registry) {
        this.aiLatencyTimer = Timer.builder("placementai.ai.latency")
                .description("Latency distribution of AI requests")
                .publishPercentileHistogram()
                .register(registry);

        this.reflectionCounter = Counter.builder("placementai.ai.reflection.total")
                .description("Total number of AI self-reflection runs")
                .register(registry);

        this.aiRequestCounter = Counter.builder("placementai.ai.requests.total")
                .description("Total number of AI requests executed")
                .register(registry);
    }

    public void recordLatency(long latencyMs) {
        aiLatencyTimer.record(latencyMs, TimeUnit.MILLISECONDS);
    }

    public void incrementReflection() {
        reflectionCounter.increment();
    }

    public void incrementAiRequests() {
        aiRequestCounter.increment();
    }
}
