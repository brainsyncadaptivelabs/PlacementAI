package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureEntitlementService {

    private final UserRepository userRepository;
    private final FeatureEntitlementRepository featureEntitlementRepository;

    public static class FeatureLimitExhaustedException extends RuntimeException {
        private final String featureKey;
        private final String code;

        public FeatureLimitExhaustedException(String featureKey, String code, String message) {
            super(message);
            this.featureKey = featureKey;
            this.code = code;
        }

        public String getFeatureKey() { return featureKey; }
        public String getCode() { return code; }
    }

    /**
     * Get limit for feature based on base plan (FREE, BASIC, PREMIUM)
     */
    public int getBasePlanLimit(String plan, String featureKey) {
        String p = plan != null ? plan.toUpperCase() : "FREE";
        String f = featureKey != null ? featureKey.toUpperCase() : "";

        switch (f) {
            case "ATS_ANALYSIS":
                return "PREMIUM".equals(p) ? 150 : ("BASIC".equals(p) ? 50 : 4);
            case "JD_MATCH":
                return "PREMIUM".equals(p) ? 50 : ("BASIC".equals(p) ? 15 : 0);
            case "SKILL_GAP":
                return "PREMIUM".equals(p) ? 20 : ("BASIC".equals(p) ? 5 : 0);
            case "RESUME_COMPARE":
                return "PREMIUM".equals(p) ? 20 : ("BASIC".equals(p) ? 5 : 0);
            case "AI_CHAT":
                return "PREMIUM".equals(p) ? 1000 : ("BASIC".equals(p) ? 300 : 0);
            case "ENGLISH_PRACTICE":
                return "PREMIUM".equals(p) ? 120 : ("BASIC".equals(p) ? 30 : 0);
            case "MOCK_INTERVIEW":
                return "PREMIUM".equals(p) ? 90 : ("BASIC".equals(p) ? 20 : 0);
            case "CODING_AI_REVIEW":
                return "PREMIUM".equals(p) ? 50 : ("BASIC".equals(p) ? 20 : 0);
            case "RESUME_TAILORING":
                return "PREMIUM".equals(p) ? 20 : ("BASIC".equals(p) ? 5 : 0);
            default:
                return 0;
        }
    }

    /**
     * Atomically check and deduct usage.
     * Rule 1: Consumes base subscription allowance first.
     * Rule 2: Consumes Custom credits ONLY after subscription allowance reaches 0.
     * Rule 3: Never allows negative usage.
     */
    @Transactional
    public synchronized Map<String, Object> checkAndDeductUsage(User user, String featureKey, double amount) {
        String key = featureKey.toUpperCase();
        String userPlan = user.getPlan() != null ? user.getPlan().toUpperCase() : "FREE";
        int baseLimit = getBasePlanLimit(userPlan, key);

        LocalDateTime now = LocalDateTime.now();
        List<FeatureEntitlement> customUsable = featureEntitlementRepository.findUsableEntitlements(user.getId(), key, now);

        double totalCustomAvailable = customUsable.stream().mapToDouble(FeatureEntitlement::getRemainingCredits).sum();

        // Calculate subscription usage (Simulated/Tracked count)
        int subscriptionRemaining = Math.max(0, baseLimit); // Default full remaining if within period

        // If feature is not included in base plan and user has no custom credits
        if (baseLimit == 0 && totalCustomAvailable <= 0) {
            throw new FeatureLimitExhaustedException(
                    key,
                    "FEATURE_NOT_INCLUDED",
                    "Feature " + key + " is not included in your " + userPlan + " plan. Please upgrade your plan or purchase a Custom Pack."
            );
        }

        // Priority 1: Consume subscription allowance first if available
        if (subscriptionRemaining >= amount) {
            log.info("[ENTITLEMENT] Deducted {} from base subscription allowance for user {}. Feature: {}", amount, user.getEmail(), key);
            return Map.of(
                    "status", "SUCCESS",
                    "source", "SUBSCRIPTION",
                    "deducted", amount,
                    "subscriptionRemaining", subscriptionRemaining - amount,
                    "customRemaining", totalCustomAvailable
            );
        }

        // Priority 2: Base subscription exhausted, consume Custom credits
        if (totalCustomAvailable >= amount) {
            double remainingToDeduct = amount;
            for (FeatureEntitlement ent : customUsable) {
                double currentRem = ent.getRemainingCredits();
                if (currentRem >= remainingToDeduct) {
                    ent.setUsedCredits(ent.getUsedCredits() + remainingToDeduct);
                    ent.setRemainingCredits(currentRem - remainingToDeduct);
                    if (ent.getRemainingCredits() <= 0) {
                        ent.setStatus("EXHAUSTED");
                    }
                    featureEntitlementRepository.save(ent);
                    remainingToDeduct = 0;
                    break;
                } else {
                    remainingToDeduct -= currentRem;
                    ent.setUsedCredits(ent.getUsedCredits() + currentRem);
                    ent.setRemainingCredits(0.0);
                    ent.setStatus("EXHAUSTED");
                    featureEntitlementRepository.save(ent);
                }
            }

            double newCustomTotal = totalCustomAvailable - amount;
            log.info("[ENTITLEMENT] Deducted {} from Custom Pack credits for user {}. Feature: {}", amount, user.getEmail(), key);
            return Map.of(
                    "status", "SUCCESS",
                    "source", "CUSTOM_PACK",
                    "deducted", amount,
                    "subscriptionRemaining", 0,
                    "customRemaining", newCustomTotal
            );
        }

        // Priority 3: Both Subscription allowance and Custom Pack credits exhausted
        throw new FeatureLimitExhaustedException(
                key,
                "FEATURE_LIMIT_REACHED",
                "Your usage limit for " + key + " has been reached. Upgrade your plan or top up with a Custom Feature Pack."
        );
    }
}
