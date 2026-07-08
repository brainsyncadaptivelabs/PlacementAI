package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.recruiter.CandidateRankingEngine.RankedCandidate;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/recruiter-intelligence", "/api/recruiter-intelligence"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecruiterIntelligenceController {

    private final RecruiterDashboardService dashboardService;
    private final CandidateRankingEngine rankingEngine;
    private final ShortlistEngine shortlistEngine;
    private final HiringInsightsEngine insightsEngine;
    private final UserRepository userRepository;

    private List<User> getStudents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.aiplacement.backend.entity.Role.STUDENT)
                .collect(Collectors.toList());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(dashboardService.getRecruiterDashboardData());
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankedCandidate>> getRanking() {
        List<User> students = getStudents();
        return ResponseEntity.ok(rankingEngine.rankCandidates(students));
    }

    @GetMapping("/shortlist")
    public ResponseEntity<List<ShortlistEngine.ShortlistResult>> getShortlist() {
        List<User> students = getStudents();
        List<RankedCandidate> ranked = rankingEngine.rankCandidates(students);
        return ResponseEntity.ok(ranked.stream()
                .map(shortlistEngine::evaluateCandidate)
                .collect(Collectors.toList()));
    }

    @GetMapping("/insights")
    public ResponseEntity<List<HiringInsightsEngine.HiringInsights>> getInsights() {
        List<User> students = getStudents();
        List<RankedCandidate> ranked = rankingEngine.rankCandidates(students);
        return ResponseEntity.ok(ranked.stream()
                .map(insightsEngine::generateInsights)
                .collect(Collectors.toList()));
    }

    @GetMapping("/compare")
    public ResponseEntity<Map<String, Object>> compareCandidates(
            @RequestParam("a") Long idA,
            @RequestParam("b") Long idB) {

        User userA = userRepository.findById(idA).orElse(null);
        User userB = userRepository.findById(idB).orElse(null);

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("candidateA", userA != null ? userA.getFullName() : "N/A");
        comparison.put("candidateB", userB != null ? userB.getFullName() : "N/A");
        comparison.put("skillsA", userA != null ? userA.getSkills() : "");
        comparison.put("skillsB", userB != null ? userB.getSkills() : "");
        comparison.put("roleA", userA != null ? userA.getDesignation() : "");
        comparison.put("roleB", userB != null ? userB.getDesignation() : "");

        return ResponseEntity.ok(comparison);
    }
}
