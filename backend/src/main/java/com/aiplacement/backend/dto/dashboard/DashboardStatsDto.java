package com.aiplacement.backend.dto.dashboard;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class DashboardStatsDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long totalResumes;

    private Long totalAnalyses;

    private Double averageAtsScore;

    private Integer highestAtsScore;

    private Integer readinessScore;

    private Long mockInterviewsCount;

    private Long roadmapsCount;

    private String fullName;

    private java.util.List<EventDto> upcomingEvents;
}