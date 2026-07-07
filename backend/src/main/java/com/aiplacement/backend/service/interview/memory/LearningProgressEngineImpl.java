package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateLearningProgress;
import com.aiplacement.backend.entity.CandidateSkillConfidence;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.CandidateLearningProgressRepository;
import com.aiplacement.backend.repository.memory.CandidateSkillConfidenceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningProgressEngineImpl implements LearningProgressEngine {

    private final CandidateLearningProgressRepository candidateLearningProgressRepository;
    private final CandidateSkillConfidenceRepository candidateSkillConfidenceRepository;

    @Override
    public void recordProgress(User user, LocalDateTime interviewDate, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("skills")) return;

        for (JsonNode skillNode : extractedData.get("skills")) {
            String skillName = skillNode.asText();
            var skillConfOpt = candidateSkillConfidenceRepository.findByUserAndSkillIgnoreCase(user, skillName);
            if (skillConfOpt.isPresent()) {
                CandidateSkillConfidence sc = skillConfOpt.get();
                double prevConfidence = sc.getConfidence() - 5.0; // Estimate delta for progress records
                double newConfidence = sc.getConfidence();
                double improvement = Math.max(0.0, newConfidence - prevConfidence);
                double regression = Math.max(0.0, prevConfidence - newConfidence);

                CandidateLearningProgress progress = CandidateLearningProgress.builder()
                        .user(user)
                        .interviewDate(interviewDate)
                        .skill(skillName)
                        .previousConfidence(prevConfidence)
                        .newConfidence(newConfidence)
                        .improvement(improvement)
                        .regression(regression)
                        .trend(sc.getTrend())
                        .build();

                candidateLearningProgressRepository.save(progress);
                log.info("[MOCK_INTERVIEW] [MEMORY] Recorded learning progress for skill: {}", skillName);
            }
        }
    }
}
