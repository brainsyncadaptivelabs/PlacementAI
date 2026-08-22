package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements", indexes = {
        @Index(name = "idx_announcement_status", columnList = "status"),
        @Index(name = "idx_announcement_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private AnnouncementTargetType targetType;

    @Column(name = "target_filter", columnDefinition = "TEXT")
    private String targetFilter;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "delivery_channel", nullable = false)
    @Builder.Default
    private String deliveryChannel = "IN_APP"; // IN_APP, EMAIL, IN_APP_AND_EMAIL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AnnouncementStatus status = AnnouncementStatus.DRAFT;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "recipient_count")
    @Builder.Default
    private Integer recipientCount = 0;

    @Column(name = "sent_count")
    @Builder.Default
    private Integer sentCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
