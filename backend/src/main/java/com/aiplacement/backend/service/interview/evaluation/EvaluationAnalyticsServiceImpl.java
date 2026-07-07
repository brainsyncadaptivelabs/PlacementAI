package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.evaluation.*;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationAnalyticsServiceImpl implements EvaluationAnalyticsService {

    private final UserRepository userRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewCompetencyScoreRepository competencyScoreRepository;
    private final InterviewHiringDecisionRepository hiringDecisionRepository;
    private final InterviewSkillGapRepository skillGapRepository;
    private final MockInterviewRepository mockInterviewRepository;
    private final com.aiplacement.backend.repository.interview.SystemDesignEvaluationRepository systemDesignEvaluationRepository;
    private final com.aiplacement.backend.repository.interview.SystemDesignDiagramRepository systemDesignDiagramRepository;

    @Override
    public Map<String, Object> getCandidateAnalytics(Long userId) {
        com.aiplacement.backend.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<MockInterview> interviews = mockInterviewRepository.findByUserOrderByCreatedAtDesc(user);
        List<InterviewEvaluation> evals = interviews.stream()
                .map(i -> evaluationRepository.findByMockInterview(i).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (evals.isEmpty()) {
            return Map.of("message", "No evaluations found for this candidate");
        }

        // Average scores across all evaluations
        double avgOverall = evals.stream().mapToDouble(e -> e.getOverallScore() != null ? e.getOverallScore() : 0).average().orElse(0);
        double avgConfidence = evals.stream().mapToDouble(e -> e.getConfidence() != null ? e.getConfidence() : 0).average().orElse(0);

        // Latest hiring decision
        Optional<InterviewHiringDecision> latestDecision = evals.stream()
                .findFirst()
                .flatMap(e -> hiringDecisionRepository.findByEvaluation(e));

        // Competency averages
        Map<String, Double> competencyAverages = new LinkedHashMap<>();
        evals.forEach(ev -> competencyScoreRepository.findByEvaluation(ev).forEach(cs -> {
            competencyAverages.merge(cs.getCompetency(), cs.getScore() != null ? cs.getScore() : 0,
                    (a, b) -> (a + b) / 2.0);
        }));

        // Skill gaps
        List<Map<String, Object>> gaps = evals.stream()
                .flatMap(ev -> skillGapRepository.findByEvaluation(ev).stream())
                .map(sg -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("skill", sg.getSkill());
                    m.put("gap", sg.getGap());
                    m.put("priority", sg.getPriority());
                    m.put("estimatedTime", sg.getEstimatedImprovementTime());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", userId);
        result.put("totalEvaluations", evals.size());
        result.put("averageScore", Math.round(avgOverall * 10.0) / 10.0);
        result.put("averageConfidence", Math.round(avgConfidence * 10.0) / 10.0);
        result.put("latestDecision", latestDecision.map(d -> d.getDecision()).orElse("Pending"));
        result.put("latestRecommendedLevel", latestDecision.map(d -> d.getRecommendedLevel()).orElse("Unknown"));
        result.put("competencyAverages", competencyAverages);
        result.put("skillGaps", gaps);

        log.info("[EVAL] [ANALYTICS] Retrieved candidate analytics for user: {}", userId);
        return result;
    }

    @Override
    public Map<String, Object> getCohortAnalytics(String department) {
        List<com.aiplacement.backend.entity.User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.aiplacement.backend.entity.Role.STUDENT)
                .filter(u -> department == null || department.equalsIgnoreCase(u.getBranch()))
                .collect(Collectors.toList());

        List<InterviewEvaluation> allEvals = students.stream()
                .flatMap(u -> mockInterviewRepository.findByUserOrderByCreatedAtDesc(u).stream())
                .map(i -> evaluationRepository.findByMockInterview(i).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (allEvals.isEmpty()) {
            return Map.of("department", department, "message", "No evaluations found");
        }

        double avgScore = allEvals.stream()
                .mapToDouble(e -> e.getOverallScore() != null ? e.getOverallScore() : 0).average().orElse(0);

        // Competency heatmap
        Map<String, Double> competencyHeatmap = new LinkedHashMap<>();
        allEvals.forEach(ev -> competencyScoreRepository.findByEvaluation(ev).forEach(cs ->
                competencyHeatmap.merge(cs.getCompetency(), cs.getScore() != null ? cs.getScore() : 0,
                        (a, b) -> (a + b) / 2.0)));

        // Hiring decision distribution
        Map<String, Long> decisionDistribution = allEvals.stream()
                .map(ev -> hiringDecisionRepository.findByEvaluation(ev).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(d -> d.getDecision(), Collectors.counting()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("department", department);
        result.put("studentCount", students.size());
        result.put("totalEvaluations", allEvals.size());
        result.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
        result.put("competencyHeatmap", competencyHeatmap);
        result.put("hiringDecisionDistribution", decisionDistribution);

        // Fetch System Design evaluations for students in this cohort
        List<com.aiplacement.backend.entity.interview.SystemDesignEvaluation> sdeList = allEvals.stream()
                .flatMap(ev -> mockInterviewRepository.findByUserOrderByCreatedAtDesc(ev.getMockInterview().getUser()).stream())
                .flatMap(mi -> mi.getQuestions().stream())
                .flatMap(q -> systemDesignEvaluationRepository.findBySystemDesignDiagram(
                        diagramRepositoryFind(q)).stream())
                .toList();

        double archReadiness = sdeList.stream()
                .mapToDouble(sde -> sde.getOverallScore() != null ? sde.getOverallScore() : 0.0)
                .average().orElse(70.0);
        result.put("departmentArchitectureReadiness", Math.round(archReadiness * 10.0) / 10.0);

        // Weak Concepts (lowest average dimension scores)
        Map<String, Double> dimSum = new HashMap<>();
        Map<String, Integer> dimCount = new HashMap<>();
        for (var sde : sdeList) {
            accumulate(dimSum, dimCount, "Requirements Gathering", sde.getRequirementsScore());
            accumulate(dimSum, dimCount, "API Design", sde.getApiDesignScore());
            accumulate(dimSum, dimCount, "Database Design", sde.getDatabaseDesignScore());
            accumulate(dimSum, dimCount, "Scalability", sde.getScalabilityScore());
            accumulate(dimSum, dimCount, "Caching Strategy", sde.getCachingScore());
            accumulate(dimSum, dimCount, "Load Balancing", sde.getLoadBalancingScore());
            accumulate(dimSum, dimCount, "Message Queuing", sde.getMessageQueuesScore());
            accumulate(dimSum, dimCount, "Security Architecture", sde.getSecurityScore());
            accumulate(dimSum, dimCount, "Monitoring & Observability", sde.getMonitoringScore());
            accumulate(dimSum, dimCount, "Disaster Recovery", sde.getDisasterRecoveryScore());
        }

        List<String> weakConcepts = dimSum.entrySet().stream()
                .map(e -> Map.entry(e.getKey(), e.getValue() / dimCount.get(e.getKey())))
                .sorted(Map.Entry.comparingByValue())
                .limit(3)
                .map(e -> e.getKey())
                .toList();
        if (weakConcepts.isEmpty()) {
            weakConcepts = List.of("Disaster Recovery", "Security Architecture", "Monitoring & Observability");
        }
        result.put("weakArchitectureConcepts", weakConcepts);

        // Training Recommendations matching weak concepts
        List<String> recommendations = new ArrayList<>();
        for (String concept : weakConcepts) {
            switch (concept) {
                case "Disaster Recovery" -> recommendations.add("Organize design drills for multi-region replication and active-passive failover strategies.");
                case "Security Architecture" -> recommendations.add("Deliver workshop on OAuth2, TLS termination, and encryption-at-rest models.");
                case "Monitoring & Observability" -> recommendations.add("Introduce candidates to Prometheus metric collection, alert managers, and tracing tools (Jaeger).");
                case "Database Design" -> recommendations.add("Conduct deep dives on database sharding key selections and NoSQL scaling architectures.");
                case "Caching Strategy" -> recommendations.add("Deliver a session on cache eviction protocols (LRU/LFU) and Redis cluster configurations.");
                default -> recommendations.add("Focus mock system design sessions specifically on: " + concept);
            }
        }
        result.put("architectureTrainingRecommendations", recommendations);

        log.info("[EVAL] [ANALYTICS] Retrieved cohort analytics for department: {}, {} evaluations", department, allEvals.size());
        return result;
    }

    private void accumulate(Map<String, Double> sum, Map<String, Integer> count, String key, Double val) {
        if (val == null) return;
        sum.merge(key, val, (a, b) -> a + b);
        count.merge(key, 1, (a, b) -> a + b);
    }

    private com.aiplacement.backend.entity.interview.SystemDesignDiagram diagramRepositoryFind(com.aiplacement.backend.entity.interview.InterviewQuestion question) {
        return systemDesignDiagramRepository.findByInterviewQuestion(question).orElse(null);
    }
}
