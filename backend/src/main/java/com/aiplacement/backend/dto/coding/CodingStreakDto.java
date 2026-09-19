package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingStreakDto {
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate lastCompletedDate;
    private Boolean completedToday;
    private List<DayStatus> weeklyCalendar;
    private Integer daysToNextReward;
    private Boolean rewardAvailable;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayStatus {
        private String dayName; // Mon, Tue, ...
        private LocalDate date;
        private Boolean completed;
        private Boolean isToday;
    }
}
