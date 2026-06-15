package com.aiplacement.backend.dto.token;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RefreshTokenRequest {

    private String refreshToken;
}