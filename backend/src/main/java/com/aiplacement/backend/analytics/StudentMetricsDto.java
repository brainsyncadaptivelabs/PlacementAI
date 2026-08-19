package com.aiplacement.backend.analytics;

import lombok.Data;

@Data
public class StudentMetricsDto {
    private double cgpa;
    private double dsaScore;
    private double systemDesignScore;
    private double commScore;
    private int projectsCount;
    private int internshipsCount;
}
