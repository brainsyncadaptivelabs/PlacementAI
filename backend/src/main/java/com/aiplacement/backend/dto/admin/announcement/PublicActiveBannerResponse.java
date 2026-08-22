package com.aiplacement.backend.dto.admin.announcement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicActiveBannerResponse {
    private boolean maintenanceActive;
    private String maintenanceMessage;
    private LocalDateTime maintenanceStartTime;
    private LocalDateTime maintenanceEndTime;
    
    private boolean announcementActive;
    private String announcementTitle;
    private String announcementContent;
}
