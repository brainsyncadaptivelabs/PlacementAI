package com.aiplacement.backend.dto.admin.announcement;

import com.aiplacement.backend.entity.AnnouncementTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnnouncementRequest {
    private String title;
    private String content; // Markdown
    private AnnouncementTargetType targetType;
    private String targetFilter; // JSON string
    private Long targetUserId;
    private String deliveryChannel; // IN_APP, EMAIL, IN_APP_AND_EMAIL
    private Boolean sendImmediately;
    private LocalDateTime scheduledAt;
}
