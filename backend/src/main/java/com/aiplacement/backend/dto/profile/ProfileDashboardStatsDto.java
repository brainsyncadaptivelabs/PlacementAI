package com.aiplacement.backend.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDashboardStatsDto {
    private int activityStreakDays;
    private int questionsEasy;
    private int questionsMedium;
    private int questionsHard;
    private boolean resumeVerified;
    private List<ActivityLogDto> heatmapData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityLogDto {
        private String date; // ISO format YYYY-MM-DD
        private int durationMinutes;
    }
}
