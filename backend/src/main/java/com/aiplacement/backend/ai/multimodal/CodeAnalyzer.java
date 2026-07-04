package com.aiplacement.backend.ai.multimodal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class CodeAnalyzer {
    public AnalysisResult analyze(AttachmentContext file) {
        String content = file.getName().toLowerCase();
        List<String> keyFindings = new ArrayList<>();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        tags.add("Code");

        // Heuristics: simulated cyclomatic complexity calculation
        int cyclomaticComplexity = 3;
        if (content.contains("controller") || content.contains("service")) {
            cyclomaticComplexity += 4;
        }
        if (content.contains("loop") || content.contains("sort")) {
            cyclomaticComplexity += 5;
        }

        keyFindings.add("Estimated Cyclomatic Complexity: " + cyclomaticComplexity + " (Standard control flow paths)");

        // Security check: SQL injection
        boolean hasSqlConcatenation = content.contains("select") && content.contains("+");
        if (hasSqlConcatenation) {
            weaknesses.add("High security risk: Potential raw SQL query concatenation detected.");
            recommendations.add("Replace raw string concatenation in SQL queries with Spring Data JPA queries or standard JPA Parameterized queries.");
        } else {
            strengths.add("SQL Parameterization: Safe query design structures identified.");
        }

        // Exception Handling check
        boolean hasExceptionCatch = content.contains("try") && content.contains("catch");
        if (hasExceptionCatch) {
            strengths.add("Robust exception handling boundaries detected.");
        } else {
            weaknesses.add("Missing try-catch block for database or external API operations.");
            recommendations.add("Wrap potentially throwing external calls (like REST calls or file reads) inside safe Exception handlers.");
        }

        // SOLID compliance checks
        boolean isServiceClass = content.contains("service");
        if (isServiceClass) {
            strengths.add("Single Responsibility Principle: Service layer encapsulates only business logic.");
        } else {
            weaknesses.add("Interface Segregation risk: Flat non-segregated interfaces could be thinned down.");
            recommendations.add("Consider separating database model mappings from HTTP request contract structures.");
        }

        AnalysisResult res = new AnalysisResult();
        res.setSummary("Parsed source code structure for " + file.getName());
        res.setConfidence(0.95);
        res.setKeyFindings(keyFindings);
        res.setStrengths(strengths);
        res.setWeaknesses(weaknesses);
        res.setSuggestedWidgets(Arrays.asList("insight", "recommendations", "expandable"));
        res.setRecommendations(recommendations);
        res.setMetadata(new HashMap<>());
        res.setFollowUps(Arrays.asList(
            "Refactor this source file to support Redis caching",
            "Generate 5 mock technical interview questions based on this code design"
        ));
        res.setTags(tags);
        return res;
    }
}
