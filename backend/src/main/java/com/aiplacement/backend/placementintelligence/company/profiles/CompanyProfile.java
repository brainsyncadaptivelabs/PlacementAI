package com.aiplacement.backend.placementintelligence.company.profiles;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class CompanyProfile {
    String companyName;
    List<String> requiredSkills;
    List<String> preferredProjects;
    int resumePriority;
    int atsPriority;
    int interviewPriority;
    int codingPriority;
    double communicationWeight;
    double aptitudeWeight;
    List<String> softSkills;
    int leadershipImportance;
}
