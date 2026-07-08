package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreamingCoordinator {

    private final ChatGenerationService chatGenerationService;

    public Flux<String> coordinateStream(AISessionContext sessionContext, String systemPrompt, String userPrompt) {
        log.info("StreamingCoordinator starting SSE socket for conversation={}", sessionContext.getConversationId());

        Flux<String> responseStream = chatGenerationService.generateResponseStream(sessionContext, systemPrompt, userPrompt)
                .share();

        // Periodically emit heartbeats to keep the socket alive
        Flux<String> heartbeat = Flux.interval(Duration.ofSeconds(15))
                .map(tick -> " ")
                .takeUntilOther(responseStream.ignoreElements());

        return Flux.merge(responseStream, heartbeat)
                .doOnNext(chunk -> log.debug("[StreamingCoordinator] Chunk emitted to SSE: '{}'", chunk))
                .doOnCancel(() -> log.info("Client triggered cancellation for session={}", sessionContext.getRequestId()))
                .doOnComplete(() -> log.info("Streaming session complete for request={}", sessionContext.getRequestId()));
    }
}
