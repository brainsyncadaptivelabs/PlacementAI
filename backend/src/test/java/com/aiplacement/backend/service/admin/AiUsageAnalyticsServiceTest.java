package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.aiusage.PlatformUsageSummaryDto;
import com.aiplacement.backend.dto.admin.aiusage.UserUsageSummaryDto;
import com.aiplacement.backend.entity.ApiUsageLog;
import com.aiplacement.backend.entity.PlatformDailyUsageRollup;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserDailyUsageRollup;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.aiplacement.backend.repository.PlatformDailyUsageRollupRepository;
import com.aiplacement.backend.repository.UserDailyUsageRollupRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiUsageAnalyticsServiceTest {

    @Mock
    private ApiUsageLogRepository apiUsageLogRepository;

    @Mock
    private UserDailyUsageRollupRepository userRollupRepository;

    @Mock
    private PlatformDailyUsageRollupRepository platformRollupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AiUsageAnalyticsService aiUsageAnalyticsService;

    @Test
    void testGetPlatformSummary_CombinesRollupsAndTodayLiveQuery() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        PlatformDailyUsageRollup historicalRollup = PlatformDailyUsageRollup.builder()
                .date(yesterday)
                .totalTokens(1000L)
                .promptTokens(600L)
                .completionTokens(400L)
                .totalCostUsd(0.01)
                .callCount(5)
                .successfulCallCount(5)
                .failedCallCount(0)
                .activeUserCount(1)
                .featureBreakdownJson("{\"RESUME_ANALYSIS\":{\"tokens\":1000,\"promptTokens\":600,\"completionTokens\":400,\"costUsd\":0.01,\"callCount\":5,\"successCount\":5,\"failureCount\":0}}")
                .build();

        when(platformRollupRepository.findByDateBetweenOrderByDateAsc(any(), any()))
                .thenReturn(List.of(historicalRollup));

        ApiUsageLog todayLog = ApiUsageLog.builder()
                .id(100L)
                .userId(1L)
                .userEmail("test@example.com")
                .featureUsed("ROADMAP")
                .totalTokens(500)
                .promptTokens(300)
                .completionTokens(200)
                .estimatedCost(0.005)
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();

        when(apiUsageLogRepository.findByTimestampBetween(any(), any()))
                .thenReturn(List.of(todayLog));

        PlatformUsageSummaryDto summary = aiUsageAnalyticsService.getPlatformSummary("week");

        assertNotNull(summary);
        assertEquals(1500L, summary.getTotalTokens());
        assertEquals(900L, summary.getPromptTokens());
        assertEquals(600L, summary.getCompletionTokens());
        assertEquals(6, summary.getCallCount());
        assertEquals(0.015, summary.getCostUsd(), 0.0001);
        assertTrue(summary.getCostInr() > 0);
    }

    @Test
    void testGetUsersConsumption_PaginatesAndSortsCorrectly() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        UserDailyUsageRollup userRollup = UserDailyUsageRollup.builder()
                .userId(1L)
                .userEmail("user1@example.com")
                .date(yesterday)
                .totalTokens(2000L)
                .totalCostUsd(0.02)
                .callCount(10)
                .build();

        when(userRollupRepository.findByDateBetween(any(), any()))
                .thenReturn(List.of(userRollup));

        when(apiUsageLogRepository.findByTimestampBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        User user = User.builder()
                .id(1L)
                .fullName("Jane Doe")
                .email("user1@example.com")
                .build();

        when(userRepository.findAllById(any())).thenReturn(List.of(user));

        Page<UserUsageSummaryDto> pageResult = aiUsageAnalyticsService.getUsersConsumption("month", "cost", PageRequest.of(0, 10));

        assertNotNull(pageResult);
        assertEquals(1, pageResult.getTotalElements());
        UserUsageSummaryDto dto = pageResult.getContent().get(0);
        assertEquals(1L, dto.getUserId());
        assertEquals("Jane Doe", dto.getUserName());
        assertEquals(2000L, dto.getTotalTokens());
        assertEquals(0.02, dto.getCostUsd(), 0.0001);
    }

    @Test
    void testGenerateCsvExport_GeneratesCsvAndLogsAudit() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        UserDailyUsageRollup userRollup = UserDailyUsageRollup.builder()
                .userId(10L)
                .userEmail("user10@example.com")
                .date(yesterday)
                .totalTokens(3000L)
                .promptTokens(2000L)
                .completionTokens(1000L)
                .totalCostUsd(0.03)
                .callCount(15)
                .build();

        when(userRollupRepository.findByDateBetween(any(), any()))
                .thenReturn(List.of(userRollup));

        when(apiUsageLogRepository.findByTimestampBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        User user = User.builder()
                .id(10L)
                .fullName("Alice Smith")
                .email("user10@example.com")
                .build();

        when(userRepository.findAllById(any())).thenReturn(List.of(user));

        byte[] csvBytes = aiUsageAnalyticsService.generateCsvExport("month", "admin@example.com", "192.168.1.1");

        assertNotNull(csvBytes);
        String csvContent = new String(csvBytes);
        assertTrue(csvContent.contains("User ID,Full Name,Email,Total Tokens"));
        assertTrue(csvContent.contains("Alice Smith"));
        assertTrue(csvContent.contains("user10@example.com"));
        assertTrue(csvContent.contains("3000"));
    }
}
