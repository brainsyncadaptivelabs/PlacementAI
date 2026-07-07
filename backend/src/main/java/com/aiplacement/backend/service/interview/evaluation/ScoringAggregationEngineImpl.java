package com.aiplacement.backend.service.interview.evaluation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ScoringAggregationEngineImpl implements ScoringAggregationEngine {

    private static final Map<String, Map<String, Double>> ROLE_WEIGHTS = new HashMap<>();

    static {
        // Junior / Entry-Level roles
        Map<String, Double> junior = new HashMap<>();
        junior.put("technical", 0.50);
        junior.put("communication", 0.10);
        junior.put("behavioral", 0.20);
        junior.put("leadership", 0.05);
        junior.put("learning", 0.15);
        ROLE_WEIGHTS.put("junior", junior);
        ROLE_WEIGHTS.put("intern", junior);
        ROLE_WEIGHTS.put("fresher", junior);
        ROLE_WEIGHTS.put("entry", junior);
        ROLE_WEIGHTS.put("associate", junior);

        // Senior Engineer
        Map<String, Double> senior = new HashMap<>();
        senior.put("technical", 0.35);
        senior.put("communication", 0.15);
        senior.put("behavioral", 0.20);
        senior.put("leadership", 0.15);
        senior.put("learning", 0.15);
        ROLE_WEIGHTS.put("senior", senior);
        ROLE_WEIGHTS.put("lead", senior);

        // Architect / Principal / Staff
        Map<String, Double> architect = new HashMap<>();
        architect.put("technical", 0.20);
        architect.put("communication", 0.15);
        architect.put("behavioral", 0.15);
        architect.put("leadership", 0.20);
        architect.put("architecture", 0.30);
        ROLE_WEIGHTS.put("architect", architect);
        ROLE_WEIGHTS.put("principal", architect);
        ROLE_WEIGHTS.put("staff", architect);
        ROLE_WEIGHTS.put("distinguished", architect);

        // Manager / Director
        Map<String, Double> manager = new HashMap<>();
        manager.put("technical", 0.15);
        manager.put("communication", 0.20);
        manager.put("behavioral", 0.20);
        manager.put("leadership", 0.30);
        manager.put("architecture", 0.15);
        ROLE_WEIGHTS.put("manager", manager);
        ROLE_WEIGHTS.put("director", manager);
    }

    @Override
    public Map<String, Object> aggregate(Map<String, Object> competencyScores, String role) {
        String roleKey = resolveRoleKey(role);
        Map<String, Double> weights = ROLE_WEIGHTS.getOrDefault(roleKey, ROLE_WEIGHTS.get("senior"));

        double technical = extractScore(competencyScores, "technicalScore");
        double communication = extractScore(competencyScores, "communicationScore");
        double behavioral = extractScore(competencyScores, "behavioralScore");
        double leadership = extractScore(competencyScores, "leadershipScore");
        double architecture = extractScore(competencyScores, "architectureScore");
        double reasoning = extractScore(competencyScores, "reasoningScore");
        double learning = (technical + reasoning) / 2.0; // proxy for learning velocity

        double weightedScore = 0.0;
        weightedScore += technical * weights.getOrDefault("technical", 0.35);
        weightedScore += communication * weights.getOrDefault("communication", 0.15);
        weightedScore += behavioral * weights.getOrDefault("behavioral", 0.20);
        weightedScore += leadership * weights.getOrDefault("leadership", 0.15);
        weightedScore += architecture * weights.getOrDefault("architecture", 0.0);
        weightedScore += learning * weights.getOrDefault("learning", 0.15);

        Map<String, Object> result = new HashMap<>(competencyScores);
        result.put("weightedOverallScore", Math.round(weightedScore * 10.0) / 10.0);
        result.put("roleKey", roleKey);
        result.put("appliedWeights", weights);
        result.put("technicalWeight", weights.getOrDefault("technical", 0.35));
        result.put("communicationWeight", weights.getOrDefault("communication", 0.15));
        result.put("behavioralWeight", weights.getOrDefault("behavioral", 0.20));
        result.put("leadershipWeight", weights.getOrDefault("leadership", 0.15));
        result.put("architectureWeight", weights.getOrDefault("architecture", 0.0));
        result.put("learningWeight", weights.getOrDefault("learning", 0.15));

        log.info("[EVAL] [AGGREGATION] Role: {}, Weighted score: {}", roleKey, result.get("weightedOverallScore"));
        return result;
    }

    private String resolveRoleKey(String role) {
        if (role == null) return "senior";
        String lower = role.toLowerCase();
        for (String key : ROLE_WEIGHTS.keySet()) {
            if (lower.contains(key)) return key;
        }
        return "senior";
    }

    private double extractScore(Map<String, Object> scores, String key) {
        Object val = scores.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        return 50.0; // neutral default
    }
}
