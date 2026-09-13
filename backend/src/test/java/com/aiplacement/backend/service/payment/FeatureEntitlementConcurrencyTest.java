package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserFeatureUsage;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FeatureEntitlementConcurrencyTest {

    @Autowired
    private FeatureEntitlementService featureEntitlementService;

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
        featureEntitlementRepository.deleteAll();
        userFeatureUsageRepository.deleteAll();

        String uniqueEmail = "test_concurrent_" + UUID.randomUUID() + "@placementai.com";
        testUser = userRepository.save(User.builder()
                .email(uniqueEmail)
                .fullName("Concurrent Test User")
                .password("password123")
                .plan("FREE") // ATS_ANALYSIS base limit is 4
                .build());
    }

    @Test
    @DisplayName("First request safely creates usage record")
    void testFirstRequestCreatesUsageRecord() {
        LocalDate today = LocalDate.now();
        assertTrue(userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", today).isEmpty());

        Map<String, Object> result = featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);

        assertEquals("SUCCESS", result.get("status"));
        assertEquals("SUBSCRIPTION", result.get("source"));
        assertEquals(1.0, result.get("deducted"));
        assertEquals(3.0, result.get("subscriptionRemaining"));

        UserFeatureUsage created = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", today)
                .orElseThrow(() -> new AssertionError("Usage record was not created"));
        assertEquals(1.0, created.getUsedCount());
        assertEquals("ATS_ANALYSIS", created.getFeatureKey());
        assertEquals(testUser.getId(), created.getUserId());
    }

    @Test
    @DisplayName("Sequential usage increments correctly")
    void testSequentialUsageIncrementsCorrectly() {
        LocalDate today = LocalDate.now();

        // Base limit for FREE on ATS_ANALYSIS is 4
        for (int i = 1; i <= 4; i++) {
            Map<String, Object> result = featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);
            assertEquals("SUCCESS", result.get("status"));
            assertEquals((double) (4 - i), ((Double) result.get("subscriptionRemaining")).doubleValue());
        }

        UserFeatureUsage usage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", today)
                .orElseThrow();
        assertEquals(4.0, usage.getUsedCount());
    }

    @Test
    @DisplayName("Quota rejection works when limit is exceeded")
    void testQuotaRejectionWorks() {
        // Consume all 4 base limit requests
        for (int i = 0; i < 4; i++) {
            featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);
        }

        // 5th request should be rejected
        FeatureEntitlementService.FeatureLimitExhaustedException ex = assertThrows(
                FeatureEntitlementService.FeatureLimitExhaustedException.class,
                () -> featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0)
        );

        assertEquals("FEATURE_LIMIT_REACHED", ex.getCode());
        assertEquals("ATS_ANALYSIS", ex.getFeatureKey());

        // Ensure database count did not increment past 4.0
        UserFeatureUsage usage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(4.0, usage.getUsedCount());
    }

    @Test
    @DisplayName("Concurrent first requests safely create single record and enforce quota")
    void testConcurrentFirstRequests() throws Exception {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);
                    successCount.incrementAndGet();
                } catch (FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }
        executor.shutdown();

        // For FREE user on ATS_ANALYSIS: limit = 4.
        // Exactly 4 requests must succeed.
        // Exactly 6 requests must be rejected.
        assertEquals(4, successCount.get(), "Exactly 4 requests should have succeeded");
        assertEquals(6, rejectedCount.get(), "Exactly 6 requests should have been rejected");

        // Verify only 1 usage record exists for this user and feature
        List<UserFeatureUsage> allUsages = userFeatureUsageRepository.findByUserId(testUser.getId());
        assertEquals(1, allUsages.size(), "Only one usage record should exist despite concurrent first requests");

        UserFeatureUsage usage = allUsages.get(0);
        assertEquals(4.0, usage.getUsedCount(), "Used count must exactly equal the quota limit");
    }

    @Test
    @DisplayName("Concurrent requests near quota limit allow exactly the remaining slots")
    void testConcurrentRequestsNearQuotaLimit() throws Exception {
        // Pre-consume 3 out of 4 allowed uses
        for (int i = 0; i < 3; i++) {
            featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);
        }

        UserFeatureUsage initialUsage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(3.0, initialUsage.getUsedCount());

        // Now fire 10 concurrent requests for the 1 remaining slot
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 1.0);
                    successCount.incrementAndGet();
                } catch (FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }
        executor.shutdown();

        // Exactly 1 request should succeed to reach limit 4, and 9 should be rejected
        assertEquals(1, successCount.get(), "Exactly 1 remaining request should have succeeded");
        assertEquals(9, rejectedCount.get(), "Exactly 9 requests should have been rejected");

        UserFeatureUsage finalUsage = userFeatureUsageRepository.findCurrentUsage(testUser.getId(), "ATS_ANALYSIS", LocalDate.now())
                .orElseThrow();
        assertEquals(4.0, finalUsage.getUsedCount(), "Used count must not exceed 4.0");
    }

    @Test
    @DisplayName("Negative or zero usage is rejected")
    void testNegativeOrZeroUsageRejected() {
        assertThrows(IllegalArgumentException.class, () ->
                featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", 0.0)
        );
        assertThrows(IllegalArgumentException.class, () ->
                featureEntitlementService.checkAndDeductUsage(testUser, "ATS_ANALYSIS", -1.0)
        );
    }

    @Test
    @DisplayName("Requirement 1: Limit = 5, 10 simultaneous requests arrive -> exactly 5 succeed and 5 rejected")
    void testExactQuotaEnforcementWithLimitFive() throws Exception {
        // User with BASIC plan has SKILL_GAP limit = 5
        User basicUser = userRepository.save(User.builder()
                .email("basic_concurrent_" + UUID.randomUUID() + "@placementai.com")
                .fullName("Basic Concurrent User")
                .password("password123")
                .plan("BASIC")
                .build());

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    featureEntitlementService.checkAndDeductUsage(basicUser, "SKILL_GAP", 1.0);
                    successCount.incrementAndGet();
                } catch (FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }
        executor.shutdown();

        // Exactly 5 requests must succeed and exactly 5 requests must be rejected
        assertEquals(5, successCount.get(), "Exactly 5 requests should have succeeded for quota limit of 5");
        assertEquals(5, rejectedCount.get(), "Exactly 5 requests should have been rejected");

        // Verify only 1 usage record exists for this user and feature
        List<UserFeatureUsage> allUsages = userFeatureUsageRepository.findByUserId(basicUser.getId());
        assertEquals(1, allUsages.size(), "Only one usage record should exist");

        UserFeatureUsage usage = allUsages.get(0);
        assertEquals(5.0, usage.getUsedCount(), "Used count must exactly equal 5.0 and not exceed quota");
    }

    @Test
    @DisplayName("Concurrent requests with Custom Pack credits when base limit is 0")
    void testConcurrentCustomPackDeduction() throws Exception {
        // FREE user has MOCK_INTERVIEW limit = 0
        featureEntitlementRepository.save(FeatureEntitlement.builder()
                .userId(testUser.getId())
                .userEmail(testUser.getEmail())
                .featureKey("MOCK_INTERVIEW")
                .featureName("Mock Interview")
                .purchasedCredits(5.0)
                .usedCredits(0.0)
                .remainingCredits(5.0)
                .unit("sessions")
                .status("ACTIVE")
                .purchaseDate(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusMonths(6))
                .build());

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    featureEntitlementService.checkAndDeductUsage(testUser, "MOCK_INTERVIEW", 1.0);
                    successCount.incrementAndGet();
                } catch (FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }
        executor.shutdown();

        assertEquals(5, successCount.get(), "Exactly 5 custom pack requests should have succeeded");
        assertEquals(5, rejectedCount.get(), "Exactly 5 requests should have been rejected once credits exhausted");

        List<FeatureEntitlement> entitlements = featureEntitlementRepository.findByUserId(testUser.getId());
        assertFalse(entitlements.isEmpty());
        FeatureEntitlement customPack = entitlements.get(0);
        assertEquals(0.0, customPack.getRemainingCredits(), "Custom pack remaining credits must be 0.0");
        assertEquals(5.0, customPack.getUsedCredits(), "Custom pack used credits must be 5.0");
        assertEquals("EXHAUSTED", customPack.getStatus(), "Custom pack status must be EXHAUSTED");
    }
}
