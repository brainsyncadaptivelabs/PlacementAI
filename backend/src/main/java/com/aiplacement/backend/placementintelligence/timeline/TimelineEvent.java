package com.aiplacement.backend.placementintelligence.timeline;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Jacksonized
public class TimelineEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String month;
    private String milestone;
    private String status; // COMPLETED, UPCOMING, IN_PROGRESS
    private String details;
}

