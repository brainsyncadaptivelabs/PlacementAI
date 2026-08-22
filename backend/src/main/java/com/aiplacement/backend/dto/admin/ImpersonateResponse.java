package com.aiplacement.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpersonateResponse {
    private String impersonationAccessToken;
    private String adminAccessToken;
    private String targetEmail;
    private String targetName;
    private String targetRole;
    private Long targetUserId;
    private long expiresInSeconds;
}
