package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_project_knowledge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProjectKnowledge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String projectName;

    @Column(columnDefinition = "TEXT")
    private String architecture;
    
    @Column(columnDefinition = "TEXT")
    private String security;
    
    @Column(columnDefinition = "TEXT")
    private String databaseTech;
    
    @Column(columnDefinition = "TEXT")
    private String caching;
    
    @Column(columnDefinition = "TEXT")
    private String deployment;
    
    @Column(columnDefinition = "TEXT")
    private String scaling;
    
    @Column(columnDefinition = "TEXT")
    private String monitoring;
    
    @Column(columnDefinition = "TEXT")
    private String testing;
    
    @Column(columnDefinition = "TEXT")
    private String devops;

    private Double confidence;
}
