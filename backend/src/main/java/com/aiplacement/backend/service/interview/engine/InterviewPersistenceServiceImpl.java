package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.interview.MockInterviewSnapshot;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.repository.interview.MockInterviewSnapshotRepository;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewPersistenceServiceImpl implements InterviewPersistenceService {

    private final MockInterviewRepository mockInterviewRepository;
    private final MockInterviewSnapshotRepository snapshotRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public MockInterview saveInterviewState(MockInterview interview, AdaptiveState state) {
        try {
            interview.setCurrentStateJson(objectMapper.writeValueAsString(state));
        } catch (Exception e) {
            log.error("Failed to serialize interview state", e);
        }
        MockInterview saved = mockInterviewRepository.save(interview);
        log.info("[MOCK_INTERVIEW] [ANSWER_SAVED] Saved and persisted interview state for ID: {} (FSM: {})", saved.getId(), state.getFsmState());
        return saved;
    }

    @Override
    public void saveSnapshot(MockInterview interview, AdaptiveState state, String questionText, 
                              String answerText, JsonNode evaluationJson, String promptVersion, String modelVersion) {
        try {
            MockInterviewSnapshot snapshot = MockInterviewSnapshot.builder()
                    .mockInterview(interview)
                    .turnIndex(interview.getCurrentQuestionIndex())
                    .questionText(questionText)
                    .answerText(answerText)
                    .evaluationJson(evaluationJson != null ? evaluationJson.toString() : null)
                    .difficulty(state.getCurrentDifficulty())
                    .knowledgeGraphSnapshotJson(null) // Handled by Graph service asynchronously
                    .promptVersion(promptVersion)
                    .modelVersion(modelVersion)
                    .contextSummary(interview.getRole() + " at " + interview.getCompany())
                    .build();
            snapshotRepository.save(snapshot);
            log.info("Turn snapshot persisted for interview ID: {}, turn index: {}", interview.getId(), snapshot.getTurnIndex());
        } catch (Exception e) {
            log.error("Failed to save interview snapshot log", e);
        }
    }
}
