package com.aiplacement.backend.ai.intelligence;

import java.util.*;

public class AtsScoringEngine {

    public static class ScoreBreakdown {
        private final int overallScore;
        private final Map<String, Integer> categories;

        public ScoreBreakdown(int overallScore, Map<String, Integer> categories) {
            this.overallScore = overallScore;
            this.categories = categories;
        }

        public int getOverallScore() { return overallScore; }
        public Map<String, Integer> getCategories() { return categories; }
    }

    // Configurable weights (must sum to 1.0)
    private static final double WEIGHT_KEYWORDS = 0.25;
    private static final double WEIGHT_SKILLS = 0.15;
    private static final double WEIGHT_EXPERIENCE = 0.15;
    private static final double WEIGHT_PROJECTS = 0.15;
    private static final double WEIGHT_EDUCATION = 0.10;
    private static final double WEIGHT_FORMATTING = 0.10;
    private static final double WEIGHT_ACHIEVEMENTS = 0.05;
    private static final double WEIGHT_CONTACT = 0.05;

    public static ScoreBreakdown calculate(
            String text,
            List<String> matchedSkills,
            List<String> missingSkills,
            String experienceLevel,
            int yearsOfExp,
            int projectCount,
            boolean hasMetrics,
            boolean hasLiveLink,
            boolean hasDegree,
            boolean hasTopCollege,
            double cgpaVal,
            int achievementCount,
            boolean hasCompetitiveCoding,
            boolean hasCertification,
            boolean hasEmail,
            boolean hasPhone,
            boolean hasLinkedin,
            boolean hasGithub,
            boolean hasPortfolio
    ) {
        String cleanText = text == null ? "" : text;
        int wordCount = cleanText.split("\\s+").length;

        // 1. Formatting Score
        boolean isOptimalLength = wordCount >= 300 && wordCount <= 800;
        int formattingScore = 60;
        if (hasEmail) formattingScore += 8;
        if (hasPhone) formattingScore += 6;
        if (hasLinkedin) formattingScore += 8;
        if (hasGithub) formattingScore += 7;
        if (hasPortfolio) formattingScore += 5;
        if (isOptimalLength) formattingScore += 6;
        else if (wordCount < 200) formattingScore -= 15;
        else formattingScore -= 5;
        formattingScore = Math.max(30, Math.min(95, formattingScore));

        // 2. Keyword Match Score
        int matchedKwCount = matchedSkills.size();
        int missingKwCount = missingSkills.size();
        int totalKwCount = Math.max(1, matchedKwCount + missingKwCount);
        int keywordScore = Math.max(20, Math.min(95, Math.round((float) matchedKwCount / totalKwCount * 100 * 0.85f + 15)));

        // 3. Experience Score
        int expBase = 40;
        if ("principal".equalsIgnoreCase(experienceLevel) || "director".equalsIgnoreCase(experienceLevel)) expBase = 95;
        else if ("architect".equalsIgnoreCase(experienceLevel) || "lead".equalsIgnoreCase(experienceLevel)) expBase = 90;
        else if ("senior".equalsIgnoreCase(experienceLevel) || "manager".equalsIgnoreCase(experienceLevel)) expBase = 85;
        else if ("midlevel".equalsIgnoreCase(experienceLevel) || "mid".equalsIgnoreCase(experienceLevel)) expBase = 75;
        else if ("junior".equalsIgnoreCase(experienceLevel)) expBase = 65;
        else if ("intern".equalsIgnoreCase(experienceLevel)) expBase = 55;
        else if ("fresher".equalsIgnoreCase(experienceLevel)) expBase = 45;
        
        int experienceScore = expBase + (yearsOfExp > 0 ? Math.min(10, yearsOfExp * 2) : 0);
        if (hasMetrics) experienceScore += 5;
        experienceScore = Math.max(30, Math.min(95, experienceScore));

        // 4. Projects Score
        int projectScore = 30 + (Math.min(4, projectCount) * 12);
        if (hasMetrics) projectScore += 8;
        if (hasLiveLink) projectScore += 7;
        if (hasGithub) projectScore += 5;
        projectScore = Math.max(30, Math.min(95, projectScore));

        // 5. Education Score
        int educationScore = 50;
        if (hasDegree) educationScore = 75;
        if (hasTopCollege) educationScore += 15;
        if (cgpaVal >= 9.0) educationScore += 8;
        else if (cgpaVal >= 8.0) educationScore += 5;
        else if (cgpaVal >= 7.0) educationScore += 2;
        educationScore = Math.max(30, Math.min(95, educationScore));

        // 6. Skills Score
        int skillScore = 30 + (matchedSkills.size() * 4);
        skillScore = Math.max(30, Math.min(95, skillScore));

        // 7. Achievements Score
        int achievementScore = 35 + (achievementCount * 8);
        if (hasCompetitiveCoding) achievementScore += 10;
        if (hasCertification) achievementScore += 8;
        if (hasMetrics) achievementScore += 4;
        achievementScore = Math.max(30, Math.min(95, achievementScore));

        // 8. Contact Information Score
        int contactScore = 0;
        if (hasEmail) contactScore += 25;
        if (hasPhone) contactScore += 25;
        if (hasLinkedin) contactScore += 25;
        if (hasGithub) contactScore += 25;

        // Weighted Average
        double weightedSum = (keywordScore * WEIGHT_KEYWORDS)
                + (skillScore * WEIGHT_SKILLS)
                + (experienceScore * WEIGHT_EXPERIENCE)
                + (projectScore * WEIGHT_PROJECTS)
                + (educationScore * WEIGHT_EDUCATION)
                + (formattingScore * WEIGHT_FORMATTING)
                + (achievementScore * WEIGHT_ACHIEVEMENTS)
                + (contactScore * WEIGHT_CONTACT);

        int overallScore = Math.max(30, Math.min(98, (int) Math.round(weightedSum)));

        Map<String, Integer> categories = new LinkedHashMap<>();
        categories.put("Keywords", keywordScore);
        categories.put("Formatting", formattingScore);
        categories.put("Grammar", isOptimalLength ? 90 : 75); // dynamic logic for grammar/readability proxy
        categories.put("Experience", experienceScore);
        categories.put("Projects", projectScore);
        categories.put("Education", educationScore);
        categories.put("Skills", skillScore);
        categories.put("Achievements", achievementScore);
        categories.put("Contact", contactScore);

        return new ScoreBreakdown(overallScore, categories);
    }
}
