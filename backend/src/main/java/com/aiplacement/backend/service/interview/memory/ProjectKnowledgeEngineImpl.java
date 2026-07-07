package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateProjectKnowledge;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.CandidateProjectKnowledgeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectKnowledgeEngineImpl implements ProjectKnowledgeEngine {

    private final CandidateProjectKnowledgeRepository candidateProjectKnowledgeRepository;

    @Override
    public void updateProjectKnowledge(User user, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("projects")) return;

        for (JsonNode projNode : extractedData.get("projects")) {
            if (!projNode.has("name")) continue;
            String name = projNode.get("name").asText();
            if (name == null || name.trim().isEmpty()) continue;

            CandidateProjectKnowledge pk = candidateProjectKnowledgeRepository
                    .findByUserAndProjectNameIgnoreCase(user, name)
                    .orElseGet(() -> CandidateProjectKnowledge.builder()
                            .user(user)
                            .projectName(name)
                            .confidence(0.5)
                            .build());

            if (projNode.has("architecture")) pk.setArchitecture(projNode.get("architecture").asText());
            if (projNode.has("security")) pk.setSecurity(projNode.get("security").asText());
            if (projNode.has("databaseTech")) pk.setDatabaseTech(projNode.get("databaseTech").asText());
            if (projNode.has("caching")) pk.setCaching(projNode.get("caching").asText());
            if (projNode.has("deployment")) pk.setDeployment(projNode.get("deployment").asText());
            if (projNode.has("scaling")) pk.setScaling(projNode.get("scaling").asText());
            if (projNode.has("monitoring")) pk.setMonitoring(projNode.get("monitoring").asText());
            if (projNode.has("testing")) pk.setTesting(projNode.get("testing").asText());
            if (projNode.has("devops")) pk.setDevops(projNode.get("devops").asText());
            if (projNode.has("confidence")) pk.setConfidence(projNode.get("confidence").asDouble());

            candidateProjectKnowledgeRepository.save(pk);
            log.info("[MOCK_INTERVIEW] [MEMORY] Updated Project Knowledge for project: {}", name);
        }
    }
}
