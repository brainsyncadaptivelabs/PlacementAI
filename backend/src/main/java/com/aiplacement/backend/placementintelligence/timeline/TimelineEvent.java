package com.aiplacement.backend.placementintelligence.timeline;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TimelineEvent {
    String month;
    String milestone;
    String status; // COMPLETED, UPCOMING, IN_PROGRESS
    String details;
}
