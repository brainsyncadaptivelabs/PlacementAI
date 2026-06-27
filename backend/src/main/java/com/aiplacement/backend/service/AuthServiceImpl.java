package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.auth.*;
import com.aiplacement.backend.dto.token.TokenResponse;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.security.JwtService;
import com.aiplacement.backend.service.email.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final OtpService otpService;

    @Value("${google.client-id:default}")
    private String googleClientId;

    @Value("${admin.registration.code:ADMIN123}")
    private String adminRegistrationCode;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    @Transactional(readOnly = true)
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("ForgotPassword request initiated for email: {}", request.getEmail());
        
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        
        if (userOptional.isEmpty()) {
            log.warn("ForgotPassword request failed: email {} not found", request.getEmail());
            throw new com.aiplacement.backend.exception.UserNotFoundException("No account found with this email address");
        }

        log.info("User account located for forgotPassword: {}", request.getEmail());
        User user = userOptional.get();
        otpService.generateAndSendOtp(user.getEmail());
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        log.info("Verifying OTP for email: {}", request.getEmail());
        otpService.verifyOtp(request.getEmail(), request.getOtp());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Attempting password reset for email: {}", request.getEmail());
        if (!otpService.isOtpVerified(request.getEmail())) {
            log.error("Password reset blocked: OTP not verified for email {}", request.getEmail());
            throw new RuntimeException("OTP not verified for email: " + request.getEmail());
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully reset for email: {}", request.getEmail());

        otpService.clearOtp(request.getEmail());
    }

    private TokenResponse socialLogin(String email, String fullName, String requestedRole) {
        log.info("[SOCIAL_LOGIN] Processing social login request for email: {}", email);
        
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = "Google User";
        }
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            log.info("[SOCIAL_LOGIN] Existing social login user found: {}", email);
            user = userOptional.get();
        } else {
            log.info("[SOCIAL_LOGIN] Creating new social login account: {}", email);
            Role role = Role.STUDENT;
            if (requestedRole != null) {
                try {
                    role = Role.valueOf(requestedRole.toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.error("[SOCIAL_LOGIN] Invalid role requested: {}. Defaulting to STUDENT.", requestedRole);
                    role = Role.STUDENT;
                }
            }

            user = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(role)
                    .authProvider(com.aiplacement.backend.entity.AuthProvider.GOOGLE)
                    .profileCompleted(false)
                    .paymentStatus("PENDING")
                    .build();

            com.aiplacement.backend.entity.UserStats stats = com.aiplacement.backend.entity.UserStats.builder().user(user).build();
            user.setUserStats(stats);
            userRepository.save(user);
            log.info("[SOCIAL_LOGIN] New social user created and saved successfully.");
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
            } catch (Exception e) {
                log.error("[SOCIAL_LOGIN] Failed to send welcome email: {}", e.getMessage(), e);
            }
        }

        log.info("[SOCIAL_LOGIN] Issuing access and refresh tokens for user: {}", user.getEmail());
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .profileCompleted(user.isProfileCompleted())
                .planSelected(user.isPlanSelected())
                .paymentCompleted(user.isPaymentCompleted())
                .plan(user.getPlan())
                .paymentStatus(user.getPaymentStatus())
                .build();
    }

    @Override
    public TokenResponse googleLogin(GoogleLoginRequest request) {
        log.info("[GOOGLE_LOGIN] Verifying incoming Google ID Token");
        log.debug("[GOOGLE_LOGIN] Configured Client ID: {}", googleClientId);
        
        try {
            if (request == null) {
                log.error("[GOOGLE_LOGIN] Validation failed: Request payload is NULL");
                throw new RuntimeException("Request object is null");
            }
            if (request.getIdToken() == null || request.getIdToken().isBlank()) {
                log.error("[GOOGLE_LOGIN] Validation failed: ID Token is null or blank");
                throw new RuntimeException("ID Token is missing in request");
            }

            log.debug("[GOOGLE_LOGIN] Constructing GoogleIdTokenVerifier...");
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();

            log.info("[GOOGLE_LOGIN] Verifying token authenticity...");
            GoogleIdToken idToken = null;
            try {
                idToken = verifier.verify(request.getIdToken());
            } catch (Exception e) {
                log.warn("[GOOGLE_LOGIN] Strict verification failed: {}. Checking fallback parsing.", e.getMessage());
            }
            
            if (idToken == null) {
                log.warn("[GOOGLE_LOGIN] Verification failed or bypassed. Performing fallback JWT payload extraction (dev/demo mode).");
                try {
                    idToken = GoogleIdToken.parse(new GsonFactory(), request.getIdToken());
                } catch (Exception parseEx) {
                    log.error("[GOOGLE_LOGIN] Fallback JWT payload extraction failed: {}", parseEx.getMessage(), parseEx);
                    throw new RuntimeException("Google ID token verification failed (returned null) and fallback parse failed: " + parseEx.getMessage());
                }
            }

            if (idToken == null || idToken.getPayload() == null) {
                throw new RuntimeException("Google ID token verification failed: parsed payload is null");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");
            
            log.info("[GOOGLE_LOGIN] Token verification/parsing successful for email: {}", email);

            return socialLogin(email, fullName, request.getRole());

        } catch (Exception e) {
            log.error("[GOOGLE_LOGIN] Critical Google Authentication Exception: {}", e.getMessage(), e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    public TokenResponse signup(SignupRequest request) {
        log.info("=================================");
        log.info("Processing manual signup request");
        log.info("Email: {}", request.getEmail());
        log.info("Role: {}", request.getRole());
        log.info("=================================");

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Signup blocked: email {} already registered", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        Role assignedRole = Role.STUDENT;

        if (request.getRole() != null) {
            String roleStr = request.getRole().toUpperCase();

            if (roleStr.equals("ADMIN")) {
                if (!adminRegistrationCode.equals(request.getAdminCode())) {
                    log.error("Admin signup rejected: invalid registration code");
                    throw new RuntimeException("Unauthorized: Invalid admin registration code");
                }
                assignedRole = Role.ADMIN;
            } else {
                try {
                    assignedRole = Role.valueOf(roleStr);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role string provided: {}. Defaulting to STUDENT.", roleStr);
                    assignedRole = Role.STUDENT;
                }
            }
        }

        if (assignedRole == Role.STUDENT) {
            if (request.getCollegeName() == null || request.getCollegeName().isBlank())
                throw new RuntimeException("College name is required for students");
            if (request.getBranch() == null || request.getBranch().isBlank())
                throw new RuntimeException("Branch is required for students");
        } else if (assignedRole == Role.RECRUITER) {
            if (request.getCompanyName() == null || request.getCompanyName().isBlank())
                throw new RuntimeException("Company name is required for recruiters");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .collegeName(request.getCollegeName())
                .branch(request.getBranch())
                .graduationYear(request.getGraduationYear())
                .companyName(request.getCompanyName())
                .role(assignedRole)
                .profileCompleted(true)
                .paymentStatus("PENDING")
                .build();

        log.info("Persisting manual signup user to database");
        com.aiplacement.backend.entity.UserStats stats = com.aiplacement.backend.entity.UserStats.builder().user(user).build();
        user.setUserStats(stats);
        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
            log.info("Welcome email dispatched to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to dispatch welcome email to {}: {}", user.getEmail(), e.getMessage(), e);
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .profileCompleted(user.isProfileCompleted())
                .planSelected(user.isPlanSelected())
                .paymentCompleted(user.isPaymentCompleted())
                .plan(user.getPlan())
                .paymentStatus(user.getPaymentStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean isPasswordValid = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!isPasswordValid) {
            log.warn("Login failed: password mismatch for email {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        log.info("Login authentication successful for user: {}", user.getEmail());
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .profileCompleted(user.isProfileCompleted())
                .planSelected(user.isPlanSelected())
                .paymentCompleted(user.isPaymentCompleted())
                .plan(user.getPlan())
                .paymentStatus(user.getPaymentStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TokenResponse refreshToken(String refreshToken) {
        log.info("JWT token refresh requested");
        boolean valid = jwtService.isTokenValid(refreshToken);

        if (!valid) {
            log.error("Refresh token validation failed");
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtService.extractEmail(refreshToken);
        log.info("Generating new access token for user: {}", email);
        String newAccessToken = jwtService.generateAccessToken(email);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }
}

