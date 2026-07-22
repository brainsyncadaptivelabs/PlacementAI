package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateContradiction;
import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.CandidateContradictionRepository;
import com.aiplacement.backend.repository.memory.MemoryEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContradictionDetectionEngineImpl implements ContradictionDetectionEngine {

    private final CandidateContradictionRepository candidateContradictionRepository;
    private final MemoryEventRepository memoryEventRepository;

    @Override
    public void detectContradictions(User user, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("contradictions")) return;

        for (JsonNode conNode : extractedData.get("contradictions")) {
            if (!conNode.has("text")) continue;
            String text = conNode.get("text").asText();
            if (text == null || text.trim().isEmpty()) continue;

            CandidateContradiction contradiction = CandidateContradiction.builder()
                    .user(user)
                    .contradictionText(text)
                    .severity(conNode.has("severity") ? conNode.get("severity").asText() : "MEDIUM")
                    .relatedQuestions(conNode.has("relatedQuestions") ? conNode.get("relatedQuestions").toString() : "")
                    .suggestedFollowup(conNode.has("suggestedFollowup") ? conNode.get("suggestedFollowup").asText() : "")
                    .explanation(conNode.has("explanation") ? conNode.get("explanation").asText() : "")
                    .evidence(conNode.has("evidence") ? conNode.get("evidence").asText() : "")
                    .matchedResumeSection(conNode.has("matchedResumeSection") ? conNode.get("matchedResumeSection").asText() : "")
                    .matchedInterviewAnswer(conNode.has("matchedInterviewAnswer") ? conNode.get("matchedInterviewAnswer").asText() : "")
                    .confidence(conNode.has("confidence") ? conNode.get("confidence").asDouble() : 0.8)
                    .status("Needs Human Review")
                    .timestamp(java.time.LocalDateTime.now())
                    .build();

            candidateContradictionRepository.save(contradiction);
            log.warn("[MOCK_INTERVIEW] [MEMORY] [CONTRADICTION_FOUND] Contradiction detected: {}", text);

            memoryEventRepository.save(MemoryEvent.builder()
                    .user(user)
                    .eventType("CONTRADICTION_FOUND")
                    .details(String.format("Contradiction: %s (Severity: %s, Suggested Follow-up: %s)", 
                            text, contradiction.getSeverity(), contradiction.getSuggestedFollowup()))
                    .build());
        }
    }
}
