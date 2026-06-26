package com.aiplacement.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesRequestDto {
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean autoSave;
    private Boolean profileVisible;
    private Boolean twoFactorEnabled;
    private String language;
}
