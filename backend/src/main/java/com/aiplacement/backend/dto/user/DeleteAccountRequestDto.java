package com.aiplacement.backend.dto.user;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class DeleteAccountRequestDto {
    @NotBlank(message = "Password is required")
    private String password;
}
