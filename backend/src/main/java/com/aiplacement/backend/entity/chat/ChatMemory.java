package com.aiplacement.backend.entity.chat;

import com.aiplacement.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_memories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "memory_type", nullable = false)
    private String memoryType; // 'USER_PREFERENCE', 'CAREER_GOAL', 'SKILL', 'RESUME_FACT'

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private int importanceScore;
    private boolean isPinned;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
