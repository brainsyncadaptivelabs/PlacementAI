package com.aiplacement.backend.dto.compare;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ResumeCompareRequestDto {

    private String resume1;

    private String resume2;
}