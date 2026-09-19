package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodingRewardDto;
import com.aiplacement.backend.dto.coding.CodingStreakDto;
import com.aiplacement.backend.dto.coding.ProgramOfDayDto;
import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingReward;
import com.aiplacement.backend.entity.coding.CodingStreak;
import com.aiplacement.backend.entity.coding.ProgramOfDay;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
import com.aiplacement.backend.repository.coding.CodingRewardRepository;
import com.aiplacement.backend.repository.coding.CodingStreakRepository;
import com.aiplacement.backend.repository.coding.ProgramOfDayRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramOfDayServiceTest {

    @Mock
    private ProgramOfDayRepository programOfDayRepository;
    @Mock
    private CodingStreakRepository streakRepository;
    @Mock
    private CodingRewardRepository rewardRepository;
    @Mock
    private CodingProblemRepository problemRepository;
    @Mock
    private FeatureEntitlementRepository featureEntitlementRepository;

    @InjectMocks
    private ProgramOfDayServiceImpl programOfDayService;

    private User testUser;
    private CodingProblem testProblem1;
    private CodingProblem testProblem2;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(101L).email("student@placement.ai").fullName("Test Student").build();
        testProblem1 = CodingProblem.builder().id(1L).title("Two Sum").difficulty("Easy").tags("Array,Hash Table").build();
        testProblem2 = CodingProblem.builder().id(2L).title("Valid Parentheses").difficulty("Easy").tags("String,Stack").build();
    }

    @Test
    @DisplayName("1. New user receives Program of the Day assignment")
    void getOrCreateProgramOfDay_NewUser_AssignsProblem() {
        when(streakRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(streakRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(programOfDayRepository.findByUserAndAssignedDate(eq(testUser), any(LocalDate.class))).thenReturn(Optional.empty());
        when(problemRepository.findAll()).thenReturn(List.of(testProblem1, testProblem2));
        when(programOfDayRepository.findAssignedProblemIdsByUserId(101L)).thenReturn(List.of());
        when(programOfDayRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        ProgramOfDayDto dto = programOfDayService.getOrCreateProgramOfDay(testUser, "Asia/Kolkata");

        assertNotNull(dto);
        assertEquals("PENDING", dto.getStatus());
        assertNotNull(dto.getProblem());
        verify(programOfDayRepository, times(1)).save(any(ProgramOfDay.class));
    }

    @Test
    @DisplayName("2. Same day request returns existing same assignment")
    void getOrCreateProgramOfDay_SameDay_ReturnsSameAssignment() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        ProgramOfDay existing = ProgramOfDay.builder()
                .id(50L)
                .user(testUser)
                .codingProblem(testProblem1)
                .assignedDate(today)
                .timezone("Asia/Kolkata")
                .status("PENDING")
                .build();

        when(streakRepository.findByUser(testUser)).thenReturn(Optional.of(CodingStreak.builder().user(testUser).currentStreak(2).build()));
        when(programOfDayRepository.findByUserAndAssignedDate(testUser, today)).thenReturn(Optional.of(existing));

        ProgramOfDayDto dto = programOfDayService.getOrCreateProgramOfDay(testUser, "Asia/Kolkata");

        assertEquals(1L, dto.getProblemId());
        assertEquals("Two Sum", dto.getTitle());
        verify(programOfDayRepository, never()).save(any());
    }

    @Test
    @DisplayName("3. Accepted submission completes assignment and updates streak")
    void onProblemSubmissionAccepted_CompletesAssignmentAndIncrementsStreak() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        ProgramOfDay pod = ProgramOfDay.builder()
                .id(50L)
                .user(testUser)
                .codingProblem(testProblem1)
                .assignedDate(today)
                .status("PENDING")
                .build();

        CodingStreak streak = CodingStreak.builder()
                .id(10L)
                .user(testUser)
                .currentStreak(3)
                .longestStreak(3)
                .lastCompletedDate(today.minusDays(1))
                .build();

        when(programOfDayRepository.findByUserAndAssignedDate(testUser, today)).thenReturn(Optional.of(pod));
        when(streakRepository.findByUserIdForUpdate(101L)).thenReturn(Optional.of(streak));

        programOfDayService.onProblemSubmissionAccepted(testUser, testProblem1);

        assertEquals("COMPLETED", pod.getStatus());
        assertEquals(4, streak.getCurrentStreak());
        assertEquals(4, streak.getLongestStreak());
        assertEquals(today, streak.getLastCompletedDate());
        verify(programOfDayRepository).save(pod);
        verify(streakRepository).save(streak);
    }

    @Test
    @DisplayName("4. Multiple submissions on same day do not double-increment streak")
    void onProblemSubmissionAccepted_AlreadyCompleted_DoesNotDoubleCount() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        ProgramOfDay pod = ProgramOfDay.builder()
                .id(50L)
                .user(testUser)
                .codingProblem(testProblem1)
                .assignedDate(today)
                .status("COMPLETED")
                .build();

        when(programOfDayRepository.findByUserAndAssignedDate(testUser, today)).thenReturn(Optional.of(pod));

        programOfDayService.onProblemSubmissionAccepted(testUser, testProblem1);

        verify(streakRepository, never()).findByUserIdForUpdate(any());
    }

    @Test
    @DisplayName("5. Missed calendar day resets streak to 1 on next completion")
    void onProblemSubmissionAccepted_MissedDay_ResetsStreak() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        ProgramOfDay pod = ProgramOfDay.builder()
                .id(50L)
                .user(testUser)
                .codingProblem(testProblem1)
                .assignedDate(today)
                .status("PENDING")
                .build();

        // Missed 2 days
        CodingStreak streak = CodingStreak.builder()
                .id(10L)
                .user(testUser)
                .currentStreak(5)
                .longestStreak(5)
                .lastCompletedDate(today.minusDays(3))
                .build();

        when(programOfDayRepository.findByUserAndAssignedDate(testUser, today)).thenReturn(Optional.of(pod));
        when(streakRepository.findByUserIdForUpdate(101L)).thenReturn(Optional.of(streak));

        programOfDayService.onProblemSubmissionAccepted(testUser, testProblem1);

        assertEquals(1, streak.getCurrentStreak()); // Reset to 1
        assertEquals(5, streak.getLongestStreak()); // Longest retained
    }

    @Test
    @DisplayName("6. 7-day streak unlocks Day-7 reward entity without resetting streak")
    void onProblemSubmissionAccepted_7DayStreak_UnlocksRewardWithoutResettingStreak() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        ProgramOfDay pod = ProgramOfDay.builder()
                .id(50L)
                .user(testUser)
                .codingProblem(testProblem1)
                .assignedDate(today)
                .status("PENDING")
                .build();

        CodingStreak streak = CodingStreak.builder()
                .id(10L)
                .user(testUser)
                .currentStreak(6)
                .longestStreak(6)
                .lastCompletedDate(today.minusDays(1))
                .build();

        when(programOfDayRepository.findByUserAndAssignedDate(testUser, today)).thenReturn(Optional.of(pod));
        when(streakRepository.findByUserIdForUpdate(101L)).thenReturn(Optional.of(streak));
        when(rewardRepository.findByUserIdAndRewardTypeAndStreakLength(101L, "FREE_ATS_SCORE", 7)).thenReturn(Optional.empty());

        programOfDayService.onProblemSubmissionAccepted(testUser, testProblem1);

        assertEquals(7, streak.getCurrentStreak()); // STREAK IS RETAINED
        verify(rewardRepository).save(argThat(r ->
                "FREE_ATS_SCORE".equals(r.getRewardType()) &&
                "UNLOCKED".equals(r.getStatus()) &&
                Integer.valueOf(7).equals(r.getStreakLength()) &&
                "STREAK_7_DAY".equals(r.getSource())
        ));
    }

    @Test
    @DisplayName("7. 14-day streak unlocks second Day-14 reward entity while streak reaches 14")
    void onProblemSubmissionAccepted_14DayStreak_UnlocksSecondReward() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        ProgramOfDay pod = ProgramOfDay.builder()
                .id(51L)
                .user(testUser)
                .codingProblem(testProblem1)
                .assignedDate(today)
                .status("PENDING")
                .build();

        CodingStreak streak = CodingStreak.builder()
                .id(10L)
                .user(testUser)
                .currentStreak(13)
                .longestStreak(13)
                .lastCompletedDate(today.minusDays(1))
                .build();

        when(programOfDayRepository.findByUserAndAssignedDate(testUser, today)).thenReturn(Optional.of(pod));
        when(streakRepository.findByUserIdForUpdate(101L)).thenReturn(Optional.of(streak));
        when(rewardRepository.findByUserIdAndRewardTypeAndStreakLength(101L, "FREE_ATS_SCORE", 14)).thenReturn(Optional.empty());

        programOfDayService.onProblemSubmissionAccepted(testUser, testProblem1);

        assertEquals(14, streak.getCurrentStreak()); // STREAK REMAINS 14
        verify(rewardRepository).save(argThat(r ->
                "FREE_ATS_SCORE".equals(r.getRewardType()) &&
                "UNLOCKED".equals(r.getStatus()) &&
                Integer.valueOf(14).equals(r.getStreakLength()) &&
                "STREAK_14_DAY".equals(r.getSource())
        ));
    }

    @Test
    @DisplayName("8. Claiming reward grants ATS FeatureEntitlement record and keeps current streak intact")
    void claimReward_ValidUnlockedReward_GrantsAtsEntitlement() {
        CodingReward reward = CodingReward.builder()
                .id(88L)
                .user(testUser)
                .rewardType("FREE_ATS_SCORE")
                .source("STREAK_7_DAY")
                .streakLength(7)
                .status("UNLOCKED")
                .unlockedAt(LocalDateTime.now().minusHours(1))
                .build();

        when(rewardRepository.findByIdAndUserIdForUpdate(88L, 101L)).thenReturn(Optional.of(reward));
        when(rewardRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CodingRewardDto dto = programOfDayService.claimReward(testUser, 88L);

        assertEquals("CLAIMED", dto.getStatus());
        assertNotNull(dto.getClaimedAt());

        ArgumentCaptor<FeatureEntitlement> captor = ArgumentCaptor.forClass(FeatureEntitlement.class);
        verify(featureEntitlementRepository).save(captor.capture());

        FeatureEntitlement entitlement = captor.getValue();
        assertEquals("ATS_ANALYSIS", entitlement.getFeatureKey());
        assertEquals(1.0, entitlement.getRemainingCredits());
        assertEquals(101L, entitlement.getUserId());
        assertEquals("ACTIVE", entitlement.getStatus());
    }

    @Test
    @DisplayName("9. Repeated claim request on already claimed reward is idempotent")
    void claimReward_AlreadyClaimed_IsIdempotent() {
        LocalDateTime claimedTime = LocalDateTime.now().minusDays(1);
        CodingReward reward = CodingReward.builder()
                .id(88L)
                .user(testUser)
                .rewardType("FREE_ATS_SCORE")
                .source("STREAK_7_DAY")
                .status("CLAIMED")
                .claimedAt(claimedTime)
                .build();

        when(rewardRepository.findByIdAndUserIdForUpdate(88L, 101L)).thenReturn(Optional.of(reward));

        CodingRewardDto dto = programOfDayService.claimReward(testUser, 88L);

        assertEquals("CLAIMED", dto.getStatus());
        verify(featureEntitlementRepository, never()).save(any());
    }
}
