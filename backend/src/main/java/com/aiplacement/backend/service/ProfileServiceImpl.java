package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.user.CompleteProfileRequest;
import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.aiplacement.backend.dto.profile.ProfileDashboardStatsDto;
import com.aiplacement.backend.entity.UserStats;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void completeStudentProfile(CompleteProfileRequest request) {
        if (request.getCollegeName() == null || request.getCollegeName().isBlank()) throw new IllegalArgumentException("College name is required");
        if (request.getBranch() == null || request.getBranch().isBlank()) throw new IllegalArgumentException("Branch is required");
        if (request.getGraduationYear() == null) throw new IllegalArgumentException("Graduation year is required");

        User user = getCurrentUser();
        user.setRole(Role.STUDENT);
        user.setCollegeName(request.getCollegeName());
        user.setBranch(request.getBranch());
        user.setGraduationYear(request.getGraduationYear());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLeetcodeUrl() != null) user.setLeetcodeUrl(request.getLeetcodeUrl());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        
        user.setProfileCompleted(true);
        userRepository.save(user);
    }

    @Override
    public void completeRecruiterProfile(CompleteProfileRequest request) {
        if (request.getCompanyName() == null || request.getCompanyName().isBlank()) throw new IllegalArgumentException("Company name is required");

        User user = getCurrentUser();
        user.setRole(Role.RECRUITER);
        user.setCompanyName(request.getCompanyName());
        if (request.getCompanyWebsite() != null) user.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getCompanySize() != null) user.setCompanySize(request.getCompanySize());
        
        user.setProfileCompleted(true);
        userRepository.save(user);
    }

    @Override
    public UserProfileDto getMyProfile() {
        User user = getCurrentUser();
        return UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .dateOfBirth(user.getDateOfBirth())
                .email(user.getEmail())
                .role(user.getRole())
                  .authProvider(user.getAuthProvider())
                .collegeName(user.getCollegeName())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .leetcodeUrl(user.getLeetcodeUrl())
                .companyName(user.getCompanyName())
                .companyWebsite(user.getCompanyWebsite())
                .companySize(user.getCompanySize())
                .skills(user.getSkills())
                .profileCompleted(user.isProfileCompleted())
                .planSelected(user.isPlanSelected())
                .paymentCompleted(user.isPaymentCompleted())
                .profileImage(user.getProfileImage())
                .plan(user.getPlan())
                .paymentStatus(user.getPaymentStatus())
                .build();
    }

    @Override
    public UserProfileDto getPublicProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                  .authProvider(user.getAuthProvider())
                .collegeName(user.getCollegeName())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .leetcodeUrl(user.getLeetcodeUrl())
                .companyName(user.getCompanyName())
                .companyWebsite(user.getCompanyWebsite())
                .companySize(user.getCompanySize())
                .skills(user.getSkills())
                .profileCompleted(user.isProfileCompleted())
                .profileImage(user.getProfileImage())
                .build();
    }

    @Override
    public void updateProfile(CompleteProfileRequest request) {
        User user = getCurrentUser();
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getCollegeName() != null) user.setCollegeName(request.getCollegeName());
        if (request.getBranch() != null) user.setBranch(request.getBranch());
        if (request.getGraduationYear() != null) user.setGraduationYear(request.getGraduationYear());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLeetcodeUrl() != null) user.setLeetcodeUrl(request.getLeetcodeUrl());
        if (request.getCompanyName() != null) user.setCompanyName(request.getCompanyName());
        if (request.getCompanyWebsite() != null) user.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getCompanySize() != null) user.setCompanySize(request.getCompanySize());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        userRepository.save(user);
    }

    @Override
    public ProfileDashboardStatsDto getDashboardStats() {
        User user = getCurrentUser();
        UserStats stats = user.getUserStats();
        
        // If stats is null (for older users before migration), create default
        if (stats == null) {
            stats = UserStats.builder()
                .user(user)
                .activityStreakDays(5)
                .questionsEasy(111)
                .questionsMedium(6)
                .questionsHard(0)
                .resumeVerified(true)
                .build();
            user.setUserStats(stats);
            userRepository.save(user);
        } else if (stats.getActivityStreakDays() == 0) {
            stats.setActivityStreakDays(5);
            stats.setQuestionsEasy(111);
            stats.setQuestionsMedium(6);
            stats.setQuestionsHard(0);
            stats.setResumeVerified(true);
            userRepository.save(user);
        }

        java.util.List<ProfileDashboardStatsDto.ActivityLogDto> heatmapData = user.getActivityLogs().stream()
            .map(log -> ProfileDashboardStatsDto.ActivityLogDto.builder()
                .date(log.getActivityDate().toString())
                .durationMinutes(log.getDurationMinutes())
                .build())
            .collect(Collectors.toList());

        return ProfileDashboardStatsDto.builder()
            .activityStreakDays(stats.getActivityStreakDays())
            .questionsEasy(stats.getQuestionsEasy())
            .questionsMedium(stats.getQuestionsMedium())
            .questionsHard(stats.getQuestionsHard())
            .resumeVerified(stats.isResumeVerified())
            .heatmapData(heatmapData)
            .build();
    }
}
