package com.aiplacement.backend.dto.user;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class ConfirmDeleteRequestDto {
    @NotBlank(message = "OTP code is required")
    @Size(min = 4, max = 4, message = "OTP must be exactly 4 digits")
    private String otp;
}
