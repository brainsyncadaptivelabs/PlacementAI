package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodingRewardDto;
import com.aiplacement.backend.dto.coding.CodingStreakDto;
import com.aiplacement.backend.dto.coding.ProgramOfDayDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingProblem;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

public interface ProgramOfDayService {

    ProgramOfDayDto getOrCreateProgramOfDay(User user, String timezoneHeader);

    CodingStreakDto getCodingStreak(User user, String timezoneHeader);

    List<CodingRewardDto> getUserRewards(User user);

    CodingRewardDto claimReward(User user, Long rewardId);

    void onProblemSubmissionAccepted(User user, CodingProblem problem);

    ZoneId resolveUserZoneId(User user, String timezoneHeader);

    LocalDate resolveUserToday(User user, String timezoneHeader);
}
