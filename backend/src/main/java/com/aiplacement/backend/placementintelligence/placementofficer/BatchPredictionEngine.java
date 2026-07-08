package com.aiplacement.backend.placementintelligence.placementofficer;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class BatchPredictionEngine {

    public Map<String, Object> forecastPlacements(int totalStudents, int averagePlacementScore) {
        Map<String, Object> forecast = new HashMap<>();

        int expectedPlacements = (int) Math.round(totalStudents * (averagePlacementScore / 100.0) * 0.95);
        int expectedOffers = (int) Math.round(expectedPlacements * 1.2);
        String highestPackage = averagePlacementScore >= 80 ? "32 LPA" : "15 LPA";
        String averagePackage = averagePlacementScore >= 80 ? "8.5 LPA" : "5.4 LPA";
        int offerConversion = Math.max(50, Math.min(99, averagePlacementScore + 10));

        forecast.put("expectedPlacements", expectedPlacements);
        forecast.put("expectedOffers", expectedOffers);
        forecast.put("expectedHighestPackage", highestPackage);
        forecast.put("averagePackage", averagePackage);
        forecast.put("offerConversionRate", offerConversion);
        forecast.put("readinessGrowth", "+12% this month");

        return forecast;
    }
}
