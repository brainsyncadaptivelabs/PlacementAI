package com.aiplacement.backend.service.coding;

public class LanguageNormalizer {

    public static String normalize(String language) {
        if (language == null) {
            return "python"; // Default fallback
        }
        String lower = language.trim().toLowerCase();
        return switch (lower) {
            case "c++", "cplusplus" -> "cpp";
            case "python3", "py" -> "python";
            case "js" -> "javascript";
            case "ts" -> "typescript";
            case "mysql", "postgresql", "h2" -> "sql";
            default -> lower;
        };
    }
}
