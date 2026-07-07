package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateSkillConfidence;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.repository.memory.CandidateSkillConfidenceRepository;
import com.aiplacement.backend.repository.memory.MemoryEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillConfidenceEngineImpl implements SkillConfidenceEngine {

    private final CandidateSkillConfidenceRepository candidateSkillConfidenceRepository;
    private final MemoryEventRepository memoryEventRepository;

    @Override
    public void updateConfidence(User user, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("skills")) return;

        double deltaScore = extractedData.has("evaluatedScore") ? extractedData.get("evaluatedScore").asDouble() : 70.0;

        for (JsonNode skillNode : extractedData.get("skills")) {
            String skillName = skillNode.asText();
            if (skillName == null || skillName.trim().isEmpty()) continue;

            CandidateSkillConfidence skillConf = candidateSkillConfidenceRepository
                    .findByUserAndSkillIgnoreCase(user, skillName)
                    .orElseGet(() -> CandidateSkillConfidence.builder()
                            .user(user)
                            .skill(skillName)
                            .claimed(true)
                            .verified(false)
                            .questionCount(0)
                            .correctAnswers(0)
                            .incorrectAnswers(0)
                            .averageScore(0.0)
                            .confidence(50.0)
                            .build());

            int count = skillConf.getQuestionCount() + 1;
            skillConf.setQuestionCount(count);

            double sum = (skillConf.getAverageScore() * (count - 1)) + deltaScore;
            double avg = sum / count;
            skillConf.setAverageScore(avg);

            if (deltaScore >= 70.0) {
                skillConf.setCorrectAnswers(skillConf.getCorrectAnswers() + 1);
            } else {
                skillConf.setIncorrectAnswers(skillConf.getIncorrectAnswers() + 1);
            }

            // Recalculate confidence percentage
            double baseConf = avg;
            if (skillConf.getCorrectAnswers() > 0) {
                baseConf += (skillConf.getCorrectAnswers() * 2.0);
            }
            if (skillConf.getIncorrectAnswers() > 0) {
                baseConf -= (skillConf.getIncorrectAnswers() * 3.0);
            }
            double finalConf = Math.min(100.0, Math.max(10.0, baseConf));
            
            String oldTrend = skillConf.getTrend() != null ? skillConf.getTrend() : "STABLE";
            String newTrend = finalConf > skillConf.getConfidence() ? "IMPROVING" : 
                              (finalConf < skillConf.getConfidence() ? "DECLINING" : "STABLE");
            
            skillConf.setConfidence(finalConf);
            skillConf.setTrend(newTrend);
            skillConf.setLastVerified(LocalDateTime.now());
            if (finalConf >= 75.0) {
                skillConf.setVerified(true);
            }

            candidateSkillConfidenceRepository.save(skillConf);
            log.info("[MOCK_INTERVIEW] [MEMORY] Updated Skill Confidence for {}: confidence={}%", skillName, finalConf);

            // Log event if trend changes
            if (!newTrend.equals(oldTrend)) {
                memoryEventRepository.save(MemoryEvent.builder()
                        .user(user)
                        .eventType("SKILL_UPDATED")
                        .details(String.format("Skill %s confidence trend changed from %s to %s. Confidence: %.1f%%", 
                                skillName, oldTrend, newTrend, finalConf))
                        .build());
            }
        }
    }
}
