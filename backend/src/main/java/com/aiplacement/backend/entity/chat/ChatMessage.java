package com.aiplacement.backend.entity.chat;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ChatConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ChatMessage parentMessage;

    @Column(nullable = false)
    private String sender; // "USER", "ASSISTANT", "SYSTEM"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private int promptTokens;
    private int completionTokens;
    private long latencyMs;

    @Column(nullable = false)
    private String modelUsed;

    private String finishReason;
    private boolean isPinned;

    @Column(columnDefinition = "TEXT")
    private String attachmentsJson;

    private boolean isEdited;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
