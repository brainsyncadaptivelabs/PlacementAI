package com.aiplacement.backend.dto.admin;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsDto {
    private List<AdminStatDto> metrics;
    private List<AdminChartDataDto> chartData;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminStatDto {
        private String label;
        private String value;
        private String trend;
        private String icon;
        private String color;
        private String bg;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminChartDataDto {
        private String name;
        private Long users;
        private Long revenue;
    }
}
