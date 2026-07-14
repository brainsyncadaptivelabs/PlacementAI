package com.aiplacement.backend.config.ai;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.ai.client.impl.NvidiaBuildClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Spring configuration for the AI provider layer.
 *
 * <p>Registers {@link NvidiaBuildClient} as the primary {@link AIClient} bean.
 * To switch providers, replace this bean registration with an alternative
 * implementation — no service-layer changes required.</p>
 *
 * <p>Connection pooling, read/write timeouts, and connect timeouts are
 * configured here at the WebClient level for the NVIDIA-dedicated HTTP client.</p>
 */
@Configuration
@RequiredArgsConstructor
public class AIClientConfig {

    private final NvidiaAIProperties properties;

    /**
     * Dedicated {@link WebClient} for the NVIDIA Build API.
     *
     * <p>Timeouts are driven by {@link NvidiaAIProperties#getTimeoutSeconds()}.
     * A separate WebClient is used (rather than the shared one) so that
     * AI-specific timeout tuning does not affect other HTTP calls.</p>
     */
    @Bean("nvidiaWebClient")
    public WebClient nvidiaWebClient() {
        int timeoutMs = properties.getTimeoutSeconds() * 1000;

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofMillis(timeoutMs))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(properties.getTimeoutSeconds(), TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(30, TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    /**
     * Primary {@link AIClient} implementation — NVIDIA Build API.
     *
     * <p>Marked {@link Primary} so it is injected by default wherever
     * {@code AIClient} is required, without qualifier annotations on
     * every injection site.</p>
     */
    @Bean
    @Primary
    @Lazy
    public AIClient aiClient(
            ObjectMapper objectMapper,
            com.aiplacement.backend.repository.ApiUsageLogRepository apiUsageLogRepository,
            com.aiplacement.backend.logging.AiLoggingService aiLoggingService,
            com.aiplacement.backend.monitoring.AiMetrics aiMetrics
    ) {
        return new NvidiaBuildClient(
                nvidiaWebClient(),
                properties,
                objectMapper,
                apiUsageLogRepository,
                aiLoggingService,
                aiMetrics
        );
    }
}
