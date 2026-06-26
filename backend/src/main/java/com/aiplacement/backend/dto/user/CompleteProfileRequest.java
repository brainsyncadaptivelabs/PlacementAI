package com.aiplacement.backend.dto.user;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CompleteProfileRequest {
    private String collegeName;
    private String branch;
    private Integer graduationYear;
    private String dateOfBirth;
    private String fullName;
    private String linkedinUrl;
    private String githubUrl;
    private String leetcodeUrl;
    private String companyName;
    private String companyWebsite;
    private String companySize;
    private String skills;
}