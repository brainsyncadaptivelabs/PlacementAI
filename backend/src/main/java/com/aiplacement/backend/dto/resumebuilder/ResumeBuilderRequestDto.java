package com.aiplacement.backend.dto.resumebuilder;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeBuilderRequestDto {
    private Long id;
    private String title;
    private String templateName;
    private String fullName;
    private String email;
    private String phone;
    private String linkedin;
    private String github;
    private String summary;
    private String skills;
    private String projects;
    private String experience;
    private String certifications;
    private String education;
}
