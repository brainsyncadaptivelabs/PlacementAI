package com.aiplacement.backend.dto.user;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class GoogleDeleteAccountRequestDto {
    @NotBlank(message = "Google ID Token is required")
    private String idToken;
}
