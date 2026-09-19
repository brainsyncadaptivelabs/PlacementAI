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
public class ProgramOfDayDto {
    private Long id;
    private Long problemId;
    private String title;
    private String difficulty;
    private List<String> tags;
    private LocalDate assignedDate;
    private String timezone;
    private String status; // PENDING, COMPLETED
    private Long secondsUntilReset;
    private Integer currentStreak;
    private Integer longestStreak;
    private Boolean isRewardAvailable;
    private ProblemDto problem;
}
