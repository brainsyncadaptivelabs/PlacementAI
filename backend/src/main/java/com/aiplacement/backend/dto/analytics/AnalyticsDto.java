package com.aiplacement.backend.dto.analytics;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDto {
    private List<StatDto> stats;
    private List<ProgressDataDto> chartData;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatDto {
        private String label;
        private String value;
        private String growth;
        private boolean positive;
        private String color;
        private String icon;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressDataDto {
        private String day;
        private Integer score;
    }
}
