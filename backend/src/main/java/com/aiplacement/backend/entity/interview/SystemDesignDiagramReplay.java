package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_design_diagram_replays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemDesignDiagramReplay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_design_diagram_id", nullable = false)
    private SystemDesignDiagram systemDesignDiagram;

    @Column(columnDefinition = "TEXT")
    private String componentsJson;

    @Column(columnDefinition = "TEXT")
    private String connectionsJson;

    private int snapshotIndex;

    private int componentCount;
    private int connectionCount;

    @CreationTimestamp
    private LocalDateTime snapshotTimestamp;
}
