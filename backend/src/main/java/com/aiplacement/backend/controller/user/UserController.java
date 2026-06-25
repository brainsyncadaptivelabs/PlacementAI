package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserProfileDto.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .collegeName(user.getCollegeName())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .companyName(user.getCompanyName())
                .companyWebsite(user.getCompanyWebsite())
                .companySize(user.getCompanySize())
                .profileCompleted(user.isProfileCompleted())
                .planSelected(user.isPlanSelected())
                .paymentCompleted(user.isPaymentCompleted())
                .profileImage(user.getProfileImage())
                .plan(user.getPlan())
                .paymentStatus(user.getPaymentStatus())
                .createdAt(user.getCreatedAt())
                .build());
    }
}
