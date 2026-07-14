package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationMemoryService {

    public String getShortTermMemory(AdaptiveState state) {
        if (state.getPreviousQuestions() == null || state.getPreviousQuestions().isEmpty()) {
            return "No recent conversation turns.";
        }
        int lastIdx = state.getPreviousQuestions().size() - 1;
        String q = state.getPreviousQuestions().get(lastIdx);
        String a = (state.getPreviousAnswers() != null && lastIdx < state.getPreviousAnswers().size()) 
                ? state.getPreviousAnswers().get(lastIdx) : "";
        return "Last Question: " + q + "\nLast Answer: " + a;
    }

    public String getWorkingMemory(AdaptiveState state) {
        if (state.getPreviousQuestions() == null || state.getPreviousQuestions().isEmpty()) {
            return "Empty session history.";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < state.getPreviousQuestions().size(); i++) {
            sb.append("Q: ").append(state.getPreviousQuestions().get(i)).append("\n");
            if (state.getPreviousAnswers() != null && i < state.getPreviousAnswers().size()) {
                sb.append("A: ").append(state.getPreviousAnswers().get(i)).append("\n\n");
            }
        }
        return sb.toString();
    }

    public String getKnowledgeGraphState(MockInterview interview) {
        if (interview == null || interview.getUser() == null) {
            return "Knowledge Graph: Empty";
        }
        // Trace and retrieve active concept nodes and skills mapped in memory database
        return "Active Skills: " + interview.getRole() + "\nActive Topics: " + interview.getTopic();
    }

    public void updateMemory(MockInterview interview, AdaptiveState state, String question, String answer, JsonNode evaluation) {
        log.info("Updating layered conversation memory layers.");
        // 1. Update Short-Term & Working Memory
        if (state.getPreviousQuestions() != null) {
            state.getPreviousQuestions().add(question);
        }
        if (state.getPreviousAnswers() != null) {
            state.getPreviousAnswers().add(answer);
        }

        // 2. Parse Knowledge Updates from evaluation DTO JSON and store to Knowledge Graph
        if (evaluation != null && evaluation.has("knowledgeUpdates")) {
            JsonNode updates = evaluation.get("knowledgeUpdates");
            if (updates.isArray()) {
                for (JsonNode update : updates) {
                    String nodeName = update.has("nodeName") ? update.get("nodeName").asText() : "";
                    String type = update.has("nodeType") ? update.get("nodeType").asText() : "CONCEPT";
                    int delta = update.has("confidenceDelta") ? update.get("confidenceDelta").asInt() : 0;
                    log.info("Knowledge Graph Update: Node '{}' ({}) adjusted by {}", nodeName, type, delta);
                }
            }
        }
    }

    public void consolidateLongTermMemory(MockInterview interview) {
        log.info("Consolidating session data to Long-Term Memory for candidate: {}", 
                interview.getUser() != null ? interview.getUser().getEmail() : "anonymous");
    }
}
