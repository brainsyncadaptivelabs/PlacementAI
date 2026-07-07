package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "knowledge_graph_edges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeGraphEdge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long sourceNodeId;
    private Long targetNodeId;
    private String relationship; // KNOWS, BUILT, UNDERSTANDS
    private Double weight;
}
