package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.FeatureReservation;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserFeatureUsage;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.FeatureReservationRepository;
import com.aiplacement.backend.repository.UserFeatureUsageRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class FeatureEntitlementService {

    public static final Duration DEFAULT_RESERVATION_TTL = Duration.ofMinutes(5);

    private final FeatureEntitlementRepository featureEntitlementRepository;
    private final UserFeatureUsageRepository userFeatureUsageRepository;
    private final FeatureReservationRepository featureReservationRepository;

    public FeatureEntitlementService(
            FeatureEntitlementRepository featureEntitlementRepository,
            UserFeatureUsageRepository userFeatureUsageRepository
    ) {
        this(featureEntitlementRepository, userFeatureUsageRepository, null);
    }

    @Autowired
    public FeatureEntitlementService(
            FeatureEntitlementRepository featureEntitlementRepository,
            UserFeatureUsageRepository userFeatureUsageRepository,
            FeatureReservationRepository featureReservationRepository
    ) {
        this.featureEntitlementRepository = featureEntitlementRepository;
        this.userFeatureUsageRepository = userFeatureUsageRepository;
        this.featureReservationRepository = featureReservationRepository;
    }

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
     * Atomically check and deduct usage using database-level atomic operations.
     * Preserves public API behavior by executing reserve + commit in a single transaction.
     */
    @Transactional
    public Map<String, Object> checkAndDeductUsage(User user, String featureKey, double amount) {
        FeatureReservation reservation = reserveUsage(user, featureKey, amount);
        finalizeConsumption(reservation.getId());

        LocalDateTime now = LocalDateTime.now();
        String key = featureKey.toUpperCase();
        int baseLimit = getBasePlanLimit(user.getPlan(), key);
        double updatedUsed = getUsedFeatureCount(user.getId(), key);

        List<FeatureEntitlement> customUsable = featureEntitlementRepository.findUsableEntitlements(user.getId(), key, now);
        double totalCustomAvailable = customUsable.stream().mapToDouble(FeatureEntitlement::getRemainingCredits).sum();

        return Map.of(
                "status", "SUCCESS",
                "source", reservation.getSource(),
                "deducted", amount,
                "subscriptionRemaining", Math.max(0.0, baseLimit - updatedUsed),
                "customRemaining", totalCustomAvailable
        );
    }

    /**
     * Atomically reserves usage before invoking an expensive downstream operation.
     * Quota is decremented immediately so concurrent requests respect limits.
     * If the downstream operation fails, call releaseReservation() to restore quota.
     */
    @Transactional
    public FeatureReservation reserveUsage(User user, String featureKey, double amount) {
        return reserveUsage(user, featureKey, amount, DEFAULT_RESERVATION_TTL);
    }

    @Transactional
    public FeatureReservation reserveUsage(User user, String featureKey, double amount, Duration ttl) {
        if (amount <= 0.0) {
            throw new IllegalArgumentException("Usage amount must be greater than zero");
        }
        if (ttl == null || ttl.isNegative() || ttl.isZero()) {
            ttl = DEFAULT_RESERVATION_TTL;
        }

        String key = featureKey.toUpperCase();
        String userPlan = user.getPlan() != null ? user.getPlan().toUpperCase() : "FREE";
        int baseLimit = getBasePlanLimit(userPlan, key);

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();

        // Step 1: Concurrency-safe retrieval / initialization of current period usage row
        UserFeatureUsage usage = getOrCreateCurrentUsage(user.getId(), user.getEmail(), key, today);

        String reservationId = UUID.randomUUID().toString();
        LocalDateTime expiresAt = now.plus(ttl);

        // Step 2: Try atomic increment on subscription allowance if within limit
        if (baseLimit > 0) {
            int rowsUpdated = userFeatureUsageRepository.incrementUsageIfWithinLimit(usage.getId(), amount, (double) baseLimit, now);
            if (rowsUpdated > 0) {
                log.info("[ENTITLEMENT] Reserved {} from base subscription for user {}. Feature: {}. ResId: {}",
                        amount, user.getEmail(), key, reservationId);

                FeatureReservation reservation = FeatureReservation.builder()
                        .id(reservationId)
                        .userId(user.getId())
                        .userEmail(user.getEmail())
                        .featureKey(key)
                        .amount(amount)
                        .source("SUBSCRIPTION")
                        .usageId(usage.getId())
                        .subscriptionAmount(amount)
                        .customAmount(0.0)
                        .status("RESERVED")
                        .expiresAt(expiresAt)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

                if (featureReservationRepository != null) {
                    featureReservationRepository.save(reservation);
                }
                return reservation;
            }
        }

        // Step 3: Base subscription limit exceeded or zero; fall back to Custom Pack credits
        UserFeatureUsage lockedUsage = userFeatureUsageRepository.findByIdForUpdate(usage.getId()).orElse(usage);
        double currentUsed = lockedUsage.getUsedCount() != null ? lockedUsage.getUsedCount() : 0.0;
        double subscriptionRemaining = Math.max(0.0, baseLimit - currentUsed);

        List<FeatureEntitlement> lockedCustomUsable = featureEntitlementRepository.findUsableEntitlementsForUpdate(user.getId(), key, now);
        double totalCustomAvailable = lockedCustomUsable.stream().mapToDouble(FeatureEntitlement::getRemainingCredits).sum();

        if (baseLimit == 0 && totalCustomAvailable <= 0) {
            throw new FeatureLimitExhaustedException(
                    key,
                    "FEATURE_NOT_INCLUDED",
                    "Feature " + key + " is not included in your " + userPlan + " plan. Please upgrade your plan or purchase a Custom Pack."
            );
        }

        double neededFromCustom = amount - subscriptionRemaining;

        if (totalCustomAvailable >= neededFromCustom && neededFromCustom > 0) {
            if (subscriptionRemaining > 0) {
                userFeatureUsageRepository.setUsageToLimit(usage.getId(), (double) baseLimit, now);
            }

            double remainingToDeduct = neededFromCustom;
            Long primaryCustomId = null;
            for (FeatureEntitlement ent : lockedCustomUsable) {
                if (primaryCustomId == null) {
                    primaryCustomId = ent.getId();
                }
                double currentRem = ent.getRemainingCredits();
                if (currentRem >= remainingToDeduct) {
                    ent.setUsedCredits(ent.getUsedCredits() + remainingToDeduct);
                    ent.setRemainingCredits(currentRem - remainingToDeduct);
                    if (ent.getRemainingCredits() <= 0.0) {
                        ent.setStatus("EXHAUSTED");
                    }
                    featureEntitlementRepository.save(ent);
                    remainingToDeduct = 0.0;
                    break;
                } else {
                    remainingToDeduct -= currentRem;
                    ent.setUsedCredits(ent.getUsedCredits() + currentRem);
                    ent.setRemainingCredits(0.0);
                    ent.setStatus("EXHAUSTED");
                    featureEntitlementRepository.save(ent);
                }
            }

            FeatureReservation reservation = FeatureReservation.builder()
                    .id(reservationId)
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .featureKey(key)
                    .amount(amount)
                    .source(subscriptionRemaining > 0 ? "COMBINED" : "CUSTOM_PACK")
                    .usageId(usage.getId())
                    .subscriptionAmount(subscriptionRemaining)
                    .customEntitlementId(primaryCustomId)
                    .customAmount(neededFromCustom)
                    .status("RESERVED")
                    .expiresAt(expiresAt)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            if (featureReservationRepository != null) {
                featureReservationRepository.save(reservation);
            }

            log.info("[ENTITLEMENT] Reserved {} from Custom Pack credits for user {}. Feature: {}. ResId: {}",
                    neededFromCustom, user.getEmail(), key, reservationId);
            return reservation;
        }

        // Step 4: Quota exhausted
        throw new FeatureLimitExhaustedException(
                key,
                "FEATURE_LIMIT_REACHED",
                "Your usage limit for " + key + " has been reached. Upgrade your plan or top up with a Custom Feature Pack."
        );
    }

    /**
     * Finalizes consumption of a reserved usage token after successful feature execution.
     */
    @Transactional
    public Map<String, Object> finalizeConsumption(String reservationId) {
        if (featureReservationRepository == null || reservationId == null) {
            return Map.of("status", "SUCCESS", "reservationId", reservationId != null ? reservationId : "");
        }

        FeatureReservation reservation = featureReservationRepository.findByIdForUpdate(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        if ("COMMITTED".equalsIgnoreCase(reservation.getStatus())) {
            log.debug("Reservation {} is already committed", reservationId);
            return Map.of("status", "SUCCESS", "reservationId", reservationId, "message", "Already committed");
        }

        if (!"RESERVED".equalsIgnoreCase(reservation.getStatus())) {
            throw new IllegalStateException("Cannot finalize reservation in status: " + reservation.getStatus());
        }

        reservation.setStatus("COMMITTED");
        reservation.setUpdatedAt(LocalDateTime.now());
        featureReservationRepository.save(reservation);

        log.info("[ENTITLEMENT] Finalized consumption for reservation {}. Feature: {}",
                reservationId, reservation.getFeatureKey());

        return Map.of(
                "status", "SUCCESS",
                "reservationId", reservationId,
                "featureKey", reservation.getFeatureKey(),
                "deducted", reservation.getAmount(),
                "source", reservation.getSource()
        );
    }

    /**
     * Releases a reservation and restores the reserved quota if execution failed.
     */
    @Transactional
    public Map<String, Object> releaseReservation(String reservationId) {
        return releaseReservationInternal(reservationId, "RELEASED");
    }

    private Map<String, Object> releaseReservationInternal(String reservationId, String targetStatus) {
        if (featureReservationRepository == null || reservationId == null) {
            return Map.of("status", targetStatus, "reservationId", reservationId != null ? reservationId : "");
        }

        Optional<FeatureReservation> opt = featureReservationRepository.findByIdForUpdate(reservationId);
        if (opt.isEmpty()) {
            log.warn("Reservation not found for release: {}", reservationId);
            return Map.of("status", "NOT_FOUND", "reservationId", reservationId);
        }

        FeatureReservation res = opt.get();
        if (!"RESERVED".equalsIgnoreCase(res.getStatus())) {
            log.debug("Reservation {} is already in status {}, skipping release", reservationId, res.getStatus());
            return Map.of("status", res.getStatus(), "reservationId", reservationId);
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. Restore subscription usage
        if (res.getSubscriptionAmount() > 0.0 && res.getUsageId() != null) {
            userFeatureUsageRepository.decrementUsage(res.getUsageId(), res.getSubscriptionAmount(), now);
            log.info("[ENTITLEMENT] Restored {} subscription usage for user {}. Feature: {}",
                    res.getSubscriptionAmount(), res.getUserEmail(), res.getFeatureKey());
        }

        // 2. Restore custom pack credits
        if (res.getCustomAmount() > 0.0 && res.getCustomEntitlementId() != null) {
            featureEntitlementRepository.findById(res.getCustomEntitlementId()).ifPresent(ent -> {
                ent.setUsedCredits(Math.max(0.0, ent.getUsedCredits() - res.getCustomAmount()));
                ent.setRemainingCredits(ent.getRemainingCredits() + res.getCustomAmount());
                if ("EXHAUSTED".equalsIgnoreCase(ent.getStatus()) && ent.getRemainingCredits() > 0.0) {
                    ent.setStatus("ACTIVE");
                }
                featureEntitlementRepository.save(ent);
                log.info("[ENTITLEMENT] Restored {} custom credits to entitlement {} for user {}",
                        res.getCustomAmount(), ent.getId(), res.getUserEmail());
            });
        }

        res.setStatus(targetStatus);
        res.setUpdatedAt(now);
        featureReservationRepository.save(res);

        log.info("[ENTITLEMENT] Reservation {} marked as {}. Restored total: {}", reservationId, targetStatus, res.getAmount());
        return Map.of(
                "status", targetStatus,
                "reservationId", reservationId,
                "refunded", res.getAmount(),
                "featureKey", res.getFeatureKey()
        );
    }

    /**
     * Finds all expired reservations and releases their quota so credits never get permanently stuck.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public int cleanupExpiredReservations() {
        if (featureReservationRepository == null) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        List<FeatureReservation> expiredList = featureReservationRepository.findByStatusAndExpiresAtBefore("RESERVED", now);
        int count = 0;
        for (FeatureReservation res : expiredList) {
            try {
                releaseReservationInternal(res.getId(), "EXPIRED");
                count++;
            } catch (Exception ex) {
                log.error("Failed to clean up expired reservation {}", res.getId(), ex);
            }
        }
        if (count > 0) {
            log.info("[ENTITLEMENT] Cleaned up and restored {} expired feature reservations", count);
        }
        return count;
    }

    @Autowired(required = false)
    private org.springframework.context.ApplicationContext applicationContext;

    private FeatureEntitlementService getSelf() {
        if (applicationContext != null) {
            try {
                return applicationContext.getBean(FeatureEntitlementService.class);
            } catch (Exception ignored) {}
        }
        return this;
    }

    /**
     * Executes a downstream feature action with guaranteed reservation and automatic release on failure.
     */
    public <T> T executeWithEntitlement(User user, String featureKey, double amount, java.util.function.Supplier<T> action) {
        FeatureReservation reservation = getSelf().reserveUsage(user, featureKey, amount);
        try {
            T result = action.get();
            getSelf().finalizeConsumption(reservation.getId());
            return result;
        } catch (Throwable ex) {
            try {
                getSelf().releaseReservation(reservation.getId());
            } catch (Exception releaseEx) {
                log.error("Failed to release reservation {} after execution failure", reservation.getId(), releaseEx);
            }
            if (ex instanceof RuntimeException) {
                throw (RuntimeException) ex;
            } else if (ex instanceof Error) {
                throw (Error) ex;
            } else {
                throw new RuntimeException("Feature execution failed", ex);
            }
        }
    }

    public UserFeatureUsage getOrCreateCurrentUsage(
            Long userId, String userEmail, String featureKey, LocalDate today
    ) {
        Optional<UserFeatureUsage> existing = 
                userFeatureUsageRepository.findCurrentUsage(userId, featureKey, today)
                        .or(() -> userFeatureUsageRepository.findByUserIdAndFeatureKeyAndPeriodStart(userId, featureKey, today));
        if (existing.isPresent()) {
            return existing.get();
        }

        LocalDate periodEnd = today.plusDays(30);
        try {
            userFeatureUsageRepository.insertInitialUsageIfAbsent(userId, userEmail, featureKey, today, periodEnd);
        } catch (Exception ex) {
            log.debug("Concurrent initial insert handled for user {} feature {}: {}", userId, featureKey, ex.getMessage());
        }

        existing = userFeatureUsageRepository.findCurrentUsage(userId, featureKey, today)
                .or(() -> userFeatureUsageRepository.findByUserIdAndFeatureKeyAndPeriodStart(userId, featureKey, today));
        if (existing.isPresent()) {
            return existing.get();
        }

        // Fallback: direct JPA saveAndFlush if native query didn't persist (e.g. in in-memory test databases)
        try {
            return userFeatureUsageRepository.saveAndFlush(UserFeatureUsage.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .featureKey(featureKey)
                    .usedCount(0.0)
                    .periodStart(today)
                    .periodEnd(periodEnd)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        } catch (Exception ex) {
            log.debug("Fallback save conflict for user {} feature {}: {}", userId, featureKey, ex.getMessage());
            return userFeatureUsageRepository.findCurrentUsage(userId, featureKey, today)
                    .or(() -> userFeatureUsageRepository.findByUserIdAndFeatureKeyAndPeriodStart(userId, featureKey, today))
                    .orElseThrow(() -> new IllegalStateException(
                            String.format("Failed to initialize or retrieve feature usage record for user %d and feature %s", userId, featureKey), ex
                    ));
        }
    }

    public double getUsedFeatureCount(Long userId, String featureKey) {
        LocalDate today = LocalDate.now();
        return userFeatureUsageRepository.findCurrentUsage(userId, featureKey.toUpperCase(), today)
                .map(UserFeatureUsage::getUsedCount)
                .orElse(0.0);
    }

    public Map<String, Double> getAllFeatureUsages(Long userId) {
        LocalDate today = LocalDate.now();
        List<UserFeatureUsage> list = userFeatureUsageRepository.findByUserIdAndPeriodEndAfter(userId, today);
        Map<String, Double> map = new HashMap<>();
        for (UserFeatureUsage u : list) {
            if (u.getFeatureKey() != null) {
                map.putIfAbsent(u.getFeatureKey().toUpperCase(), u.getUsedCount());
            }
        }
        return map;
    }
}
