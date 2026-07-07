package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateVerifiedResume;
import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.CandidateVerifiedResumeRepository;
import com.aiplacement.backend.repository.memory.MemoryEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeVerificationEngineImpl implements ResumeVerificationEngine {

    private final CandidateVerifiedResumeRepository candidateVerifiedResumeRepository;
    private final MemoryEventRepository memoryEventRepository;

    @Override
    public void verifyClaims(User user, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("claims")) return;

        for (JsonNode claimNode : extractedData.get("claims")) {
            if (!claimNode.has("claim")) continue;
            String text = claimNode.get("claim").asText();
            if (text == null || text.trim().isEmpty()) continue;

            CandidateVerifiedResume claim = candidateVerifiedResumeRepository
                    .findByUserAndClaimIgnoreCase(user, text)
                    .orElseGet(() -> CandidateVerifiedResume.builder()
                            .user(user)
                            .claim(text)
                            .status("CLAIMED")
                            .confidence(0.5)
                            .risk("MEDIUM")
                            .build());

            String oldStatus = claim.getStatus();
            String newStatus = claimNode.has("status") ? claimNode.get("status").asText() : oldStatus;
            double confidence = claimNode.has("confidence") ? claimNode.get("confidence").asDouble() : claim.getConfidence();
            String risk = claimNode.has("risk") ? claimNode.get("risk").asText() : claim.getRisk();

            claim.setStatus(newStatus);
            claim.setConfidence(confidence);
            claim.setRisk(risk);

            candidateVerifiedResumeRepository.save(claim);
            log.info("[MOCK_INTERVIEW] [MEMORY] Updated Resume Claim Verification: {} -> {}", text, newStatus);

            if ("VERIFIED".equalsIgnoreCase(newStatus) && !"VERIFIED".equalsIgnoreCase(oldStatus)) {
                memoryEventRepository.save(MemoryEvent.builder()
                        .user(user)
                        .eventType("CLAIM_VERIFIED")
                        .details(String.format("Resume claim verified: %s (Confidence: %.1f%%, Risk: %s)", 
                                text, confidence * 100, risk))
                        .build());
            }
        }
    }
}
