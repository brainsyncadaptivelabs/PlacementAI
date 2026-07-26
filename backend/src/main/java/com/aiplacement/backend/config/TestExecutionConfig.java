package com.aiplacement.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class TestExecutionConfig {

    @Value("${coding.execution.core-pool-size:10}")
    private int corePoolSize;

    @Value("${coding.execution.max-pool-size:50}")
    private int maxPoolSize;

    @Value("${coding.execution.queue-capacity:100}")
    private int queueCapacity;

    @Value("${coding.execution.thread-prefix:coding-exec-}")
    private String threadPrefix;

    @Bean(name = "testExecutionExecutor")
    public Executor testExecutionExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadPrefix);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
