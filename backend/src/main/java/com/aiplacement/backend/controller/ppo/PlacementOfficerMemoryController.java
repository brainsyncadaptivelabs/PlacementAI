package com.aiplacement.backend.controller.ppo;

import com.aiplacement.backend.entity.CandidateSkillConfidence;
import com.aiplacement.backend.entity.CandidateLearningProgress;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.memory.CandidateSkillConfidenceRepository;
import com.aiplacement.backend.repository.memory.CandidateLearningProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/placement-officers/memory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PlacementOfficerMemoryController {

    private final UserRepository userRepository;
    private final CandidateSkillConfidenceRepository skillConfidenceRepository;
    private final CandidateLearningProgressRepository learningProgressRepository;

    @GetMapping("/cohort/metrics")
    @org.springframework.cache.annotation.Cacheable(value = "dashboard_stats", key = "'cohort_metrics'")
    public ResponseEntity<Map<String, Object>> getCohortMetrics() {
        List<CandidateSkillConfidence> allSkillConfs = skillConfidenceRepository.findAll();
        List<CandidateLearningProgress> allProgress = learningProgressRepository.findAll();

        // 1. Department Skill Heatmaps
        Map<String, Map<String, Double>> deptHeatmap = new HashMap<>();
        // 2. University Skill Trends
        Map<String, List<Double>> skillTrends = new HashMap<>();
        // 3. Common Weak Areas
        Map<String, Integer> weakAreas = new HashMap<>();

        for (CandidateSkillConfidence sc : allSkillConfs) {
            User student = sc.getUser();
            String department = (student != null && student.getBranch() != null) ? student.getBranch() : "General";
            
            deptHeatmap.computeIfAbsent(department, k -> new HashMap<>());
            deptHeatmap.get(department).put(sc.getSkill(), sc.getConfidence());

            skillTrends.computeIfAbsent(sc.getSkill(), k -> new ArrayList<>());
            skillTrends.get(sc.getSkill()).add(sc.getConfidence());

            if (sc.getConfidence() < 60.0) {
                weakAreas.put(sc.getSkill(), weakAreas.getOrDefault(sc.getSkill(), 0) + 1);
            }
        }

        // Compute averages for university trends
        Map<String, Double> universityTrends = new HashMap<>();
        skillTrends.forEach((skill, confList) -> {
            double avg = confList.stream().mapToDouble(d -> d != null ? d : 0.0).average().orElse(0.0);
            universityTrends.put(skill, avg);
        });

        // 4. Average Learning Velocity
        double avgLearningVelocity = 0.0;
        if (!allProgress.isEmpty()) {
            avgLearningVelocity = allProgress.stream()
                    .mapToDouble(p -> p.getImprovement() != null ? p.getImprovement() : 0.0)
                    .average()
                    .orElse(5.0);
        }

        // 5. Training Impact (Improvement vs Regression ratio)
        double improvementSum = allProgress.stream().mapToDouble(p -> p.getImprovement() != null ? p.getImprovement() : 0.0).sum();
        double regressionSum = allProgress.stream().mapToDouble(p -> p.getRegression() != null ? p.getRegression() : 0.0).sum();
        double trainingImpactRatio = (improvementSum + regressionSum) > 0 ? (improvementSum / (regressionSum + improvementSum)) * 100 : 100.0;

        // 6. Placement Readiness (Percentage of candidates with high confidence)
        long totalStudents = userRepository.countByRole(com.aiplacement.backend.entity.Role.STUDENT);
        long readyCount = userRepository.countReadyStudents(75);
        double placementReadinessRate = totalStudents > 0 ? ((double) readyCount / totalStudents) * 100 : 80.0;

        Map<String, Object> response = new HashMap<>();
        response.put("departmentSkillHeatmap", deptHeatmap);
        response.put("commonWeakAreas", weakAreas);
        response.put("averageLearningVelocity", avgLearningVelocity);
        response.put("trainingImpact", trainingImpactRatio);
        response.put("universitySkillTrends", universityTrends);
        response.put("placementReadiness", placementReadinessRate);

        return ResponseEntity.ok(response);
    }
}
