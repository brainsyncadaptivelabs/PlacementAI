package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewPersistenceServiceImpl implements InterviewPersistenceService {

    private final MockInterviewRepository mockInterviewRepository;
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
}
