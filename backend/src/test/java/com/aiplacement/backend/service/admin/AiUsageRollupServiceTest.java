package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.entity.ApiUsageLog;
import com.aiplacement.backend.entity.PlatformDailyUsageRollup;
import com.aiplacement.backend.entity.UserDailyUsageRollup;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.aiplacement.backend.repository.PlatformDailyUsageRollupRepository;
import com.aiplacement.backend.repository.UserDailyUsageRollupRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiUsageRollupServiceTest {

    @Mock
    private ApiUsageLogRepository apiUsageLogRepository;

    @Mock
    private UserDailyUsageRollupRepository userRollupRepository;

    @Mock
    private PlatformDailyUsageRollupRepository platformRollupRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AiUsageRollupService aiUsageRollupService;

    @Test
    void testRollupDate_AggregatesUserAndPlatformMetricsIdempotently() {
        LocalDate date = LocalDate.now().minusDays(1);

        ApiUsageLog log1 = ApiUsageLog.builder()
                .id(1L)
                .userId(10L)
                .userEmail("user10@example.com")
                .featureUsed("RESUME_ANALYSIS")
                .promptTokens(100)
                .completionTokens(50)
                .totalTokens(150)
                .estimatedCost(0.002)
                .status("SUCCESS")
                .timestamp(date.atTime(10, 0))
                .build();

        ApiUsageLog log2 = ApiUsageLog.builder()
                .id(2L)
                .userId(10L)
                .userEmail("user10@example.com")
                .featureUsed("CHATBOT")
                .promptTokens(200)
                .completionTokens(100)
                .totalTokens(300)
                .estimatedCost(0.004)
                .status("SUCCESS")
                .timestamp(date.atTime(14, 0))
                .build();

        when(apiUsageLogRepository.findByTimestampBetween(any(), any()))
                .thenReturn(List.of(log1, log2));

        when(userRollupRepository.findByUserIdAndDate(10L, date))
                .thenReturn(Optional.empty());

        when(platformRollupRepository.findByDate(date))
                .thenReturn(Optional.empty());

        aiUsageRollupService.rollupDate(date);

        ArgumentCaptor<UserDailyUsageRollup> userCaptor = ArgumentCaptor.forClass(UserDailyUsageRollup.class);
        verify(userRollupRepository, times(1)).save(userCaptor.capture());
        UserDailyUsageRollup savedUserRollup = userCaptor.getValue();

        assertEquals(10L, savedUserRollup.getUserId());
        assertEquals("user10@example.com", savedUserRollup.getUserEmail());
        assertEquals(450L, savedUserRollup.getTotalTokens());
        assertEquals(0.006, savedUserRollup.getTotalCostUsd(), 0.0001);
        assertEquals(2, savedUserRollup.getCallCount());

        ArgumentCaptor<PlatformDailyUsageRollup> platformCaptor = ArgumentCaptor.forClass(PlatformDailyUsageRollup.class);
        verify(platformRollupRepository, times(1)).save(platformCaptor.capture());
        PlatformDailyUsageRollup savedPlatformRollup = platformCaptor.getValue();

        assertEquals(date, savedPlatformRollup.getDate());
        assertEquals(450L, savedPlatformRollup.getTotalTokens());
        assertEquals(0.006, savedPlatformRollup.getTotalCostUsd(), 0.0001);
        assertEquals(2, savedPlatformRollup.getCallCount());
        assertEquals(1, savedPlatformRollup.getActiveUserCount());
    }
}
