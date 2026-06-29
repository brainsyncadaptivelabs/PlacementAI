package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_metrics", indexes = {
        @Index(name = "idx_system_metric_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "ram_usage")
    private Double ramUsage;

    @Column(name = "disk_usage")
    private Double diskUsage;

    @Column(name = "api_latency")
    private Long apiLatency;

    @Column(name = "error_rate")
    private Double errorRate;

    @Column(name = "average_response_time")
    private Long averageResponseTime;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
