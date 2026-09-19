package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodingRewardDto;
import com.aiplacement.backend.dto.coding.CodingStreakDto;
import com.aiplacement.backend.dto.coding.ProblemDto;
import com.aiplacement.backend.dto.coding.ProgramOfDayDto;
import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingReward;
import com.aiplacement.backend.entity.coding.CodingStreak;
import com.aiplacement.backend.entity.coding.ProgramOfDay;
import com.aiplacement.backend.exception.ResourceNotFoundException;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
import com.aiplacement.backend.repository.coding.CodingRewardRepository;
import com.aiplacement.backend.repository.coding.CodingStreakRepository;
import com.aiplacement.backend.repository.coding.ProgramOfDayRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgramOfDayServiceImpl implements ProgramOfDayService {

    public static final String DEFAULT_TIMEZONE = "Asia/Kolkata";
    public static final String REWARD_TYPE_FREE_ATS = "FREE_ATS_SCORE";
    public static final String REWARD_SOURCE_7_DAY = "STREAK_7_DAY";

    private final ProgramOfDayRepository programOfDayRepository;
    private final CodingStreakRepository streakRepository;
    private final CodingRewardRepository rewardRepository;
    private final CodingProblemRepository problemRepository;
    private final FeatureEntitlementRepository featureEntitlementRepository;

    @Override
    @Transactional
    public ProgramOfDayDto getOrCreateProgramOfDay(User user, String timezoneHeader) {
        ZoneId zoneId = resolveUserZoneId(user, timezoneHeader);
        LocalDate today = resolveUserToday(user, timezoneHeader);

        // Calculate and sync streak status for missed days
        CodingStreak streak = syncUserStreak(user, today);

        // Check if Program of the Day already assigned for today
        ProgramOfDay assignment = programOfDayRepository.findByUserAndAssignedDate(user, today)
                .orElseGet(() -> assignNewProgramOfDay(user, today, zoneId));

        return mapToProgramOfDayDto(assignment, streak, zoneId, today);
    }

    @Override
    @Transactional(readOnly = true)
    public CodingStreakDto getCodingStreak(User user, String timezoneHeader) {
        LocalDate today = resolveUserToday(user, timezoneHeader);
        CodingStreak streak = streakRepository.findByUser(user).orElse(null);

        int currentStreak = 0;
        int longestStreak = 0;
        LocalDate lastCompleted = null;
        boolean completedToday = false;

        if (streak != null) {
            currentStreak = streak.getCurrentStreak() != null ? streak.getCurrentStreak() : 0;
            longestStreak = streak.getLongestStreak() != null ? streak.getLongestStreak() : 0;
            lastCompleted = streak.getLastCompletedDate();

            // Check if streak is broken by missed calendar days
            if (lastCompleted != null && lastCompleted.isBefore(today.minusDays(1))) {
                currentStreak = 0;
            }
            if (today.equals(lastCompleted)) {
                completedToday = true;
            }
        }

        // Weekly calendar array Mon-Sun for current week
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        List<CodingStreakDto.DayStatus> calendar = new ArrayList<>();
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};

        Set<LocalDate> completedDates = getCompletedDatesForUser(user, monday, monday.plusDays(6));

        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            boolean done = completedDates.contains(d);
            calendar.add(CodingStreakDto.DayStatus.builder()
                    .dayName(dayNames[i])
                    .date(d)
                    .completed(done)
                    .isToday(d.equals(today))
                    .build());
        }

        int daysToNextReward = REWARD_MILESTONE_INTERVAL - (currentStreak % REWARD_MILESTONE_INTERVAL);
        List<CodingReward> userRewards = rewardRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        boolean rewardAvailable = userRewards.stream().anyMatch(r -> "UNLOCKED".equalsIgnoreCase(r.getStatus()));

        return CodingStreakDto.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .lastCompletedDate(lastCompleted)
                .completedToday(completedToday)
                .weeklyCalendar(calendar)
                .daysToNextReward(daysToNextReward)
                .rewardAvailable(rewardAvailable)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CodingRewardDto> getUserRewards(User user) {
        List<CodingReward> rewards = rewardRepository.findByUserOrderByCreatedAtDesc(user);
        return rewards.stream().map(this::mapToRewardDto).toList();
    }

    @Override
    @Transactional
    public CodingRewardDto claimReward(User user, Long rewardId) {
        CodingReward reward = rewardRepository.findByIdAndUserIdForUpdate(rewardId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found or does not belong to user with ID: " + rewardId));

        if ("CLAIMED".equalsIgnoreCase(reward.getStatus())) {
            log.info("[CODING_REWARD] Reward {} already claimed by user {}", rewardId, user.getId());
            return mapToRewardDto(reward);
        }

        if (!"UNLOCKED".equalsIgnoreCase(reward.getStatus())) {
            throw new IllegalStateException("Reward is not in UNLOCKED state for claim.");
        }

        // Grant real ATS Analysis Entitlement
        grantAtsScanEntitlement(user, reward);

        reward.setStatus("CLAIMED");
        reward.setClaimedAt(LocalDateTime.now());
        reward = rewardRepository.save(reward);

        log.info("[CODING_REWARD] User {} successfully claimed reward {} (Type: {})", user.getId(), reward.getId(), reward.getRewardType());
        return mapToRewardDto(reward);
    }

    @Override
    @Transactional
    public void onProblemSubmissionAccepted(User user, CodingProblem problem) {
        if (user == null || problem == null) return;

        LocalDate today = resolveUserToday(user, null);

        // Find today's Program of the Day assignment
        Optional<ProgramOfDay> optPod = programOfDayRepository.findByUserAndAssignedDate(user, today);
        if (optPod.isEmpty()) {
            return;
        }

        ProgramOfDay pod = optPod.get();
        if (!pod.getCodingProblem().getId().equals(problem.getId())) {
            log.debug("[PROGRAM_OF_DAY] User {} submitted problem {} which is not today's Program of the Day ({})",
                    user.getId(), problem.getId(), pod.getCodingProblem().getId());
            return;
        }

        // If already completed today, do not double-increment streak
        if ("COMPLETED".equalsIgnoreCase(pod.getStatus())) {
            log.debug("[PROGRAM_OF_DAY] Program of the Day already completed today for user {}", user.getId());
            return;
        }

        // 1. Mark Program of the Day as COMPLETED
        pod.setStatus("COMPLETED");
        pod.setCompletedAt(LocalDateTime.now());
        programOfDayRepository.save(pod);

        // 2. Update Streak atomically
        CodingStreak streak = streakRepository.findByUserIdForUpdate(user.getId())
                .orElseGet(() -> CodingStreak.builder().user(user).currentStreak(0).longestStreak(0).build());

        LocalDate lastCompleted = streak.getLastCompletedDate();
        int newStreak;

        if (lastCompleted == null) {
            newStreak = 1;
        } else if (today.equals(lastCompleted.plusDays(1))) {
            newStreak = streak.getCurrentStreak() + 1;
        } else if (today.equals(lastCompleted)) {
            newStreak = streak.getCurrentStreak(); // Same day submission, keep same
        } else {
            newStreak = 1; // Missed day reset
        }

        streak.setCurrentStreak(newStreak);
        streak.setLongestStreak(Math.max(streak.getLongestStreak() != null ? streak.getLongestStreak() : 0, newStreak));
        streak.setLastCompletedDate(today);
        streakRepository.save(streak);

        log.info("[CODING_STREAK] User {} completed Program of the Day! Current Streak: {}", user.getId(), newStreak);

        // 3. Reward Eligibility Check (recurring every REWARD_INTERVAL days, default 7)
        if (newStreak > 0 && newStreak % REWARD_MILESTONE_INTERVAL == 0) {
            checkAndUnlockReward(user, newStreak);
        }
    }

    @Override
    public ZoneId resolveUserZoneId(User user, String timezoneHeader) {
        if (timezoneHeader != null && !timezoneHeader.isBlank()) {
            try {
                return ZoneId.of(timezoneHeader.trim());
            } catch (Exception ignored) {}
        }
        return ZoneId.of(DEFAULT_TIMEZONE);
    }

    @Override
    public LocalDate resolveUserToday(User user, String timezoneHeader) {
        ZoneId zoneId = resolveUserZoneId(user, timezoneHeader);
        return LocalDate.now(zoneId);
    }

    private CodingStreak syncUserStreak(User user, LocalDate today) {
        CodingStreak streak = streakRepository.findByUser(user).orElse(null);
        if (streak == null) {
            streak = streakRepository.save(CodingStreak.builder()
                    .user(user)
                    .currentStreak(0)
                    .longestStreak(0)
                    .build());
        } else if (streak.getLastCompletedDate() != null && streak.getLastCompletedDate().isBefore(today.minusDays(1))) {
            if (streak.getCurrentStreak() != 0) {
                streak.setCurrentStreak(0);
                streak = streakRepository.save(streak);
            }
        }
        return streak;
    }

    private ProgramOfDay assignNewProgramOfDay(User user, LocalDate today, ZoneId zoneId) {
        List<CodingProblem> allProblems = problemRepository.findAll();
        if (allProblems.isEmpty()) {
            throw new IllegalStateException("No coding problems available in database for Program of the Day assignment.");
        }

        // Exclude recently assigned problems to avoid repetitive assignments
        List<Long> previouslyAssigned = programOfDayRepository.findAssignedProblemIdsByUserId(user.getId());

        List<CodingProblem> eligible = allProblems.stream()
                .filter(p -> !previouslyAssigned.contains(p.getId()))
                .toList();

        if (eligible.isEmpty()) {
            eligible = allProblems; // Fall back to full problem set if all have been assigned at least once
        }

        // Deterministic candidate-specific hash selection: (userId + epochDay) % eligible.size()
        long epochDay = today.toEpochDay();
        int selectedIndex = (int) (Math.abs((user.getId() * 31 + epochDay * 17)) % eligible.size());
        CodingProblem selectedProblem = eligible.get(selectedIndex);

        ProgramOfDay pod = ProgramOfDay.builder()
                .user(user)
                .codingProblem(selectedProblem)
                .assignedDate(today)
                .timezone(zoneId.getId())
                .status("PENDING")
                .build();

        try {
            return programOfDayRepository.save(pod);
        } catch (Exception ex) {
            log.debug("Concurrent ProgramOfDay assignment handled for user {} date {}: {}", user.getId(), today, ex.getMessage());
            return programOfDayRepository.findByUserAndAssignedDate(user, today)
                    .orElseThrow(() -> new IllegalStateException("Failed to assign or retrieve ProgramOfDay", ex));
        }
    }

    private Set<LocalDate> getCompletedDatesForUser(User user, LocalDate start, LocalDate end) {
        List<ProgramOfDay> list = programOfDayRepository.findByUserOrderByAssignedDateDesc(user);
        Set<LocalDate> dates = new HashSet<>();
        for (ProgramOfDay p : list) {
            if ("COMPLETED".equalsIgnoreCase(p.getStatus()) && !p.getAssignedDate().isBefore(start) && !p.getAssignedDate().isAfter(end)) {
                dates.add(p.getAssignedDate());
            }
        }
        return dates;
    }

    private static final int REWARD_MILESTONE_INTERVAL = 7;

    private void checkAndUnlockReward(User user, int streakLength) {
        String milestoneSource = "STREAK_" + streakLength + "_DAY";
        Optional<CodingReward> existing = rewardRepository.findByUserIdAndRewardTypeAndStreakLength(
                user.getId(), REWARD_TYPE_FREE_ATS, streakLength
        );

        if (existing.isEmpty()) {
            CodingReward reward = CodingReward.builder()
                    .user(user)
                    .rewardType(REWARD_TYPE_FREE_ATS)
                    .source(milestoneSource)
                    .streakLength(streakLength)
                    .status("UNLOCKED")
                    .unlockedAt(LocalDateTime.now())
                    .build();
            try {
                rewardRepository.save(reward);
                log.info("[CODING_REWARD] Unlocked {}-Day Coding Streak reward for user {}", streakLength, user.getId());
            } catch (Exception ex) {
                log.debug("Concurrent reward creation handled for user {} streak {}: {}", user.getId(), streakLength, ex.getMessage());
            }
        }
    }

    private void grantAtsScanEntitlement(User user, CodingReward reward) {
        String featureKey = "ATS_ANALYSIS";
        LocalDateTime now = LocalDateTime.now();

        FeatureEntitlement entitlement = FeatureEntitlement.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .featureKey(featureKey)
                .featureName("Free ATS Resume Scan (" + reward.getStreakLength() + "-Day Streak Reward)")
                .purchasedCredits(1.0)
                .usedCredits(0.0)
                .remainingCredits(1.0)
                .unit("SCANS")
                .purchaseDate(now)
                .expiryDate(now.plusYears(1)) // Valid for 1 year
                .status("ACTIVE")
                .razorpayOrderId("REWARD_STREAK_" + reward.getId())
                .razorpayPaymentId("STREAK_" + reward.getStreakLength() + "_DAY_" + UUID.randomUUID().toString().substring(0, 8))
                .build();

        featureEntitlementRepository.save(entitlement);
        log.info("[CODING_REWARD] Granted 1.0 free ATS_ANALYSIS credit to user {} for milestone {}-day streak via entitlement ID {}",
                user.getId(), reward.getStreakLength(), entitlement.getId());
    }

    private ProgramOfDayDto mapToProgramOfDayDto(ProgramOfDay pod, CodingStreak streak, ZoneId zoneId, LocalDate today) {
        ZonedDateTime resetTime = today.plusDays(1).atStartOfDay(zoneId);
        long secondsUntilReset = Math.max(0L, Duration.between(ZonedDateTime.now(zoneId), resetTime).getSeconds());

        CodingProblem p = pod.getCodingProblem();
        List<String> tags = p.getTags() != null ? Arrays.asList(p.getTags().split("\\s*,\\s*")) : List.of();

        ProblemDto problemDto = ProblemDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .problemStatement(p.getProblemStatement())
                .constraints(p.getConstraints())
                .examples(p.getExamples())
                .hints(p.getHints())
                .difficulty(p.getDifficulty() != null ? p.getDifficulty() : "Easy")
                .tags(tags)
                .build();

        List<CodingReward> userRewards = rewardRepository.findByUserIdOrderByCreatedAtDesc(pod.getUser().getId());
        boolean rewardAvail = userRewards.stream().anyMatch(r -> "UNLOCKED".equalsIgnoreCase(r.getStatus()));

        return ProgramOfDayDto.builder()
                .id(pod.getId())
                .problemId(p.getId())
                .title(p.getTitle())
                .difficulty(p.getDifficulty() != null ? p.getDifficulty() : "Easy")
                .tags(tags)
                .assignedDate(pod.getAssignedDate())
                .timezone(pod.getTimezone())
                .status(pod.getStatus())
                .secondsUntilReset(secondsUntilReset)
                .currentStreak(streak != null ? streak.getCurrentStreak() : 0)
                .longestStreak(streak != null ? streak.getLongestStreak() : 0)
                .isRewardAvailable(rewardAvail)
                .problem(problemDto)
                .build();
    }

    private CodingRewardDto mapToRewardDto(CodingReward r) {
        String title = "FREE_ATS_SCORE".equalsIgnoreCase(r.getRewardType()) ? "1 Free Resume ATS Scan (" + r.getStreakLength() + "-Day Milestone)" : "PlacementAI Reward";
        String desc = "Unlocked by completing a " + r.getStreakLength() + "-day coding streak on PlacementAI!";

        return CodingRewardDto.builder()
                .id(r.getId())
                .rewardType(r.getRewardType())
                .title(title)
                .description(desc)
                .source(r.getSource())
                .streakLength(r.getStreakLength())
                .status(r.getStatus())
                .unlockedAt(r.getUnlockedAt())
                .claimedAt(r.getClaimedAt())
                .build();
    }
}
