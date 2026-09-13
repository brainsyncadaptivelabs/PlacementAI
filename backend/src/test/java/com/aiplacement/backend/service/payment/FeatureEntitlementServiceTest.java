package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserFeatureUsage;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.UserFeatureUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class FeatureEntitlementServiceTest {

    private FeatureEntitlementRepository featureEntitlementRepository;
    private UserFeatureUsageRepository userFeatureUsageRepository;
    private FeatureEntitlementService service;
    private User freeUser;

    @BeforeEach
    void setUp() {
        featureEntitlementRepository = mock(FeatureEntitlementRepository.class);
        userFeatureUsageRepository = mock(UserFeatureUsageRepository.class);
        service = new FeatureEntitlementService(featureEntitlementRepository, userFeatureUsageRepository);

        freeUser = User.builder()
                .id(1L)
                .email("student@placementai.com")
                .fullName("Free Student")
                .plan("FREE")
                .build();

    }

    @Test
    void testGetBasePlanLimit() {
        assertEquals(4, service.getBasePlanLimit("FREE", "ATS_ANALYSIS"));
        assertEquals(50, service.getBasePlanLimit("BASIC", "ATS_ANALYSIS"));
        assertEquals(150, service.getBasePlanLimit("PREMIUM", "ATS_ANALYSIS"));
        assertEquals(0, service.getBasePlanLimit("FREE", "MOCK_INTERVIEW"));
        assertEquals(90, service.getBasePlanLimit("PREMIUM", "MOCK_INTERVIEW"));
    }

    @Test
    void testCheckAndDeductUsageSubscriptionFirst() {
        UserFeatureUsage usage = UserFeatureUsage.builder()
                .id(10L)
                .userId(freeUser.getId())
                .featureKey("ATS_ANALYSIS")
                .usedCount(1.0)
                .periodStart(LocalDate.now())
                .periodEnd(LocalDate.now().plusDays(30))
                .build();

        when(userFeatureUsageRepository.findCurrentUsage(eq(1L), eq("ATS_ANALYSIS"), any(LocalDate.class)))
                .thenReturn(Optional.of(usage));
        when(userFeatureUsageRepository.incrementUsageIfWithinLimit(eq(10L), eq(1.0), eq(4.0), any(LocalDateTime.class)))
                .thenReturn(1);
        when(userFeatureUsageRepository.findById(10L))
                .thenReturn(Optional.of(UserFeatureUsage.builder().id(10L).usedCount(2.0).build()));
        when(featureEntitlementRepository.findUsableEntitlements(eq(1L), eq("ATS_ANALYSIS"), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        Map<String, Object> result = service.checkAndDeductUsage(freeUser, "ATS_ANALYSIS", 1.0);

        assertEquals("SUCCESS", result.get("status"));
        assertEquals("SUBSCRIPTION", result.get("source"));
        assertEquals(1.0, result.get("deducted"));
        verify(userFeatureUsageRepository).incrementUsageIfWithinLimit(eq(10L), eq(1.0), eq(4.0), any(LocalDateTime.class));
    }

    @Test
    void testCheckAndDeductUsageExhaustedSubscriptionFallsBackToCustomCredits() {
        UserFeatureUsage usage = UserFeatureUsage.builder()
                .id(10L)
                .userId(freeUser.getId())
                .featureKey("ATS_ANALYSIS")
                .usedCount(4.0)
                .periodStart(LocalDate.now())
                .periodEnd(LocalDate.now().plusDays(30))
                .build();

        FeatureEntitlement customPack = FeatureEntitlement.builder()
                .id(100L)
                .userId(1L)
                .featureKey("ATS_ANALYSIS")
                .purchasedCredits(10.0)
                .usedCredits(2.0)
                .remainingCredits(8.0)
                .status("ACTIVE")
                .build();

        when(userFeatureUsageRepository.findCurrentUsage(eq(1L), eq("ATS_ANALYSIS"), any(LocalDate.class)))
                .thenReturn(Optional.of(usage));
        when(userFeatureUsageRepository.incrementUsageIfWithinLimit(eq(10L), eq(2.0), eq(4.0), any(LocalDateTime.class)))
                .thenReturn(0);
        when(userFeatureUsageRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(usage));
        when(featureEntitlementRepository.findUsableEntitlementsForUpdate(eq(1L), eq("ATS_ANALYSIS"), any(LocalDateTime.class)))
                .thenReturn(List.of(customPack));

        Map<String, Object> result = service.checkAndDeductUsage(freeUser, "ATS_ANALYSIS", 2.0);

        assertEquals("SUCCESS", result.get("status"));
        assertEquals("CUSTOM_PACK", result.get("source"));
        assertEquals(2.0, result.get("deducted"));
        assertEquals(6.0, customPack.getRemainingCredits());
        assertEquals(4.0, customPack.getUsedCredits());
        verify(featureEntitlementRepository).save(customPack);
    }

    @Test
    void testCheckAndDeductUsageLimitExhaustedThrowsException() {
        UserFeatureUsage usage = UserFeatureUsage.builder()
                .id(10L)
                .userId(freeUser.getId())
                .featureKey("ATS_ANALYSIS")
                .usedCount(4.0)
                .periodStart(LocalDate.now())
                .periodEnd(LocalDate.now().plusDays(30))
                .build();

        when(userFeatureUsageRepository.findCurrentUsage(eq(1L), eq("ATS_ANALYSIS"), any(LocalDate.class)))
                .thenReturn(Optional.of(usage));
        when(userFeatureUsageRepository.incrementUsageIfWithinLimit(eq(10L), eq(1.0), eq(4.0), any(LocalDateTime.class)))
                .thenReturn(0);
        when(userFeatureUsageRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(usage));
        when(featureEntitlementRepository.findUsableEntitlementsForUpdate(eq(1L), eq("ATS_ANALYSIS"), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        assertThrows(FeatureEntitlementService.FeatureLimitExhaustedException.class, () ->
                service.checkAndDeductUsage(freeUser, "ATS_ANALYSIS", 1.0)
        );
    }

    @Test
    void testGetAllFeatureUsages() {
        UserFeatureUsage u1 = UserFeatureUsage.builder()
                .userId(1L)
                .featureKey("ATS_ANALYSIS")
                .usedCount(3.0)
                .build();
        UserFeatureUsage u2 = UserFeatureUsage.builder()
                .userId(1L)
                .featureKey("AI_CHAT")
                .usedCount(15.0)
                .build();

        when(userFeatureUsageRepository.findByUserIdAndPeriodEndAfter(eq(1L), any(LocalDate.class)))
                .thenReturn(List.of(u1, u2));

        Map<String, Double> usages = service.getAllFeatureUsages(1L);
        assertEquals(2, usages.size());
        assertEquals(3.0, usages.get("ATS_ANALYSIS"));
        assertEquals(15.0, usages.get("AI_CHAT"));
    }
}
