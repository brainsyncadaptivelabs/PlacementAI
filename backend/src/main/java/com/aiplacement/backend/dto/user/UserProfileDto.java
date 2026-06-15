package com.aiplacement.backend.dto.user;

import com.aiplacement.backend.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private String fullName;
    private String email;
    private Role role;
    private String collegeName;
    private String branch;
    private Integer graduationYear;
    private String linkedinUrl;
    private String githubUrl;
    private String companyName;
    private String companyWebsite;
    private String companySize;
    private boolean profileCompleted;
    private String profileImage;
    private String plan;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
