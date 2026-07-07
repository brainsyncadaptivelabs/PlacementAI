package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateFollowup;
import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.CandidateFollowupRepository;
import com.aiplacement.backend.repository.memory.MemoryEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowUpPlanningEngineImpl implements FollowUpPlanningEngine {

    private final CandidateFollowupRepository candidateFollowupRepository;
    private final MemoryEventRepository memoryEventRepository;

    @Override
    public void planFollowups(User user, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("followups")) return;

        for (JsonNode fNode : extractedData.get("followups")) {
            if (!fNode.has("questionText")) continue;
            String text = fNode.get("questionText").asText();
            if (text == null || text.trim().isEmpty()) continue;

            CandidateFollowup followup = CandidateFollowup.builder()
                    .user(user)
                    .topic(fNode.has("topic") ? fNode.get("topic").asText() : "General")
                    .questionText(text)
                    .priority(fNode.has("priority") ? fNode.get("priority").asInt() : 1)
                    .status("PENDING")
                    .build();

            candidateFollowupRepository.save(followup);
            log.info("[MOCK_INTERVIEW] [MEMORY] Planned future follow-up: {}", text);

            memoryEventRepository.save(MemoryEvent.builder()
                    .user(user)
                    .eventType("FOLLOWUP_CREATED")
                    .details(String.format("Planned Followup: %s (Topic: %s, Priority: %d)", 
                            text, followup.getTopic(), followup.getPriority()))
                    .build());
        }
    }
}
