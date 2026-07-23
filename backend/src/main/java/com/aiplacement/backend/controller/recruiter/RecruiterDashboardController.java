package com.aiplacement.backend.controller.recruiter;

// IDE refresh trigger

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementAnalyticsCompiler;
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

/**
 * Recruiter dashboard overview — enterprise REST hierarchy.
 * Supports both plural and singular request mapping.
 */
@Deprecated(since = "2.2", forRemoval = true)
@RestController
@RequestMapping({"/api/v1/recruiters/dashboard", "/api/v1/recruiter/dashboard"})
@RequiredArgsConstructor
public class RecruiterDashboardController {
    private static final Logger log = LoggerFactory.getLogger(RecruiterDashboardController.class);

    private final UserRepository userRepository;
    private final PlacementAnalyticsCompiler analyticsCompiler;

    @Operation(deprecated = true, summary = "Deprecated endpoint – use /api/v1/recruiters/dashboard instead.")
    @GetMapping
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats(HttpServletRequest request) {
        log.warn("DEPRECATED endpoint accessed: {}", request.getRequestURI());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        return ResponseEntity.ok(analyticsCompiler.compileRecruiterStats(recruiter.getId()));
    }
}
