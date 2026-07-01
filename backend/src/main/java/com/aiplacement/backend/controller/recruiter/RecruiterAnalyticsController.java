package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.RecruiterAnalyticsDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.recruiter.RecruiterAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recruiters/analytics")
@RequiredArgsConstructor
public class RecruiterAnalyticsController {

    private final RecruiterAnalyticsService analyticsService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<RecruiterAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics(currentUser().getId()));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }
}
