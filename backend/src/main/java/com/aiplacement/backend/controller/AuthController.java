package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.auth.*;
import com.aiplacement.backend.dto.token.RefreshTokenRequest;
import com.aiplacement.backend.dto.token.TokenResponse;
import com.aiplacement.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<TokenResponse> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        log.info("User signup requested for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<TokenResponse> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {
        log.info("Email verification requested for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<AuthResponse> resendOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {
        log.info("OTP resend requested for email: {}", request.getEmail());
        authService.resendOtp(request);
        return ResponseEntity.ok(new AuthResponse("OTP resent successfully"));
    }

    @PostMapping("/cancel-signup")
    public ResponseEntity<AuthResponse> cancelSignup(
            @Valid @RequestBody CancelSignupRequest request
    ) {
        log.info("Signup cancellation requested for email: {}", request.getEmail());
        authService.cancelSignup(request);
        return ResponseEntity.ok(new AuthResponse("Signup cancelled successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        log.info("User login requested for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }

    @DeleteMapping("/test-clear-users")
    public ResponseEntity<String> testClearUsers() {
        // Helper endpoint for development testing
        log.info("Clearing test users from database...");
        authService.testClearUsers();
        return ResponseEntity.ok("All non-admin users deleted successfully.");
    }

    @PostMapping("/google")
    public ResponseEntity<TokenResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        log.info("User google login requested");
        return ResponseEntity.ok(authService.googleLogin(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
            @RequestBody RefreshTokenRequest request
    ) {
        return ResponseEntity.ok(
                authService.refreshToken(
                        request.getRefreshToken()
                )
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(new AuthResponse("OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(new AuthResponse("OTP verified"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new AuthResponse("Password reset successful"));
    }

    @PostMapping("/request-email-otp")
    public ResponseEntity<AuthResponse> requestEmailOtp(
            @Valid @RequestBody RequestEmailOtpRequest request
    ) {
        log.info("Email OTP requested for: {}", request.getEmail());
        authService.requestEmailOtp(request);
        return ResponseEntity.ok(new AuthResponse("OTP sent successfully to email"));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<AuthResponse> verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request
    ) {
        log.info("Email OTP verification requested for: {}", request.getEmail());
        authService.verifyEmailOtp(request);
        return ResponseEntity.ok(new AuthResponse("Email successfully verified"));
    }
}
