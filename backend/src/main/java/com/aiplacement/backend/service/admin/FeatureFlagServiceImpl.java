package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.flag.*;
import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.entity.FeatureFlag;
import com.aiplacement.backend.repository.AuditLogRepository;
import com.aiplacement.backend.repository.FeatureFlagRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureFlagServiceImpl implements FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;
    private final AuditLogRepository auditLogRepository;

    private void logAudit(String action, String target) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .adminEmail("SUPER_ADMIN")
                    .ipAddress("127.0.0.1")
                    .action(action)
                    .target(target)
                    .status("SUCCESS")
                    .build());
        } catch (Exception e) {
            log.warn("[AUDIT_LOG_ERROR] Failed to save feature flag audit log", e);
        }
    }

    @PostConstruct
    public void initSeedFlags() {
        try {
            if (featureFlagRepository.count() == 0) {
                log.info("[FEATURE_FLAGS] Seeding default platform feature flags...");

                saveFlagIfAbsent("NEW_ATS_ENGINE_V2",
                        "AI ATS Resume Analyzer 2.0 with Deep Gemini Feedback & IRT Scoring",
                        true, 25, "MIT,Stanford");

                saveFlagIfAbsent("CODING_JUDGE0_COMPILER",
                        "Async Judge0 Code Execution Engine with Webhook Callbacks for Coding Problems",
                        true, 50, "ALL");

                saveFlagIfAbsent("CAREER_MENTOR_RAG_COPILOT",
                        "RAG-Powered AI Placement Mentor Widget on Candidate Dashboard",
                        true, 100, "ALL");
            }
        } catch (Exception e) {
            log.warn("[FEATURE_FLAGS] Failed to seed default feature flags", e);
        }
    }

    private void saveFlagIfAbsent(String key, String description, boolean enabled, int rolloutPct, String targetColleges) {
        if (!featureFlagRepository.existsByKey(key)) {
            featureFlagRepository.save(FeatureFlag.builder()
                    .key(key)
                    .description(description)
                    .enabled(enabled)
                    .rolloutPercentage(rolloutPct)
                    .targetColleges(targetColleges)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeatureFlagDto> getAllFlags() {
        return featureFlagRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeatureFlagDto createFlag(CreateFeatureFlagRequest request) {
        if (request.getKey() == null || request.getKey().isBlank()) {
            throw new RuntimeException("Feature flag key cannot be empty");
        }
        String formattedKey = request.getKey().trim().toUpperCase().replaceAll("[^A-Z0-9_]", "_");
        if (featureFlagRepository.existsByKey(formattedKey)) {
            throw new RuntimeException("Feature flag key already exists: " + formattedKey);
        }

        FeatureFlag flag = FeatureFlag.builder()
                .key(formattedKey)
                .description(request.getDescription())
                .enabled(request.isEnabled())
                .rolloutPercentage(Math.max(0, Math.min(100, request.getRolloutPercentage())))
                .targetColleges(request.getTargetColleges())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        FeatureFlag saved = featureFlagRepository.save(flag);
        logAudit("FEATURE_FLAG_CREATED", "Key: " + saved.getKey() + " | State: [enabled=" + saved.isEnabled() + ", rollout=" + saved.getRolloutPercentage() + "%, targetColleges=" + saved.getTargetColleges() + "]");
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FeatureFlagDto updateFlag(Long id, UpdateFeatureFlagRequest request) {
        FeatureFlag flag = featureFlagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feature flag not found with ID: " + id));

        boolean oldEnabled = flag.isEnabled();
        int oldRollout = flag.getRolloutPercentage();
        String oldColleges = flag.getTargetColleges();

        if (request.getDescription() != null) flag.setDescription(request.getDescription());
        if (request.getEnabled() != null) flag.setEnabled(request.getEnabled());
        if (request.getRolloutPercentage() != null) {
            flag.setRolloutPercentage(Math.max(0, Math.min(100, request.getRolloutPercentage())));
        }
        if (request.getTargetColleges() != null) flag.setTargetColleges(request.getTargetColleges());
        flag.setUpdatedAt(LocalDateTime.now());

        FeatureFlag updated = featureFlagRepository.save(flag);
        logAudit("FEATURE_FLAG_UPDATED", "Key: " + updated.getKey() + " | Before: [enabled=" + oldEnabled + ", rollout=" + oldRollout + "%, targetColleges=" + oldColleges + "] | After: [enabled=" + updated.isEnabled() + ", rollout=" + updated.getRolloutPercentage() + "%, targetColleges=" + updated.getTargetColleges() + "]");
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteFlag(Long id) {
        FeatureFlag flag = featureFlagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feature flag not found with ID: " + id));
        featureFlagRepository.deleteById(id);
        logAudit("FEATURE_FLAG_DELETED", "Key: " + flag.getKey() + " | State: [enabled=" + flag.isEnabled() + ", rollout=" + flag.getRolloutPercentage() + "%]");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFeatureEnabled(String flagKey, Long userId, String userCollege) {
        Optional<FeatureFlag> flagOpt = featureFlagRepository.findByKey(flagKey.toUpperCase());
        if (flagOpt.isEmpty()) return false;

        FeatureFlag flag = flagOpt.get();
        if (!flag.isEnabled()) return false;

        // 1. Check College Targeted Overrides
        if (userCollege != null && flag.getTargetColleges() != null && !flag.getTargetColleges().isBlank()) {
            List<String> allowedColleges = Arrays.stream(flag.getTargetColleges().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
            if (allowedColleges.contains("ALL") || allowedColleges.stream().anyMatch(c -> c.equalsIgnoreCase(userCollege.trim()))) {
                return true;
            }
        }

        // 2. Percentage-based Hashing on User ID for consistent bucketing
        if (flag.getRolloutPercentage() >= 100) return true;
        if (flag.getRolloutPercentage() <= 0) return false;
        if (userId == null) return false;

        int bucket = Math.abs((flagKey + ":" + userId).hashCode()) % 100;
        return bucket < flag.getRolloutPercentage();
    }

    private FeatureFlagDto mapToDto(FeatureFlag flag) {
        return FeatureFlagDto.builder()
                .id(flag.getId())
                .key(flag.getKey())
                .description(flag.getDescription())
                .enabled(flag.isEnabled())
                .rolloutPercentage(flag.getRolloutPercentage())
                .targetColleges(flag.getTargetColleges())
                .createdAt(flag.getCreatedAt())
                .updatedAt(flag.getUpdatedAt())
                .build();
    }
}
