package com.aiplacement.backend.dto.interview;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MockInterviewResponseDto {

    private String role;

    private List<String> questions;

    private List<String> tips;
}