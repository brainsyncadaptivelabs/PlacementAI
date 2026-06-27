package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.auth.*;
import com.aiplacement.backend.dto.token.TokenResponse;

public interface AuthService {

    AuthResponse signup(
            SignupRequest request
    );

    TokenResponse login(
            LoginRequest request
    );

    TokenResponse googleLogin(
            com.aiplacement.backend.dto.auth.GoogleLoginRequest request
    );

    TokenResponse refreshToken(
            String refreshToken
    );

    void forgotPassword(ForgotPasswordRequest request);

    void verifyOtp(VerifyOtpRequest request);

    void resetPassword(ResetPasswordRequest request);

    TokenResponse verifyEmail(com.aiplacement.backend.dto.auth.VerifyEmailRequest request);

    void resendOtp(com.aiplacement.backend.dto.auth.ResendOtpRequest request);

    void cancelSignup(com.aiplacement.backend.dto.auth.CancelSignupRequest request);
}