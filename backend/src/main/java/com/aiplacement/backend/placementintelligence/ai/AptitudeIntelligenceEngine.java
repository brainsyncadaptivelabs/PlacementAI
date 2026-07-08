package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AptitudeIntelligenceEngine {

    public AptitudeMetrics analyzeAptitude(PlacementContext context) {
        String data = context.getAptitudeData();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        Map<String, String> heatmap = new HashMap<>();

        int score = 75; // default benchmark
        if (data != null && !data.trim().isEmpty() && !"{}".equals(data.trim())) {
            try {
                JSONObject obj = new JSONObject(data);
                if (obj.has("score")) score = obj.getInt("score");
                else if (obj.has("overallScore")) score = obj.getInt("overallScore");

                if (obj.has("quantitative")) {
                    int q = obj.getInt("quantitative");
                    heatmap.put("Quantitative", String.valueOf(q));
                    if (q >= 80) strengths.add("Strong mathematical and quantitative skills.");
                    else weaknesses.add("Needs improvement in quantitative speed drills.");
                }
                if (obj.has("logical")) {
                    int l = obj.getInt("logical");
                    heatmap.put("Logical", String.valueOf(l));
                    if (l >= 80) strengths.add("Excellent logical deduction speed.");
                    else weaknesses.add("Struggles with advanced logical puzzle patterns.");
                }
            } catch (Exception e) {
                // fallbacks
            }
        }

        if (heatmap.isEmpty()) {
            heatmap.put("Quantitative", "75");
            heatmap.put("Logical", "70");
            heatmap.put("Verbal", "80");
        }

        return AptitudeMetrics.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .aptitudeScore(score)
                .heatmap(heatmap)
                .topicMastery(score >= 80 ? "EXCELLENT" : score >= 60 ? "ADEQUATE" : "POOR")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class AptitudeMetrics {
        List<String> strengths;
        List<String> weaknesses;
        int aptitudeScore;
        Map<String, String> heatmap;
        String topicMastery;
    }
}
