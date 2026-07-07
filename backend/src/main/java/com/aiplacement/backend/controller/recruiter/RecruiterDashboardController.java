package com.aiplacement.backend.controller.recruiter;

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

/**
 * Recruiter dashboard overview — enterprise REST hierarchy.
 * Supports both plural and singular request mapping.
 */
@RestController
@RequestMapping({"/api/v1/recruiters/dashboard", "/api/v1/recruiter/dashboard"})
@RequiredArgsConstructor
public class RecruiterDashboardController {

    private final UserRepository userRepository;
    private final PlacementAnalyticsCompiler analyticsCompiler;

    @GetMapping
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User recruiter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        
        return ResponseEntity.ok(analyticsCompiler.compileRecruiterStats(recruiter.getId()));
    }
}
