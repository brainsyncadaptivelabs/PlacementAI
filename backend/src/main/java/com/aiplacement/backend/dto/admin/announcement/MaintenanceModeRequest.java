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
public class MaintenanceModeRequest {
    private boolean enabled;
    private String bannerMessage;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
