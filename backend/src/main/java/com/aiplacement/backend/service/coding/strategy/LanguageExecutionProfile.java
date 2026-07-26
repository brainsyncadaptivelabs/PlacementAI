package com.aiplacement.backend.service.coding.strategy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguageExecutionProfile {

    private String language;
    private double cpuTimeLimit;
    private double wallTimeLimit;
    private int memoryLimitKb;
    private int stackLimitKb;
    private int maxProcessesAndOrThreads;

    private static final Map<String, LanguageExecutionProfile> PROFILES = Map.of(
            "java", LanguageExecutionProfile.builder()
                    .language("java")
                    .cpuTimeLimit(5.0)
                    .wallTimeLimit(10.0)
                    .memoryLimitKb(262144) // 256MB
                    .stackLimitKb(64000)
                    .maxProcessesAndOrThreads(100)
                    .build(),
            "cpp", LanguageExecutionProfile.builder()
                    .language("cpp")
                    .cpuTimeLimit(2.0)
                    .wallTimeLimit(5.0)
                    .memoryLimitKb(65536)  // 64MB
                    .stackLimitKb(16000)
                    .maxProcessesAndOrThreads(30)
                    .build(),
            "python", LanguageExecutionProfile.builder()
                    .language("python")
                    .cpuTimeLimit(3.0)
                    .wallTimeLimit(7.0)
                    .memoryLimitKb(131072) // 128MB
                    .stackLimitKb(32000)
                    .maxProcessesAndOrThreads(50)
                    .build(),
            "javascript", LanguageExecutionProfile.builder()
                    .language("javascript")
                    .cpuTimeLimit(3.0)
                    .wallTimeLimit(7.0)
                    .memoryLimitKb(131072) // 128MB
                    .stackLimitKb(32000)
                    .maxProcessesAndOrThreads(50)
                    .build()
    );

    public static LanguageExecutionProfile getProfileForLanguage(String language) {
        if (language == null) return getDefaultProfile();
        String canonical = language.trim().toLowerCase();
        return PROFILES.getOrDefault(canonical, getDefaultProfile());
    }

    public static LanguageExecutionProfile getDefaultProfile() {
        return LanguageExecutionProfile.builder()
                .language("default")
                .cpuTimeLimit(5.0)
                .wallTimeLimit(10.0)
                .memoryLimitKb(262144)
                .stackLimitKb(64000)
                .maxProcessesAndOrThreads(60)
                .build();
    }
}
