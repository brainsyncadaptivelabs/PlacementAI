package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.FeatureReservation;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserFeatureUsage;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.FeatureReservationRepository;
import com.aiplacement.backend.repository.UserFeatureUsageRepository;
import com.aiplacement.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FeatureEntitlementReservationTest {

    @Autowired
    private FeatureEntitlementService featureEntitlementService;

    @Autowired
    private FeatureReservationRepository featureReservationRepository;

    @Autowired
    private UserFeatureUsageRepository userFeatureUsageRepository;

    @Autowired
    private FeatureEntitlementRepository featureEntitlementRepository;

    @Autowired
    private UserRepository userRepository;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    private User testUser;

    @BeforeEach
    void setUp() {
        featureReservationRepository.deleteAll();
        featureEntitlementRepository.deleteAll();
        userFeatureUsageRepository.deleteAll();

        String uniqueEmail = "reservation_test_" + UUID.randomUUID() + "@placementai.com";
        testUser = userRepository.save(User.builder()
                .email(uniqueEmail)
                .fullName("Reservation Test User")
                .password("password123")
                .plan("FREE") // ATS_ANALYSIS base limit is 4
                .build());
    }

    @Test
    @DisplayName("1. Successful feature request consumes usage: reserve -> execute -> finalize")
    void testSuccessfulFeatureRequestConsumesUsage() {
        // Reserve 1.0 usage for ATS_ANALYSIS
        FeatureReservation res = featureEntitlementService.reserveUsage(testUser, "ATS_ANALYSIS", 1.0);
        assertNotNull(res.getId());
        assertEquals("RESERVED", res.getStatus());
        assertEquals(1.0, res.getAmount());

        // Quota is tracked during execution
        UserFeatureUsage currentUsage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(1.0, currentUsage.getUsedCount());

        // Simulate successful downstream operation -> finalize
        Map<String, Object> finalizeResult = featureEntitlementService.finalizeConsumption(res.getId());
        assertEquals("SUCCESS", finalizeResult.get("status"));

        FeatureReservation committed = featureReservationRepository.findById(res.getId()).orElseThrow();
        assertEquals("COMMITTED", committed.getStatus());

        // Quota remains consumed
        UserFeatureUsage finalUsage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(1.0, finalUsage.getUsedCount());
    }

    @Test
    @DisplayName("2. Downstream failure does not permanently consume subscription usage: reserve -> failure -> release")
    void testDownstreamFailureDoesNotPermanentlyConsumeUsage() {
        // Reserve 1.0 usage
        FeatureReservation res = featureEntitlementService.reserveUsage(testUser, "ATS_ANALYSIS", 1.0);
        assertEquals("RESERVED", res.getStatus());

        UserFeatureUsage usageDuringExec = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(1.0, usageDuringExec.getUsedCount());

        // Simulate downstream failure (NVIDIA API timeout / internal exception) -> release
        Map<String, Object> releaseResult = featureEntitlementService.releaseReservation(res.getId());
        assertEquals("RELEASED", releaseResult.get("status"));
        assertEquals(1.0, releaseResult.get("refunded"));

        FeatureReservation released = featureReservationRepository.findById(res.getId()).orElseThrow();
        assertEquals("RELEASED", released.getStatus());

        // Quota is restored to 0.0!
        UserFeatureUsage restoredUsage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(0.0, restoredUsage.getUsedCount());

        // User can now consume the full base limit of 4 without having lost quota
        for (int i = 0; i < 4; i++) {
            featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);
        }

        // 5th attempt should be exhausted
        assertThrows(FeatureEntitlementService.FeatureLimitExhaustedException.class, () ->
                featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0));
    }

    @Test
    @DisplayName("2b. Downstream failure restores Custom Pack credits")
    void testDownstreamFailureRestoresCustomPackCredits() {
        // Give user custom entitlement of 5 credits for RESUME_COMPARE (FREE plan limit is 0)
        FeatureEntitlement custom = featureEntitlementRepository.save(FeatureEntitlement.builder()
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .featureKey("RESUME_COMPARE")
                .featureName("Resume Compare")
                .purchasedCredits(5.0)
                .usedCredits(0.0)
                .remainingCredits(5.0)
                .unit("comparisons")
                .purchaseDate(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusMonths(6))
                .status("ACTIVE")
                .build());

        // Reserve 2 credits
        FeatureReservation res = featureEntitlementService.reserveUsage(testUser, "RESUME_COMPARE", 2.0);
        assertEquals("RESERVED", res.getStatus());
        assertEquals("CUSTOM_PACK", res.getSource());

        FeatureEntitlement during = featureEntitlementRepository.findById(custom.getId()).orElseThrow();
        assertEquals(3.0, during.getRemainingCredits());
        assertEquals(2.0, during.getUsedCredits());

        // Downstream failure occurs -> release
        featureEntitlementService.releaseReservation(res.getId());

        FeatureEntitlement restored = featureEntitlementRepository.findById(custom.getId()).orElseThrow();
        assertEquals(5.0, restored.getRemainingCredits());
        assertEquals(0.0, restored.getUsedCredits());
        assertEquals("ACTIVE", restored.getStatus());
    }

    @Test
    @DisplayName("2c. executeWithEntitlement helper automatically commits on success and releases on exception")
    void testExecuteWithEntitlementSuccessAndFailure() {
        // 1. Success case
        String result = featureEntitlementService.executeWithEntitlement(testUser, "ATS_ANALYSIS", 1.0, () -> "SUCCESS_DATA");
        assertEquals("SUCCESS_DATA", result);

        UserFeatureUsage usage1 = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(1.0, usage1.getUsedCount());

        // 2. Failure case (simulate LangChain4j or Judge0 exception)
        assertThrows(IllegalStateException.class, () ->
                featureEntitlementService.executeWithEntitlement(testUser, "ATS_ANALYSIS", 1.0, () -> {
                    throw new IllegalStateException("NVIDIA API Downstream 504 Gateway Timeout");
                }));

        // Usage must still be 1.0 (the 2nd attempt was rolled back upon exception)
        UserFeatureUsage usage2 = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(1.0, usage2.getUsedCount());
    }

    @Test
    @DisplayName("3. Quota remains enforced during concurrent requests")
    void testQuotaRemainsEnforcedDuringConcurrentReservations() throws InterruptedException {
        // FREE plan for ATS_ANALYSIS has limit = 4
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    featureEntitlementService.reserveUsage(testUser, "ATS_ANALYSIS", 1.0);
                    successCount.incrementAndGet();
                } catch (FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ex) {
                    // Unexpected error
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS), "Concurrent reservations should complete in 10s");
        executor.shutdown();

        // Exactly 4 succeed (the limit), exactly 6 are rejected
        assertEquals(4, successCount.get(), "Only 4 requests must be allowed within quota");
        assertEquals(6, rejectedCount.get(), "Excess 6 requests must be rejected");

        UserFeatureUsage usage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(4.0, usage.getUsedCount(), "Total reserved count must equal exactly the quota limit");
    }

    @Test
    @DisplayName("4. Reservation cleanup works: expired reservations are refunded and quota restored")
    void testReservationCleanupWorks() {
        // Reserve 1.0 with 1 millisecond TTL
        FeatureReservation res = featureEntitlementService.reserveUsage(
                testUser, "ATS_ANALYSIS", 1.0, Duration.ofMillis(1));
        assertEquals("RESERVED", res.getStatus());

        UserFeatureUsage usageBefore = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(1.0, usageBefore.getUsedCount());

        // Wait slightly so expiresAt is strictly in the past
        try {
            Thread.sleep(50);
        } catch (InterruptedException ignored) {}

        // Run cleanup
        int cleanedCount = featureEntitlementService.cleanupExpiredReservations();
        assertTrue(cleanedCount >= 1, "Expired reservation must be cleaned up");

        FeatureReservation expired = featureReservationRepository.findById(res.getId()).orElseThrow();
        assertEquals("EXPIRED", expired.getStatus());

        // Usage must be restored back to 0.0
        UserFeatureUsage usageAfter = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(0.0, usageAfter.getUsedCount());
    }
}
