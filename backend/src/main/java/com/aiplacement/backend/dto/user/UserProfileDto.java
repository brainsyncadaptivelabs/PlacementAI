package com.aiplacement.backend.dto.user;

import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.AuthProvider;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String fullName;
    private String dateOfBirth;
    private String email;
    private Role role;
    private AuthProvider authProvider;
    private String collegeName;
    private String branch;
    private Integer graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private String leetcodeUrl;
    private String companyName;
    private String companyWebsite;
    private String companySize;
    private String skills;
    private boolean profileCompleted;
    private boolean planSelected;
    private boolean paymentCompleted;
    private String profileImage;
    private String plan;
    private String paymentStatus;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean autoSave;
    private Boolean profileVisible;
    private Boolean twoFactorEnabled;
    private String language;
    private LocalDateTime createdAt;
}
