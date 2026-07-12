package com.aiplacement.backend.ai.intelligence;

import java.util.*;

public class AtsReadinessEngine {

    public static Map<String, Integer> calculate(
            String domain,
            int atsScore,
            List<String> skills,
            int projectCount,
            int yearsOfExp,
            boolean hasDegree,
            boolean hasTopCollege,
            boolean hasMetrics,
            boolean hasCompetitiveCoding,
            boolean hasCertification
    ) {
        Map<String, Integer> readiness = new LinkedHashMap<>();
        String normalizedDomain = domain == null ? "tech" : domain.toLowerCase();

        // Count of cloud skills for calculations
        long cloudSkillsCount = skills.stream()
                .filter(s -> Arrays.asList("aws", "gcp", "azure", "docker", "kubernetes", "terraform").contains(s.toLowerCase()))
                .count();

        // Count of database skills
        long dbSkillsCount = skills.stream()
                .filter(s -> Arrays.asList("sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch").contains(s.toLowerCase()))
                .count();

        if (normalizedDomain.contains("backend")) {
            int startup = Math.min(95, Math.round(projectCount * 8 + skills.size() * 3 + (hasCompetitiveCoding ? 15 : 0) + (hasMetrics ? 10 : 0) + 15));
            int enterprise = Math.min(95, Math.round(yearsOfExp * 5 + (hasDegree ? 20 : 0) + (dbSkillsCount * 6) + atsScore * 0.4f + 10));
            int product = Math.min(95, Math.round(atsScore * 0.5f + (hasTopCollege ? 15 : 0) + (hasMetrics ? 12 : 0) + projectCount * 4 + 10));
            int cloud = Math.min(95, Math.round(cloudSkillsCount * 12 + (hasCertification ? 15 : 0) + atsScore * 0.3f + 15));

            readiness.put("Startup Readiness", Math.max(30, startup));
            readiness.put("Enterprise Readiness", Math.max(30, enterprise));
            readiness.put("Product Company Readiness", Math.max(30, product));
            readiness.put("Cloud Readiness", Math.max(30, cloud));

        } else if (normalizedDomain.contains("frontend")) {
            int uiux = Math.min(95, Math.round(projectCount * 8 + skills.size() * 4 + (skills.contains("Tailwind") ? 10 : 5) + 20));
            int components = Math.min(95, Math.round(skills.size() * 5 + projectCount * 6 + (hasMetrics ? 10 : 0) + 25));
            int performance = Math.min(95, Math.round(atsScore * 0.4f + skills.size() * 3 + (hasMetrics ? 15 : 0) + 20));
            int responsive = Math.min(95, Math.round(projectCount * 10 + (hasDegree ? 10 : 0) + atsScore * 0.3f + 30));

            readiness.put("UI/UX Alignment", Math.max(30, uiux));
            readiness.put("Component Library Readiness", Math.max(30, components));
            readiness.put("Performance Readiness", Math.max(30, performance));
            readiness.put("Responsive Design Readiness", Math.max(30, responsive));

        } else if (normalizedDomain.contains("market")) {
            long seoSkills = skills.stream().filter(s -> Arrays.asList("seo", "ahrefs", "semrush", "keywords", "content").contains(s.toLowerCase())).count();
            long paidAds = skills.stream().filter(s -> Arrays.asList("google ads", "meta ads", "ppc", "sem", "ads manager").contains(s.toLowerCase())).count();

            int seo = Math.min(95, Math.round(seoSkills * 18 + (hasMetrics ? 15 : 0) + projectCount * 6 + 20));
            int performanceMktg = Math.min(95, Math.round(paidAds * 20 + (hasMetrics ? 20 : 0) + atsScore * 0.3f + 15));
            int brand = Math.min(95, Math.round(projectCount * 10 + (hasDegree ? 15 : 0) + skills.size() * 4 + 25));

            readiness.put("SEO Readiness", Math.max(30, seo));
            readiness.put("Performance Marketing Readiness", Math.max(30, performanceMktg));
            readiness.put("Brand Marketing Readiness", Math.max(30, brand));

        } else if (normalizedDomain.contains("finance") || normalizedDomain.contains("account")) {
            int corporate = Math.min(95, Math.round(yearsOfExp * 6 + (hasDegree ? 20 : 0) + (hasMetrics ? 12 : 0) + atsScore * 0.3f + 15));
            int investment = Math.min(95, Math.round((hasTopCollege ? 20 : 0) + (hasCertification ? 15 : 0) + atsScore * 0.4f + projectCount * 6 + 10));
            int risk = Math.min(95, Math.round(skills.size() * 6 + (hasMetrics ? 15 : 0) + yearsOfExp * 4 + 25));

            readiness.put("Corporate Finance Readiness", Math.max(30, corporate));
            readiness.put("Investment Readiness", Math.max(30, investment));
            readiness.put("Risk Analysis Readiness", Math.max(30, risk));

        } else if (normalizedDomain.contains("hr") || normalizedDomain.contains("recruit") || normalizedDomain.contains("human")) {
            int talent = Math.min(95, Math.round(yearsOfExp * 6 + skills.size() * 5 + (hasMetrics ? 10 : 0) + 30));
            int operations = Math.min(95, Math.round((hasDegree ? 20 : 0) + projectCount * 10 + atsScore * 0.3f + 25));
            int compBenefits = Math.min(95, Math.round(skills.size() * 6 + (hasCertification ? 15 : 0) + yearsOfExp * 4 + 20));

            readiness.put("Talent Acquisition Readiness", Math.max(30, talent));
            readiness.put("Operations Readiness", Math.max(30, operations));
            readiness.put("Compensation & Benefits Readiness", Math.max(30, compBenefits));

        } else {
            // General business / default
            int startup = Math.min(95, Math.round(projectCount * 10 + skills.size() * 4 + 20));
            int enterprise = Math.min(95, Math.round(yearsOfExp * 6 + (hasDegree ? 25 : 0) + atsScore * 0.3f + 15));
            int operations = Math.min(95, Math.round(atsScore * 0.5f + projectCount * 6 + 15));

            readiness.put("Startup Readiness", Math.max(30, startup));
            readiness.put("Enterprise Readiness", Math.max(30, enterprise));
            readiness.put("Operations Readiness", Math.max(30, operations));
        }

        return readiness;
    }
}
