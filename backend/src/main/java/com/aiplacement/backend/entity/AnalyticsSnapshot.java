package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "analytics_snapshots", indexes = {
        @Index(name = "idx_analytics_snapshot_date", columnList = "snapshot_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snapshot_date", nullable = false, unique = true)
    private LocalDate snapshotDate;

    @Column(name = "metrics_json", nullable = false, columnDefinition = "TEXT")
    private String metricsJson;
}
