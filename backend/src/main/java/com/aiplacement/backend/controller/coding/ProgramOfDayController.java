package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.dto.coding.CodingRewardDto;
import com.aiplacement.backend.dto.coding.CodingStreakDto;
import com.aiplacement.backend.dto.coding.ProgramOfDayDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.exception.ResourceNotFoundException;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.coding.ProgramOfDayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coding")
@RequiredArgsConstructor
@Slf4j
public class ProgramOfDayController {

    private final ProgramOfDayService programOfDayService;
    private final UserRepository userRepository;

    @GetMapping("/program-of-day")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProgramOfDayDto> getProgramOfDay(
            @RequestHeader(value = "X-Timezone", required = false) String timezoneHeader
    ) {
        User user = getAuthenticatedUser();
        ProgramOfDayDto dto = programOfDayService.getOrCreateProgramOfDay(user, timezoneHeader);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/streak")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CodingStreakDto> getStreak(
            @RequestHeader(value = "X-Timezone", required = false) String timezoneHeader
    ) {
        User user = getAuthenticatedUser();
        CodingStreakDto dto = programOfDayService.getCodingStreak(user, timezoneHeader);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/rewards")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CodingRewardDto>> getRewards() {
        User user = getAuthenticatedUser();
        List<CodingRewardDto> rewards = programOfDayService.getUserRewards(user);
        return ResponseEntity.ok(rewards);
    }

    @PostMapping("/rewards/{id}/claim")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CodingRewardDto> claimReward(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        CodingRewardDto claimed = programOfDayService.claimReward(user, id);
        return ResponseEntity.ok(claimed);
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Unauthenticated user accessing Program of the Day API");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + auth.getName()));
    }
}
