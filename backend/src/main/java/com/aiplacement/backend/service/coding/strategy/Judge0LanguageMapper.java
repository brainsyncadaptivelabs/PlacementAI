package com.aiplacement.backend.service.coding.strategy;

import java.util.HashMap;
import java.util.Map;

public class Judge0LanguageMapper {
    private static final Map<String, Integer> LANGUAGE_ID_MAP = new HashMap<>();

    static {
        // Map canonicalized lowercase languages to Judge0 language IDs
        LANGUAGE_ID_MAP.put("c", 50);          // C (GCC 9.2.0)
        LANGUAGE_ID_MAP.put("cpp", 54);        // C++ (GCC 9.2.0)
        LANGUAGE_ID_MAP.put("cplusplus", 54);
        LANGUAGE_ID_MAP.put("java", 62);       // Java (OpenJDK 13.0.1)
        LANGUAGE_ID_MAP.put("javascript", 63); // JavaScript (Node.js 12.14.0)
        LANGUAGE_ID_MAP.put("js", 63);
        LANGUAGE_ID_MAP.put("typescript", 74); // TypeScript (3.7.4)
        LANGUAGE_ID_MAP.put("ts", 74);
        LANGUAGE_ID_MAP.put("python", 71);     // Python (3.8.1)
        LANGUAGE_ID_MAP.put("python3", 71);
        LANGUAGE_ID_MAP.put("py", 71);
        LANGUAGE_ID_MAP.put("go", 60);         // Go (1.13.5)
        LANGUAGE_ID_MAP.put("rust", 73);       // Rust (1.40.0)
        LANGUAGE_ID_MAP.put("kotlin", 78);     // Kotlin (1.3.70)
        LANGUAGE_ID_MAP.put("php", 68);        // PHP (7.4.1)
        LANGUAGE_ID_MAP.put("ruby", 72);       // Ruby (2.7.0)
        LANGUAGE_ID_MAP.put("swift", 83);      // Swift (5.1.3)
        LANGUAGE_ID_MAP.put("scala", 81);      // Scala (2.13.1)
        LANGUAGE_ID_MAP.put("sql", 82);        // SQL (SQLite 3.31.1)
        LANGUAGE_ID_MAP.put("bash", 46);       // Bash (5.0.0)
        LANGUAGE_ID_MAP.put("shell", 46);      // Bash/Shell (5.0.0)
        LANGUAGE_ID_MAP.put("c#", 51);         // C# (Mono 6.6.0.161)
        LANGUAGE_ID_MAP.put("csharp", 51);     // C# (Mono 6.6.0.161)
        LANGUAGE_ID_MAP.put("json", 71);       // Fallback to Python for JSON parsing
    }

    public static int getLanguageId(String language) {
        if (language == null) {
            return 71; // Default to Python
        }
        String canonical = language.trim().toLowerCase();
        return LANGUAGE_ID_MAP.getOrDefault(canonical, 71); // Default to Python if unknown
    }
}
