package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.entity.ContradictionReviewStatus;
import com.aiplacement.backend.repository.memory.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemoryRetrievalServiceImpl implements MemoryRetrievalService {

    private final CandidateSkillConfidenceRepository candidateSkillConfidenceRepository;
    private final CandidateProjectKnowledgeRepository candidateProjectKnowledgeRepository;
    private final CandidateContradictionRepository candidateContradictionRepository;
    private final CandidateFollowupRepository candidateFollowupRepository;

    @Override
    public String retrieveRelevantContext(User user, String activeStateKeywords) {
        log.info("[MOCK_INTERVIEW] [MEMORY] Retrieving relevant context for candidate: {}", user.getEmail());
        StringBuilder sb = new StringBuilder();

        // 1. Retrieve Skill Confidence metrics
        List<CandidateSkillConfidence> skills = candidateSkillConfidenceRepository.findByUser(user);
        if (!skills.isEmpty()) {
            sb.append("Verified Skill Confidence Matrix:\n");
            for (CandidateSkillConfidence sc : skills) {
                sb.append(String.format("- %s: Confidence: %.1f%%, Questions Asked: %d, Average Grade: %.1f/100, Trend: %s\n", 
                        sc.getSkill(), sc.getConfidence(), sc.getQuestionCount(), sc.getAverageScore(), sc.getTrend()));
            }
            sb.append("\n");
        }

        // 2. Retrieve Project Architectures
        List<CandidateProjectKnowledge> projects = candidateProjectKnowledgeRepository.findByUser(user);
        if (!projects.isEmpty()) {
            sb.append("Candidate Project Deep Technical Architectures:\n");
            for (CandidateProjectKnowledge pk : projects) {
                sb.append(String.format("- Project: %s (Technical Depth Confidence: %.1f%%)\n", pk.getProjectName(), pk.getConfidence() * 100));
                if (pk.getArchitecture() != null) sb.append("  * Architecture: ").append(pk.getArchitecture()).append("\n");
                if (pk.getCaching() != null) sb.append("  * Caching Strategy: ").append(pk.getCaching()).append("\n");
                if (pk.getDatabaseTech() != null) sb.append("  * Database: ").append(pk.getDatabaseTech()).append("\n");
                if (pk.getScaling() != null) sb.append("  * Scaling: ").append(pk.getScaling()).append("\n");
            }
            sb.append("\n");
        }

        // 3. Retrieve CONFIRMED Contradictions only — PENDING_REVIEW items are unvalidated
        // AI detections and must not be used as basis for aggressive candidate probing.
        List<CandidateContradiction> contradictions = candidateContradictionRepository
                .findByUserAndReviewStatus(user, ContradictionReviewStatus.CONFIRMED);
        long pendingCount = candidateContradictionRepository
                .findByUserAndReviewStatus(user, ContradictionReviewStatus.PENDING_REVIEW).size();

        if (!contradictions.isEmpty()) {
            sb.append("Confirmed Answer Contradictions (Use this to probe reliability):\n");
            for (CandidateContradiction cc : contradictions) {
                sb.append(String.format("- Discrepancy: %s (Severity: %s, Suggested probe question: %s)\n",
                        cc.getContradictionText(), cc.getSeverity(), cc.getSuggestedFollowup()));
            }
            sb.append("\n");
        }
        if (pendingCount > 0) {
            sb.append(String.format("Note: %d potential contradiction(s) are awaiting recruiter review and have not been confirmed.\n\n", pendingCount));
        }

        // 4. Retrieve Unasked Follow-ups
        List<CandidateFollowup> followups = candidateFollowupRepository.findByUserAndStatusOrderByPriorityDesc(user, "PENDING");
        if (!followups.isEmpty()) {
            sb.append("Stored Unasked Follow-up Questions (Weave these questions naturally if topics correlate):\n");
            int count = 0;
            for (CandidateFollowup cf : followups) {
                count++;
                sb.append(String.format("- [%s] Probe: %s\n", cf.getTopic(), cf.getQuestionText()));
                if (count >= 3) break;
            }
            sb.append("\n");
        }

        String rawContext = sb.toString();
        // Limit retrieval size to avoid prompt ballooning (e.g. max 2000 chars)
        if (rawContext.length() > 2000) {
            return rawContext.substring(0, 2000) + "\n[Context Truncated for token limit]";
        }
        return rawContext;
    }
}
