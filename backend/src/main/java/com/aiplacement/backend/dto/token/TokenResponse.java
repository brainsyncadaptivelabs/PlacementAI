package com.aiplacement.backend.dto.token;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TokenResponse {

    private String accessToken;

    private String refreshToken;

    private String role;

    private boolean profileCompleted;

    private String plan;

    private String paymentStatus;
}