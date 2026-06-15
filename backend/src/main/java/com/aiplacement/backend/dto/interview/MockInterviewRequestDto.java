package com.aiplacement.backend.dto.interview;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MockInterviewRequestDto {

    private String role;

    private String experienceLevel;
}