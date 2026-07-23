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
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Deprecated(since = "2.2", forRemoval = true)
@RestController
@RequestMapping({"/api/v1/recruiters/analytics", "/api/v1/recruiter/analytics"})
@RequiredArgsConstructor
public class RecruiterAnalyticsController {
    private static final Logger log = LoggerFactory.getLogger(RecruiterAnalyticsController.class);

    private final RecruiterAnalyticsService analyticsService;
    private final UserRepository userRepository;

    @Operation(deprecated = true, summary = "Deprecated endpoint – use /api/v1/recruiters/analytics instead.")
    @GetMapping
    public ResponseEntity<RecruiterAnalyticsDto> getAnalytics(HttpServletRequest request) {
        log.warn("DEPRECATED endpoint accessed: {}", request.getRequestURI());
        return ResponseEntity.ok(analyticsService.getAnalytics(currentUser().getId()));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }
}
