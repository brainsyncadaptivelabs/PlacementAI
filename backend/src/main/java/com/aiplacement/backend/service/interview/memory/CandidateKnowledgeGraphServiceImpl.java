package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.KnowledgeGraphNode;
import com.aiplacement.backend.entity.KnowledgeGraphEdge;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.KnowledgeGraphNodeRepository;
import com.aiplacement.backend.repository.memory.KnowledgeGraphEdgeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateKnowledgeGraphServiceImpl implements CandidateKnowledgeGraphService {

    private final KnowledgeGraphNodeRepository knowledgeGraphNodeRepository;
    private final KnowledgeGraphEdgeRepository knowledgeGraphEdgeRepository;

    @Override
    public void updateGraph(User user, JsonNode extractedData) {
        log.info("[MOCK_INTERVIEW] [MEMORY] Updating Candidate Knowledge Graph");

        // 1. Core candidate node
        KnowledgeGraphNode candidateNode = getOrCreateNode(user, user.getFullName(), "Candidate");

        // 2. Map Skills
        if (extractedData.has("skills")) {
            for (JsonNode skillNode : extractedData.get("skills")) {
                String skillName = skillNode.asText();
                KnowledgeGraphNode skillGraphNode = getOrCreateNode(user, skillName, "SKILL");
                createOrUpdateEdge(user, candidateNode.getId(), skillGraphNode.getId(), "KNOWS", 0.8);
            }
        }

        // 3. Map Concepts
        if (extractedData.has("concepts")) {
            for (JsonNode conceptNode : extractedData.get("concepts")) {
                String conceptName = conceptNode.asText();
                KnowledgeGraphNode conceptGraphNode = getOrCreateNode(user, conceptName, "CONCEPT");
                createOrUpdateEdge(user, candidateNode.getId(), conceptGraphNode.getId(), "UNDERSTANDS", 0.7);
            }
        }

        // 4. Map Projects
        if (extractedData.has("projects")) {
            for (JsonNode projNode : extractedData.get("projects")) {
                if (!projNode.has("name")) continue;
                String projName = projNode.get("name").asText();
                KnowledgeGraphNode projectNode = getOrCreateNode(user, projName, "PROJECT");
                double confidence = projNode.has("confidence") ? projNode.get("confidence").asDouble() : 0.8;
                createOrUpdateEdge(user, candidateNode.getId(), projectNode.getId(), "BUILT", confidence);
            }
        }
    }

    private KnowledgeGraphNode getOrCreateNode(User user, String name, String type) {
        return knowledgeGraphNodeRepository.findByUserAndNameIgnoreCaseAndTypeIgnoreCase(user, name, type)
                .orElseGet(() -> knowledgeGraphNodeRepository.save(KnowledgeGraphNode.builder()
                        .user(user)
                        .name(name)
                        .type(type)
                        .build()));
    }

    private void createOrUpdateEdge(User user, Long source, Long target, String relationship, double weight) {
        KnowledgeGraphEdge edge = knowledgeGraphEdgeRepository
                .findByUserAndSourceNodeIdAndTargetNodeIdAndRelationship(user, source, target, relationship)
                .orElseGet(() -> KnowledgeGraphEdge.builder()
                        .user(user)
                        .sourceNodeId(source)
                        .targetNodeId(target)
                        .relationship(relationship)
                        .build());
        edge.setWeight(weight);
        knowledgeGraphEdgeRepository.save(edge);
    }
}
