package com.aiplacement.backend.ai.intelligence;

import java.util.*;

public class AtsSalaryEngine {

    public static class SalaryResult {
        private final String minSalary;
        private final String maxSalary;
        private final String salaryExplanation;

        public SalaryResult(String minSalary, String maxSalary, String salaryExplanation) {
            this.minSalary = minSalary;
            this.maxSalary = maxSalary;
            this.salaryExplanation = salaryExplanation;
        }

        public String getMinSalary() { return minSalary; }
        public String getMaxSalary() { return maxSalary; }
        public String getSalaryExplanation() { return salaryExplanation; }
    }

    public static SalaryResult estimate(
            String domain,
            String experienceLevel,
            int yearsOfExp,
            List<String> skills,
            int projectCount,
            boolean hasTopCollege,
            boolean hasCertifications,
            String location
    ) {
        String normalizedDomain = domain == null ? "tech" : domain.toLowerCase();

        // 1. Determine base salary range (in Lakhs Per Annum - LPA)
        double baseMin = 3.0;
        double baseMax = 5.0;

        if (normalizedDomain.contains("market")) {
            // Marketing
            if (yearsOfExp >= 8 || "director".equalsIgnoreCase(experienceLevel) || "principal".equalsIgnoreCase(experienceLevel) || "manager".equalsIgnoreCase(experienceLevel)) {
                baseMin = 14.0; baseMax = 25.0;
            } else if (yearsOfExp >= 5 || "senior".equalsIgnoreCase(experienceLevel) || "lead".equalsIgnoreCase(experienceLevel)) {
                baseMin = 10.0; baseMax = 15.0;
            } else if (yearsOfExp >= 2 || "midlevel".equalsIgnoreCase(experienceLevel) || "mid".equalsIgnoreCase(experienceLevel)) {
                baseMin = 6.0; baseMax = 10.0;
            } else if ("junior".equalsIgnoreCase(experienceLevel)) {
                baseMin = 4.0; baseMax = 6.0;
            } else {
                baseMin = 3.0; baseMax = 4.5;
            }
        } else if (normalizedDomain.contains("finance") || normalizedDomain.contains("account")) {
            // Finance
            if (yearsOfExp >= 8 || "director".equalsIgnoreCase(experienceLevel) || "principal".equalsIgnoreCase(experienceLevel) || "manager".equalsIgnoreCase(experienceLevel)) {
                baseMin = 18.0; baseMax = 32.0;
            } else if (yearsOfExp >= 5 || "senior".equalsIgnoreCase(experienceLevel) || "lead".equalsIgnoreCase(experienceLevel)) {
                baseMin = 12.0; baseMax = 19.0;
            } else if (yearsOfExp >= 2 || "midlevel".equalsIgnoreCase(experienceLevel) || "mid".equalsIgnoreCase(experienceLevel)) {
                baseMin = 8.0; baseMax = 13.0;
            } else if ("junior".equalsIgnoreCase(experienceLevel)) {
                baseMin = 5.0; baseMax = 8.0;
            } else {
                baseMin = 3.5; baseMax = 5.5;
            }
        } else if (normalizedDomain.contains("hr") || normalizedDomain.contains("recruit") || normalizedDomain.contains("human")) {
            // HR
            if (yearsOfExp >= 8 || "director".equalsIgnoreCase(experienceLevel) || "principal".equalsIgnoreCase(experienceLevel) || "manager".equalsIgnoreCase(experienceLevel)) {
                baseMin = 11.0; baseMax = 20.0;
            } else if (yearsOfExp >= 5 || "senior".equalsIgnoreCase(experienceLevel) || "lead".equalsIgnoreCase(experienceLevel)) {
                baseMin = 8.0; baseMax = 12.5;
            } else if (yearsOfExp >= 2 || "midlevel".equalsIgnoreCase(experienceLevel) || "mid".equalsIgnoreCase(experienceLevel)) {
                baseMin = 5.0; baseMax = 8.5;
            } else if ("junior".equalsIgnoreCase(experienceLevel)) {
                baseMin = 3.5; baseMax = 5.5;
            } else {
                baseMin = 2.8; baseMax = 4.0;
            }
        } else {
            // Tech/Software Engineering (Default)
            if (yearsOfExp >= 8 || "director".equalsIgnoreCase(experienceLevel) || "principal".equalsIgnoreCase(experienceLevel)) {
                baseMin = 32.0; baseMax = 55.0;
            } else if (yearsOfExp >= 5 || "lead".equalsIgnoreCase(experienceLevel) || "architect".equalsIgnoreCase(experienceLevel) || "manager".equalsIgnoreCase(experienceLevel)) {
                baseMin = 22.0; baseMax = 35.0;
            } else if (yearsOfExp >= 3 || "senior".equalsIgnoreCase(experienceLevel)) {
                baseMin = 15.0; baseMax = 24.0;
            } else if (yearsOfExp >= 1 || "midlevel".equalsIgnoreCase(experienceLevel) || "mid".equalsIgnoreCase(experienceLevel) || "junior".equalsIgnoreCase(experienceLevel)) {
                baseMin = 8.0; baseMax = 14.0;
            } else if ("intern".equalsIgnoreCase(experienceLevel)) {
                baseMin = 3.0; baseMax = 5.0;
            } else {
                baseMin = 4.5; baseMax = 7.5;
            }
        }

        // 2. Multipliers
        double multiplier = 1.0;
        if (hasTopCollege) multiplier += 0.15; // Tier 1 College premium
        if (skills != null && skills.size() > 8) multiplier += 0.08; // High tech capability
        if (hasCertifications) multiplier += 0.04;
        if (projectCount >= 3) multiplier += 0.03;

        // Regional adjustments
        String locClean = location == null ? "" : location.toLowerCase();
        if (locClean.contains("bangalore") || locClean.contains("bengaluru") || locClean.contains("mumbai") || locClean.contains("sf") || locClean.contains("bay area")) {
            multiplier += 0.10; // High living-cost hub
        }

        double finalMin = baseMin * multiplier;
        double finalMax = baseMax * multiplier;

        String formattedMin = String.format(Locale.US, "%.1f LPA", finalMin);
        String formattedMax = String.format(Locale.US, "%.1f LPA", finalMax);

        // Explanation formulation
        StringBuilder explanation = new StringBuilder();
        explanation.append("Estimated salary band calculated deterministically based on ").append(experienceLevel).append(" experience level ");
        if (yearsOfExp > 0) explanation.append("(").append(yearsOfExp).append(" years) ");
        explanation.append("in the ").append(domain != null ? domain : "Software Engineering").append(" industry. ");
        if (hasTopCollege) {
            explanation.append("Includes premium adjustment for a tier-1 university degree. ");
        }
        if (skills != null && skills.size() > 8) {
            explanation.append("Positioned at the higher quartile due to high skill match ratio. ");
        }
        if (locClean.contains("bangalore") || locClean.contains("bengaluru") || locClean.contains("mumbai")) {
            explanation.append("Adjusted for top-tier metropolitan tech hiring hub rates.");
        }

        return new SalaryResult(formattedMin, formattedMax, explanation.toString());
    }
}
