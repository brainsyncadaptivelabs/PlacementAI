package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "aptitude_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "aptitude_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;

    @Column(nullable = false)
    private String answer;

    private String difficulty; // Easy, Medium, Hard

    private Integer timeLimit;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private String formula;

    private String companyLevel;
}
