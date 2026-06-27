package com.aiplacement.backend.dto.user;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

@Data
public class VerifyDeleteOtpRequestDto {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;
}
