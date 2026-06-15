package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.auth.*;
import com.aiplacement.backend.dto.token.TokenResponse;

public interface AuthService {

    TokenResponse signup(
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
}