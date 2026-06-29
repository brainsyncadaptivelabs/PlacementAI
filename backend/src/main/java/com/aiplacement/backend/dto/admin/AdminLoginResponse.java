package com.aiplacement.backend.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoginResponse {
    private String token;
    private String email;
    private String role;
}
