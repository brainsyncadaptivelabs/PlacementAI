package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.memory.MemoryEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgePersistenceServiceImpl implements KnowledgePersistenceService {

    private final KnowledgeExtractionEngine knowledgeExtractionEngine;
    private final CandidateKnowledgeGraphService candidateKnowledgeGraphService;
    private final ResumeVerificationEngine resumeVerificationEngine;
    private final ContradictionDetectionEngine contradictionDetectionEngine;
    private final SkillConfidenceEngine skillConfidenceEngine;
    private final ProjectKnowledgeEngine projectKnowledgeEngine;
    private final LearningProgressEngine learningProgressEngine;
    private final FollowUpPlanningEngine followUpPlanningEngine;
    private final MemoryEventRepository memoryEventRepository;
    
    private final com.aiplacement.backend.repository.interview.CandidateVoiceProfileRepository voiceProfileRepository;
    private final com.aiplacement.backend.repository.interview.VoiceTimelineSegmentRepository voiceTimelineSegmentRepository;
    private final com.aiplacement.backend.repository.interview.MockInterviewRepository mockInterviewRepository;

    @Override
    @Transactional
    public void persistTurnMemory(User user, Long interviewId, String question, String answer, JsonNode evaluation) {
        log.info("[MOCK_INTERVIEW] [MEMORY] Starting turn persistence for Interview ID: {}", interviewId);

        // 1. Log ANSWER_RECEIVED event
        memoryEventRepository.save(MemoryEvent.builder()
                .user(user)
                .interviewId(interviewId)
                .eventType("ANSWER_RECEIVED")
                .details("Question: " + question + "\nAnswer: " + answer)
                .build());

        // 2. Extract structured knowledge using AI
        JsonNode extractedData = knowledgeExtractionEngine.extractFromTurn(user, question, answer, evaluation);
        if (extractedData == null) {
            log.warn("[MOCK_INTERVIEW] [MEMORY] Extracted data is null. Bypassing extraction flows.");
            return;
        }

        // 3. Trigger individual engines
        skillConfidenceEngine.updateConfidence(user, extractedData);
        projectKnowledgeEngine.updateProjectKnowledge(user, extractedData);
        resumeVerificationEngine.verifyClaims(user, extractedData);
        contradictionDetectionEngine.detectContradictions(user, extractedData);
        followUpPlanningEngine.planFollowups(user, extractedData);
        candidateKnowledgeGraphService.updateGraph(user, extractedData);
        learningProgressEngine.recordProgress(user, LocalDateTime.now(), extractedData);

        // 4. Log MEMORY_UPDATED event
        memoryEventRepository.save(MemoryEvent.builder()
                .user(user)
                .interviewId(interviewId)
                .eventType("MEMORY_UPDATED")
                .details("Extracted Knowledge: " + extractedData.toString())
                .build());

        // 5. Update Candidate Voice Profile
        try {
            updateVoiceProfile(user, interviewId);
        } catch (Exception e) {
            log.warn("[MOCK_INTERVIEW] [MEMORY] Failed to update voice profile: {}", e.getMessage());
        }

        log.info("[MOCK_INTERVIEW] [MEMORY] Turn persistence completed for Interview ID: {}", interviewId);
    }

    private void updateVoiceProfile(User user, Long interviewId) {
        var interviewOpt = mockInterviewRepository.findById(interviewId);
        if (interviewOpt.isEmpty()) return;

        var segments = voiceTimelineSegmentRepository.findByMockInterviewOrderByCreatedAtAsc(interviewOpt.get());
        if (segments.isEmpty()) return;

        double avgWpm = segments.stream().mapToDouble(s -> s.getSpeechRateWpm() != null ? s.getSpeechRateWpm() : 0.0).filter(v -> v > 0).average().orElse(130.0);
        double avgLatency = segments.stream().mapToDouble(s -> s.getThinkingTimeMs() != null ? s.getThinkingTimeMs() : 0.0).filter(v -> v > 0).average().orElse(2000.0);
        double avgFillers = segments.stream().mapToDouble(s -> s.getFillerWordsCount() != null ? s.getFillerWordsCount() : 0.0).average().orElse(2.0);
        double avgConf = segments.stream().mapToDouble(s -> s.getConfidenceScore() != null ? s.getConfidenceScore() : 0.0).average().orElse(75.0);
        double avgStress = segments.stream().mapToDouble(s -> s.getStressScore() != null ? s.getStressScore() : 0.0).average().orElse(40.0);

        var profile = voiceProfileRepository.findByUser(user)
                .orElse(com.aiplacement.backend.entity.interview.CandidateVoiceProfile.builder().user(user).build());

        profile.setAvgSpeakingSpeed(Math.round(avgWpm * 10.0) / 10.0);
        profile.setAvgResponseLatency(Math.round(avgLatency * 10.0) / 10.0);
        profile.setFillerWordFrequency(Math.round(avgFillers * 10.0) / 10.0);
        profile.setClarityScore(Math.round(avgConf * 10.0) / 10.0);
        profile.setOverallBehavioralScore(Math.round(avgConf * 10.0) / 10.0);
        profile.setInterviewMaturity(Math.round(avgConf * 1.1 * 10.0) / 10.0);
        profile.setEmotionalStability(Math.round((100.0 - avgStress) * 10.0) / 10.0);

        voiceProfileRepository.save(profile);
        log.info("[MOCK_INTERVIEW] [MEMORY] Updated candidate voice profile for user: {}, speed WPM: {}", user.getEmail(), profile.getAvgSpeakingSpeed());
    }
}
