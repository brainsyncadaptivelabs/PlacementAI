package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReadinessDto {

    private String companyName;
    private Integer readinessScore; // 0-100

    private List<String> strengths;
    private List<String> needsImprovement;
}
