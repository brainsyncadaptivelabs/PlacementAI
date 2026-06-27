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

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotBlank(message = "Phone number is required")
    @jakarta.validation.constraints.Pattern(
            regexp = "^\\+?[0-9]{10,15}$",
            message = "Invalid phone number format"
    )
    private String phone;

    private String collegeName;

    private String branch;

    @jakarta.validation.constraints.Min(value = 1900, message = "Invalid graduation year")
    @jakarta.validation.constraints.Max(value = 2100, message = "Invalid graduation year")
    private Integer graduationYear;

    private Integer semester;

    private String skills;

    private String preferredRole;

    private String companyName;

    private String role;

    private String adminCode; // Secret code for admin registration
}