package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.chat.ChatRequestDto;
import com.aiplacement.backend.dto.chat.ChatResponseDto;
import com.aiplacement.backend.service.chat.ChatbotService;
import com.aiplacement.backend.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
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

        return chatbotService.streamQuestion(
                request
        );
    }
}