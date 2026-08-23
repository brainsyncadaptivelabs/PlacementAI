package com.aiplacement.backend.service.payment;

import lombok.Getter;

import java.util.*;

public class CustomPlanCatalog {

    @Getter
    public static class FeaturePackDef {
        private final String key;
        private final String name;
        private final String description;
        private final int priceInInr;
        private final double credits;
        private final String unit;

        public FeaturePackDef(String key, String name, String description, int priceInInr, double credits, String unit) {
            this.key = key;
            this.name = name;
            this.description = description;
            this.priceInInr = priceInInr;
            this.credits = credits;
            this.unit = unit;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("key", key);
            map.put("name", name);
            map.put("description", description);
            map.put("priceInInr", priceInInr);
            map.put("credits", credits);
            map.put("unit", unit);
            return map;
        }
    }

    private static final Map<String, FeaturePackDef> CATALOG = new LinkedHashMap<>();

    static {
        CATALOG.put("ATS_ANALYSIS", new FeaturePackDef("ATS_ANALYSIS", "ATS Analysis", "Optimize your resume for applicant tracking systems.", 19, 10, "analyses"));
        CATALOG.put("JD_MATCH", new FeaturePackDef("JD_MATCH", "JD Match", "Match your resume against target job descriptions.", 29, 10, "matches"));
        CATALOG.put("SKILL_GAP", new FeaturePackDef("SKILL_GAP", "Skill Gap Analysis", "Identify missing skills & course recommendations.", 39, 5, "analyses"));
        CATALOG.put("RESUME_COMPARE", new FeaturePackDef("RESUME_COMPARE", "Resume Compare", "Compare two resumes side-by-side with AI analysis.", 29, 10, "comparisons"));
        CATALOG.put("AI_CHAT", new FeaturePackDef("AI_CHAT", "AI Career Chat", "Interactive AI mentor support for placement queries.", 29, 100, "messages"));
        CATALOG.put("ENGLISH_PRACTICE", new FeaturePackDef("ENGLISH_PRACTICE", "English Practice", "AI-driven fluency and pronunciation practice.", 49, 60, "minutes"));
        CATALOG.put("MOCK_INTERVIEW", new FeaturePackDef("MOCK_INTERVIEW", "AI Mock Interview", "Realistic AI voice & technical interview sessions.", 79, 30, "minutes"));
        CATALOG.put("CODING_AI_REVIEW", new FeaturePackDef("CODING_AI_REVIEW", "Coding AI Review", "Automated code quality & complexity feedback.", 39, 20, "reviews"));
        CATALOG.put("RESUME_TAILORING", new FeaturePackDef("RESUME_TAILORING", "Resume Tailoring", "AI resume optimization tailored for specific roles.", 29, 5, "tailorings"));
    }

    public static List<Map<String, Object>> getCatalogList() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (FeaturePackDef def : CATALOG.values()) {
            list.add(def.toMap());
        }
        return list;
    }

    public static FeaturePackDef getFeature(String key) {
        if (key == null) return null;
        return CATALOG.get(key.toUpperCase());
    }

    public static boolean containsFeature(String key) {
        return key != null && CATALOG.containsKey(key.toUpperCase());
    }
}
