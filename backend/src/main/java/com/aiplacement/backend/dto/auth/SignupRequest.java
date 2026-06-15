package com.aiplacement.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SignupRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(
            min = 6,
            message = "Password must be at least 6 characters"
    )
    private String password;

    private String collegeName;

    private String branch;

    private Integer graduationYear;

    private String companyName;

    private String role;

    private String adminCode; // Secret code for admin registration
}