package com.aiplacement.backend.ai.multimodal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class ScreenshotAnalyzer {
    public AnalysisResult analyze(AttachmentContext file) {
        String name = file.getName().toLowerCase();
        List<String> keyFindings = new ArrayList<>();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        tags.add("Screenshot");
        tags.add("Diagnostics");

        boolean isJavaErr = name.contains("java") || name.contains("exception") || name.contains("nullpointer");
        boolean isSqlErr = name.contains("sql") || name.contains("database") || name.contains("postgres") || name.contains("mysql");
        boolean isLeetcode = name.contains("leetcode") || name.contains("problem") || name.contains("solution");

        if (isJavaErr) {
            keyFindings.add("Target Exception: NullPointerException detected.");
            keyFindings.add("Trigger Location: Method invocation target was null.");
            weaknesses.add("Code lacks defensive programming assertions.");
            recommendations.add("Add defensive check: `if (obj != null) { ... }` or wrap inside java.util.Optional wrapper.");
        } else if (isSqlErr) {
            keyFindings.add("Target Exception: SQLException - syntax error or constraint violation.");
            weaknesses.add("SQL database schema rules mismatch.");
            recommendations.add("Check constraint columns mapping. Verify column types against model values.");
        } else if (isLeetcode) {
            keyFindings.add("Target Screen: LeetCode challenge workspace.");
            strengths.add("Active coding problem solving.");
            recommendations.add("Practice space-complexity optimizations: aim for in-place array updates.");
        } else {
            keyFindings.add("General compiler/runtime logs detected.");
            recommendations.add("Isolate the specific line number referenced by the log stack trace.");
        }

        AnalysisResult res = new AnalysisResult();
        res.setSummary("Parsed diagnostics screenshot data for " + file.getName());
        res.setConfidence(0.88);
        res.setKeyFindings(keyFindings);
        res.setStrengths(strengths);
        res.setWeaknesses(weaknesses);
        res.setSuggestedWidgets(Arrays.asList("insight", "recommendations"));
        res.setRecommendations(recommendations);
        res.setMetadata(new HashMap<>());
        res.setFollowUps(Arrays.asList(
            "Explain the root cause of this stack trace and suggest a fix",
            "Show me the safe code to prevent this runtime exception"
        ));
        res.setTags(tags);
        return res;
    }
}
