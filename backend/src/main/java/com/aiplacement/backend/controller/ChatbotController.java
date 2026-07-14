package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.chat.ChatRequestDto;
import com.aiplacement.backend.dto.chat.ChatResponseDto;
import com.aiplacement.backend.entity.chat.ChatConversation;
import com.aiplacement.backend.entity.chat.ChatMessage;
import com.aiplacement.backend.service.chat.ChatConversationManager;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatConversationManager chatConversationManager;
    private final RateLimitConfig rateLimitConfig;

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversation>> getConversations() {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.getConversations(email));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ChatConversation> createConversation(@RequestParam(required = false) String title) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.createConversation(email, title));
    }

    @PutMapping("/conversations/{id}")
    public ResponseEntity<ChatConversation> renameConversation(@PathVariable Long id, @RequestParam String title) {
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (title.trim().length() > 100) {
            title = title.substring(0, 100);
        }
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.renameConversation(email, id, title.trim()));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        chatConversationManager.deleteConversation(email, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations/{id}/history")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.getHistory(email, id));
    }

    @PutMapping("/conversations/{id}/pin")
    public ResponseEntity<ChatConversation> togglePin(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.togglePin(email, id));
    }

    @PutMapping("/conversations/{id}/star")
    public ResponseEntity<ChatConversation> toggleStar(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.toggleStar(email, id));
    }

    @PostMapping("/conversations/{id}/duplicate")
    public ResponseEntity<ChatConversation> duplicateConversation(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.duplicateConversation(email, id));
    }

    @PutMapping("/conversations/{id}/archive")
    public ResponseEntity<ChatConversation> toggleArchive(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(chatConversationManager.toggleArchive(email, id));
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponseDto> askQuestion(
            @RequestBody ChatRequestDto request
    ) {
        String username = getAuthenticatedEmail();
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
        String username = getAuthenticatedEmail();
        Bucket bucket = rateLimitConfig.resolveBucket(username);

        if (!bucket.tryConsume(1)) {
            return Flux.just("Too many requests. Please try again later.");
        }

        log.info("Starting stream question connection for user: {}", username);

        Flux<String> responseStream = chatbotService.streamQuestion(request)
                .doOnSubscribe(s -> log.info("[ChatbotController] Subscribed to AI stream for user: {}", username))
                .doOnNext(chunk -> log.info("[AI Log] Chunk written to SSE: '{}'", chunk))
                .map(chunk -> "data: " + chunk + "\n\n")
                .share();

        Flux<String> heartbeat = Flux.interval(Duration.ofSeconds(15))
                .map(tick -> "data: \n\n")
                .takeUntilOther(responseStream.ignoreElements());

        return Flux.merge(responseStream, heartbeat)
                .timeout(Duration.ofSeconds(60))
                .doOnCancel(() -> log.info("Client cancelled/stopped chat stream for user: {}", username))
                .doOnComplete(() -> log.info("Stream completed successfully for user: {}", username))
                .onErrorResume(err -> {
                    log.error("Error occurred in stream for user: {}", username, err);
                    return Flux.just(" [ERROR: " + err.getMessage() + "]");
                });
    }

    private String getAuthenticatedEmail() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "anonymous";
    }
}