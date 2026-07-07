package com.aiplacement.backend.entity.coding;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "coding_replays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingReplay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_submission_id", nullable = false)
    private CodingSubmission codingSubmission;

    @Column(columnDefinition = "TEXT")
    private String snapshotCode;     // Code at this point in time

    private int snapshotIndex;       // Sequence index (0, 1, 2...)
    private int characterCount;
    private int lineCount;

    private String eventType;        // AUTOSAVE, RUN, SUBMIT, COMPILE

    @CreationTimestamp
    private LocalDateTime snapshotTimestamp;
}
