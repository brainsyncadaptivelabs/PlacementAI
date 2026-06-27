package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aiplacement.backend.dto.user.PreferencesRequestDto;
import com.aiplacement.backend.dto.user.ChangePasswordRequestDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
}
