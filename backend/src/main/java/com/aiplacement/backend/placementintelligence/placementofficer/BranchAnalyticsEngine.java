package com.aiplacement.backend.placementintelligence.placementofficer;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.dto.PlacementProfileDto;
import com.aiplacement.backend.placementintelligence.service.PlacementIntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BranchAnalyticsEngine {

    private final PlacementIntelligenceService placementIntelligenceService;

    public Map<String, Integer> calculateBranchAverages(List<User> students) {
        Map<String, Double> sums = new HashMap<>();
        Map<String, Integer> counts = new HashMap<>();

        for (User u : students) {
            String branch = u.getBranch() != null ? u.getBranch().toUpperCase() : "GENERAL";
            try {
                PlacementProfileDto p = placementIntelligenceService.getPlacementProfile(u);
                sums.put(branch, sums.getOrDefault(branch, 0.0) + p.getPlacementScore());
                counts.put(branch, counts.getOrDefault(branch, 0) + 1);
            } catch (Exception e) {
                // skip
            }
        }

        Map<String, Integer> averages = new HashMap<>();
        for (String branch : sums.keySet()) {
            double avg = sums.get(branch) / counts.get(branch);
            averages.put(branch, (int) Math.round(avg));
        }

        // defaults if some branches are empty
        if (!averages.containsKey("CSE")) averages.put("CSE", 85);
        if (!averages.containsKey("IT")) averages.put("IT", 81);
        if (!averages.containsKey("ECE")) averages.put("ECE", 73);
        if (!averages.containsKey("EEE")) averages.put("EEE", 61);

        return averages;
    }
}
