package com.aiplacement.backend.dto.auth;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String message;

    public AuthResponse(String message) {
        this.message = message;
    }
}