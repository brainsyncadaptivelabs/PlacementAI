package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_log_timestamp", columnList = "timestamp"),
        @Index(name = "idx_audit_log_admin_email", columnList = "admin_email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address")
    private String ipAddress;

    private String browser;

    private String os;

    @Column(name = "admin_email")
    private String adminEmail;

    @Column(nullable = false)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String target;

    @Column(nullable = false)
    private String status;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
