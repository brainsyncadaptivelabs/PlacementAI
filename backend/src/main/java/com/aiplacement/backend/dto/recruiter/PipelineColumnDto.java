package com.aiplacement.backend.dto.recruiter;

import com.aiplacement.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineColumnDto {

    private Long jobId;
    private String jobTitle;

    // Each key is the ApplicationStatus name, value is list of applications in that column
    private Map<ApplicationStatus, List<JobApplicationDto>> columns;

    // Column order for rendering
    private List<ApplicationStatus> columnOrder;
}
