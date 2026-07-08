package com.aiplacement.backend.entity.chat;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prompt_versions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"prompt_definition_id", "version_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_definition_id", nullable = false)
    private PromptDefinition promptDefinition;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Column(name = "prompt_text", columnDefinition = "TEXT", nullable = false)
    private String promptText;

    private boolean isActive;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
