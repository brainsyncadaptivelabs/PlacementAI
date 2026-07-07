package com.aiplacement.backend.controller.memory;

import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.memory.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/memory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CandidateMemoryController {

    private final UserRepository userRepository;
    private final CandidateSkillConfidenceRepository skillConfidenceRepository;
    private final CandidateProjectKnowledgeRepository projectKnowledgeRepository;
    private final CandidateContradictionRepository contradictionRepository;
    private final CandidateLearningProgressRepository learningProgressRepository;
    private final CandidateVerifiedResumeRepository verifiedResumeRepository;
    private final KnowledgeGraphNodeRepository nodeRepository;
    private final KnowledgeGraphEdgeRepository edgeRepository;

    @GetMapping("/candidate/{userId}/graph")
    public ResponseEntity<Map<String, Object>> getKnowledgeGraph(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        List<KnowledgeGraphNode> nodes = nodeRepository.findByUser(user);
        List<KnowledgeGraphEdge> edges = edgeRepository.findByUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("nodes", nodes);
        response.put("edges", edges);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/candidate/{userId}/skills")
    public ResponseEntity<List<CandidateSkillConfidence>> getSkillConfidence(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        return ResponseEntity.ok(skillConfidenceRepository.findByUser(user));
    }

    @GetMapping("/candidate/{userId}/contradictions")
    public ResponseEntity<List<CandidateContradiction>> getContradictions(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        return ResponseEntity.ok(contradictionRepository.findByUser(user));
    }

    @GetMapping("/candidate/{userId}/progress")
    public ResponseEntity<List<CandidateLearningProgress>> getLearningProgress(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        return ResponseEntity.ok(learningProgressRepository.findByUserOrderByInterviewDateAsc(user));
    }

    @GetMapping("/candidate/{userId}/profile")
    public ResponseEntity<Map<String, Object>> getCandidateStructuredProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        List<CandidateVerifiedResume> verifiedClaims = verifiedResumeRepository.findByUser(user);
        List<CandidateProjectKnowledge> projects = projectKnowledgeRepository.findByUser(user);
        List<CandidateSkillConfidence> skills = skillConfidenceRepository.findByUser(user);
        List<CandidateContradiction> contradictions = contradictionRepository.findByUser(user);

        // Compute scores dynamically
        double resumeTrustScore = 100.0;
        int riskCount = 0;
        for (CandidateVerifiedResume claim : verifiedClaims) {
            if ("CONTRADICTED".equalsIgnoreCase(claim.getStatus())) {
                resumeTrustScore -= 15.0;
                riskCount += 2;
            } else if ("CLAIMED".equalsIgnoreCase(claim.getStatus())) {
                resumeTrustScore -= 5.0;
            }
        }
        for (CandidateContradiction contradiction : contradictions) {
            if ("HIGH".equalsIgnoreCase(contradiction.getSeverity())) {
                resumeTrustScore -= 20.0;
                riskCount += 3;
            } else {
                resumeTrustScore -= 10.0;
                riskCount += 1;
            }
        }
        resumeTrustScore = Math.max(10.0, Math.min(100.0, resumeTrustScore));

        String resumeRiskScore = riskCount >= 5 ? "HIGH" : (riskCount >= 2 ? "MEDIUM" : "LOW");

        double hiringConfidence = 70.0;
        if (!skills.isEmpty()) {
            double avgConfidence = skills.stream().mapToDouble(s -> s.getConfidence() != null ? s.getConfidence() : 0.0).average().orElse(70.0);
            hiringConfidence = (avgConfidence * 0.7) + (resumeTrustScore * 0.3);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("fullName", user.getFullName());
        response.put("resumeTrustScore", resumeTrustScore);
        response.put("resumeRiskScore", resumeRiskScore);
        response.put("hiringConfidence", hiringConfidence);
        response.put("verifiedClaims", verifiedClaims);
        response.put("projectConfidence", projects);
        response.put("skillConfidence", skills);
        response.put("contradictions", contradictions);

        return ResponseEntity.ok(response);
    }
}
