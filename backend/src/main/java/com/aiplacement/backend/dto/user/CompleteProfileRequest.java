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
    private String linkedinUrl;
    private String githubUrl;
    private String companyName;
    private String companyWebsite;
    private String companySize;
}