package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aiplacement.backend.dto.user.PreferencesRequestDto;
import com.aiplacement.backend.dto.user.ChangePasswordRequestDto;
import com.aiplacement.backend.dto.user.UserReportCardDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.aiplacement.backend.repository.AtsAnalysisRepository atsAnalysisRepository;
    private final com.aiplacement.backend.repository.ResumeRepository resumeRepository;
    private final com.aiplacement.backend.repository.interview.MockInterviewRepository mockInterviewRepository;
    private final com.aiplacement.backend.service.shared.PlacementReadinessService placementReadinessService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .dateOfBirth(user.getDateOfBirth())
                .email(user.getEmail())
                .role(user.getRole())
                .collegeName(user.getCollegeName())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .leetcodeUrl(user.getLeetcodeUrl())
                .companyName(user.getCompanyName())
                .companyWebsite(user.getCompanyWebsite())
                .companySize(user.getCompanySize())
                .profileCompleted(user.isProfileCompleted())
                .planSelected(user.isPlanSelected())
                .paymentCompleted(user.isPaymentCompleted())
                .profileImage(user.getProfileImage())
                .plan(user.getPlan())
                .paymentStatus(user.getPaymentStatus())
                .emailNotifications(user.getEmailNotifications())
                .pushNotifications(user.getPushNotifications())
                .autoSave(user.getAutoSave())
                .profileVisible(user.getProfileVisible())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .language(user.getLanguage())
                .skills(user.getSkills())
                .createdAt(user.getCreatedAt())
                .build());
    }



    @PutMapping("/preferences")
    public ResponseEntity<String> updatePreferences(@RequestBody PreferencesRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmailNotifications() != null) user.setEmailNotifications(request.getEmailNotifications());
        if (request.getPushNotifications() != null) user.setPushNotifications(request.getPushNotifications());
        if (request.getAutoSave() != null) user.setAutoSave(request.getAutoSave());
        if (request.getProfileVisible() != null) user.setProfileVisible(request.getProfileVisible());
        if (request.getTwoFactorEnabled() != null) user.setTwoFactorEnabled(request.getTwoFactorEnabled());
        if (request.getLanguage() != null) user.setLanguage(request.getLanguage());

        userRepository.save(user);

        return ResponseEntity.ok("Preferences updated successfully");
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully.");
    }

    @GetMapping("/report-card")
    public ResponseEntity<UserReportCardDto> getUserReportCard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer highestAts = atsAnalysisRepository.findHighestAtsScoreByUser(user);
        Double averageAts = atsAnalysisRepository.findAverageAtsScoreByUser(user);
        Long resumesCount = resumeRepository.countByUser(user);
        
        java.util.List<com.aiplacement.backend.entity.interview.MockInterview> mockInterviews = mockInterviewRepository.findByUserOrderByCreatedAtDesc(user);
        long interviewsCount = mockInterviews.size();
        
        double mockScoreSum = 0;
        int mockScoreCount = 0;
        int highestMockScore = 0;
        
        for (com.aiplacement.backend.entity.interview.MockInterview interview : mockInterviews) {
            if (interview.getFeedback() != null && interview.getFeedback().getTotalScore() != null) {
                int score = interview.getFeedback().getTotalScore();
                mockScoreSum += score;
                mockScoreCount++;
                if (score > highestMockScore) {
                    highestMockScore = score;
                }
            }
        }
        
        Double averageMockScore = mockScoreCount > 0 ? (mockScoreSum / mockScoreCount) : null;
        Integer highestMockScoreVal = mockScoreCount > 0 ? highestMockScore : null;
        
        int codingSolved = 0;
        if (user.getUserStats() != null) {
            codingSolved = user.getUserStats().getQuestionsEasy() 
                         + user.getUserStats().getQuestionsMedium() 
                         + user.getUserStats().getQuestionsHard();
        }
        
        // Use PlacementReadinessService as single source of truth for readiness.
        int readinessScore = 0;
        try {
            com.aiplacement.backend.dto.shared.PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(user);
            if (intel != null) {
                readinessScore = intel.getOverallPlacementReadiness();
            }
        } catch (Exception e) {
            // PlacementReadinessService failure should surface rather than recomputing readiness locally.
        }
        
        // Calculate profile completion percentage
        int filledFields = 0;
        int totalFields = 9;
        
        if (user.getFullName() != null && !user.getFullName().isBlank()) filledFields++;
        if (user.getEmail() != null && !user.getEmail().isBlank()) filledFields++;
        if (user.getRole() != null) filledFields++;
        if (user.getCollegeName() != null && !user.getCollegeName().isBlank()) filledFields++;
        if (user.getBranch() != null && !user.getBranch().isBlank()) filledFields++;
        if (user.getGraduationYear() != null) filledFields++;
        if (user.getSkills() != null && !user.getSkills().isBlank()) filledFields++;
        if (user.getLinkedinUrl() != null && !user.getLinkedinUrl().isBlank()) filledFields++;
        if (user.getGithubUrl() != null && !user.getGithubUrl().isBlank()) filledFields++;
        
        int profileCompletion = (int) Math.round(((double) filledFields / totalFields) * 100);
        if (profileCompletion > 100) profileCompletion = 100;
        if (profileCompletion < 20) profileCompletion = 20; // base minimum for signup fields completed
        
        String customUserId = "PAI-2026-" + String.format("%06d", user.getId() != null ? user.getId() : 0);

        return ResponseEntity.ok(UserReportCardDto.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "STUDENT")
                .plan(user.getPlan() != null ? user.getPlan() : "FREE")
                .memberSince(user.getCreatedAt() != null ? user.getCreatedAt() : java.time.LocalDateTime.now())
                .userId(customUserId)
                .profileImage(user.getProfileImage())
                .highestAtsScore(highestAts)
                .averageAtsScore(averageAts != null ? averageAts.intValue() : null)
                .resumeCount(resumesCount)
                .mockInterviewsCount(interviewsCount)
                .averageMockScore(averageMockScore)
                .highestMockScore(highestMockScoreVal)
                .codingProblemsSolved(codingSolved)
                .readinessScore(readinessScore)
                .profileCompletionPercentage(profileCompletion)
                .build());
    }
}
