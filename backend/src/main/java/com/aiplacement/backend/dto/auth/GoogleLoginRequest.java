package com.aiplacement.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleLoginRequest {
    @JsonProperty("idToken")
    @NotBlank(message = "Google ID token is required")
    private String idToken;
    
    private String role;

    private String provider;
}
