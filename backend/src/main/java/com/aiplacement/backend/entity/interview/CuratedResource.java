package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "curated_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CuratedResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String skillKeyword;
    private String title;
    private String resourceType;
    private String url;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Integer relevance;
    private String difficulty;
    private Integer estimatedStudyHours;
    private String priority;
    private String category;
    private String prerequisites;
}
