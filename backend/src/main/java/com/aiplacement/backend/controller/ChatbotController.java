package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.chat.ChatRequestDto;
import com.aiplacement.backend.dto.chat.ChatResponseDto;
import com.aiplacement.backend.service.chat.ChatbotService;
import com.aiplacement.backend.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final RateLimitConfig rateLimitConfig;

    @PostMapping("/ask")
    public ResponseEntity<ChatResponseDto> askQuestion(
            @RequestBody ChatRequestDto request
    ) {
        String username = "anonymous";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        Bucket bucket = rateLimitConfig.resolveBucket(username);

        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(429)
                    .body(
                            new ChatResponseDto(
                                    "Too many requests. Please try again later."
                             )
                    );
        }

        String answer =
                chatbotService.askQuestion(
                        request
                );

        return ResponseEntity.ok(
                new ChatResponseDto(answer)
        );
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamQuestion(
            @RequestBody ChatRequestDto request
    ) {
        String username = "anonymous";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        Bucket bucket = rateLimitConfig.resolveBucket(username);

        if (!bucket.tryConsume(1)) {
            return Flux.just("Too many requests. Please try again later.");
        }

        final String finalUsername = username;
        log.info("Starting stream question connection for user: {}", finalUsername);

        Flux<String> responseStream = chatbotService.streamQuestion(request).publish().refCount(2);

        Flux<String> heartbeat = Flux.interval(Duration.ofSeconds(15))
                .map(tick -> " ")
                .takeUntilOther(responseStream.ignoreElements());

        return Flux.merge(responseStream, heartbeat)
                .timeout(Duration.ofSeconds(60))
                .doOnCancel(() -> log.info("Client cancelled/stopped chat stream for user: {}", finalUsername))
                .doOnComplete(() -> log.info("Stream completed successfully for user: {}", finalUsername))
                .onErrorResume(err -> {
                    log.error("Error occurred in stream for user: {}", finalUsername, err);
                    return Flux.error(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "AI Stream failed"));
                });
    }
}