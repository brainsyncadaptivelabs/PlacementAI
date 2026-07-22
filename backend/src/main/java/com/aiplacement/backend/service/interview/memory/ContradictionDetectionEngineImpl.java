package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.CandidateContradiction;
import com.aiplacement.backend.entity.ContradictionReviewStatus;
import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.CandidateContradictionRepository;
import com.aiplacement.backend.repository.memory.MemoryEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Detects candidate contradictions from AI-extracted interview turn data.
 *
 * <h3>Confidence Gating</h3>
 * <p>Only contradictions with confidence >= {@link #CONFIDENCE_THRESHOLD} are persisted.
 * All persisted contradictions default to {@link ContradictionReviewStatus#PENDING_REVIEW}
 * and only affect placement scores once a recruiter confirms them.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContradictionDetectionEngineImpl implements ContradictionDetectionEngine {

    /** Minimum AI confidence score required to persist a detected contradiction. */
    private static final double CONFIDENCE_THRESHOLD = 0.6;

    private final CandidateContradictionRepository candidateContradictionRepository;
    private final MemoryEventRepository memoryEventRepository;

    @Override
    public void detectContradictions(User user, JsonNode extractedData) {
        if (extractedData == null || !extractedData.has("contradictions")) return;

        for (JsonNode conNode : extractedData.get("contradictions")) {
            if (!conNode.has("text")) continue;
            String text = conNode.get("text").asText();
            if (text == null || text.trim().isEmpty()) continue;

            // Confidence gating — low-confidence detections are not persisted
            double confidence = conNode.has("confidence") ? conNode.get("confidence").asDouble() : 0.8;
            if (confidence < CONFIDENCE_THRESHOLD) {
                log.debug("[CONTRADICTION] Skipping low-confidence detection (confidence={:.2f}): {}", confidence, text);
                continue;
            }

            // Build reason trace from available AI fields for recruiter review
            String reasonTrace = buildReasonTrace(conNode, confidence);

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
                    .confidence(confidence)
                    .confidenceThreshold(CONFIDENCE_THRESHOLD)
                    .reasonTrace(reasonTrace)
                    .reviewStatus(ContradictionReviewStatus.PENDING_REVIEW)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();

            candidateContradictionRepository.save(contradiction);
            log.warn("[MOCK_INTERVIEW] [MEMORY] [CONTRADICTION_FOUND] Contradiction detected (confidence={}, severity={}): {}",
                    confidence, contradiction.getSeverity(), text);

            memoryEventRepository.save(MemoryEvent.builder()
                    .user(user)
                    .eventType("CONTRADICTION_FOUND")
                    .details(String.format("Contradiction: %s (Severity: %s, Confidence: %.2f, Status: %s, Suggested Follow-up: %s)",
                            text, contradiction.getSeverity(), confidence, ContradictionReviewStatus.PENDING_REVIEW, contradiction.getSuggestedFollowup()))
                    .build());
        }
    }

    /**
     * Assembles a structured reasoning trace from AI-provided fields for recruiter transparency.
     */
    private String buildReasonTrace(JsonNode conNode, double confidence) {
        StringBuilder trace = new StringBuilder();
        trace.append(String.format("Confidence: %.2f\n", confidence));
        if (conNode.has("explanation")) trace.append("Explanation: ").append(conNode.get("explanation").asText()).append("\n");
        if (conNode.has("evidence")) trace.append("Evidence: ").append(conNode.get("evidence").asText()).append("\n");
        if (conNode.has("matchedResumeSection")) trace.append("Resume Section: ").append(conNode.get("matchedResumeSection").asText()).append("\n");
        if (conNode.has("matchedInterviewAnswer")) trace.append("Interview Answer: ").append(conNode.get("matchedInterviewAnswer").asText()).append("\n");
        return trace.toString().trim();
    }
}

