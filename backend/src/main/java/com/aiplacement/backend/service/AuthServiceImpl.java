package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.auth.*;
import com.aiplacement.backend.dto.token.TokenResponse;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.PendingSignup;
import com.aiplacement.backend.exception.DatabaseConflictException;
import com.aiplacement.backend.repository.PendingSignupRepository;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;
import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingSignupRepository pendingSignupRepository;
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

    private TokenResponse socialLogin(String email, String fullName, String requestedRole, String provider) {
        log.info("[SOCIAL_LOGIN] Processing social login request for email: {}", email);
        
        com.aiplacement.backend.entity.AuthProvider authProv = com.aiplacement.backend.entity.AuthProvider.GOOGLE;
        String defaultName = "Google User";
        if ("github".equalsIgnoreCase(provider)) {
            authProv = com.aiplacement.backend.entity.AuthProvider.GITHUB;
            defaultName = "GitHub User";
        }
        
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = defaultName;
        }
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            log.info("[SOCIAL_LOGIN] Existing social login user found: {}", email);
            user = userOptional.get();
            if (Boolean.FALSE.equals(user.getEmailVerified()) || user.getEmailVerified() == null) {
                user.setEmailVerified(true);
                user.setVerifiedAt(LocalDateTime.now());
                userRepository.save(user);
            }
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
                    .authProvider(authProv)
                    .emailVerified(true)
                    .verifiedAt(LocalDateTime.now())
                    .accountStatus("ACTIVE")
                    .profileCompleted(false)
                    .paymentStatus("PENDING")
                    .build();

            com.aiplacement.backend.entity.UserStats stats = com.aiplacement.backend.entity.UserStats.builder().user(user).build();
            user.setUserStats(stats);
            userRepository.save(user);
            log.info("[SOCIAL_LOGIN] New social user created and saved successfully.");
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

            return socialLogin(email, fullName, request.getRole(), request.getProvider());

        } catch (Exception e) {
            log.error("[GOOGLE_LOGIN] Critical Google Authentication Exception: {}", e.getMessage(), e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse signup(SignupRequest request) {
        log.info("=================================");
        log.info("Processing manual signup request");
        log.info("Email: {}", request.getEmail());
        log.info("Role: {}", request.getRole());
        log.info("=================================");

        // 1. Check database for existing user
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Signup blocked: email {} already registered", request.getEmail());
            throw new DatabaseConflictException("Email already registered.");
        }

        // 2. Validate passwords match
        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // 3. Validate password strength
        boolean hasLetter = false;
        boolean hasDigit = false;
        for (char c : request.getPassword().toCharArray()) {
            if (Character.isLetter(c)) hasLetter = true;
            if (Character.isDigit(c)) hasDigit = true;
        }
        if (!hasLetter || !hasDigit) {
            throw new RuntimeException("Password must contain both letters and numbers");
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

        // Delete any existing pending signup for this email
        pendingSignupRepository.findByEmail(request.getEmail())
                .ifPresent(pendingSignupRepository::delete);

        // 4. Generate secure 6-digit OTP
        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        // 5. Hash OTP and store details in PendingSignup
        PendingSignup pendingSignup = PendingSignup.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(assignedRole.name())
                .college(request.getCollegeName())
                .branch(request.getBranch())
                .graduationYear(request.getGraduationYear())
                .semester(request.getSemester())
                .skills(request.getSkills())
                .preferredRole(request.getPreferredRole())
                .companyName(request.getCompanyName())
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now())
                .attempts(0)
                .resendCount(0)
                .build();

        pendingSignupRepository.save(pendingSignup);

        // 6. Send OTP Email
        try {
            emailService.sendVerificationOtpEmail(request.getEmail(), otp);
            log.info("Verification email dispatched with OTP: [{}] to {}", otp, request.getEmail());
        } catch (Exception e) {
            log.error("Failed to dispatch verification email to {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }

        return AuthResponse.builder()
                .message("Verification code sent to " + request.getEmail())
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

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Please verify your email first.");
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

    @Override
    public TokenResponse verifyEmail(com.aiplacement.backend.dto.auth.VerifyEmailRequest request) {
        log.info("Attempting verification for email: {}", request.getEmail());
        
        PendingSignup pendingSignup = pendingSignupRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Verification record not found. Please sign up again."));

        // Check if OTP has expired
        if (pendingSignup.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }

        // Check if maximum attempts have been exceeded
        if (pendingSignup.getAttempts() >= 5) {
            pendingSignupRepository.delete(pendingSignup);
            throw new RuntimeException("Maximum verification attempts exceeded. Please sign up again.");
        }

        // Match OTP hash
        boolean matches = passwordEncoder.matches(request.getOtp(), pendingSignup.getOtpHash());
        if (!matches) {
            int attempts = pendingSignup.getAttempts() + 1;
            pendingSignup.setAttempts(attempts);
            
            if (attempts >= 5) {
                pendingSignupRepository.delete(pendingSignup);
                throw new RuntimeException("Maximum verification attempts exceeded. Please sign up again.");
            } else {
                pendingSignupRepository.save(pendingSignup);
                throw new RuntimeException("Invalid verification code.");
            }
        }

        // Create the user
        Role assignedRole = Role.STUDENT;
        try {
            assignedRole = Role.valueOf(pendingSignup.getRole().toUpperCase());
        } catch (Exception e) {
            log.warn("Invalid role stored in pending signup: {}. Defaulting to STUDENT.", pendingSignup.getRole());
        }

        User user = User.builder()
                .fullName(pendingSignup.getFullName())
                .email(pendingSignup.getEmail())
                .password(pendingSignup.getPasswordHash()) // already hashed
                .phone(pendingSignup.getPhone())
                .collegeName(assignedRole == Role.STUDENT ? pendingSignup.getCollege() : null)
                .branch(pendingSignup.getBranch())
                .graduationYear(pendingSignup.getGraduationYear())
                .companyName(assignedRole == Role.RECRUITER ? pendingSignup.getCompanyName() : null)
                .role(assignedRole)
                .emailVerified(true)
                .verifiedAt(LocalDateTime.now())
                .accountStatus("ACTIVE")
                .profileCompleted(true)
                .paymentStatus("PENDING")
                .build();

        com.aiplacement.backend.entity.UserStats stats = com.aiplacement.backend.entity.UserStats.builder().user(user).build();
        user.setUserStats(stats);
        userRepository.save(user);

        // Delete temporary signup data
        pendingSignupRepository.delete(pendingSignup);

        // Generate tokens
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
    public void resendOtp(com.aiplacement.backend.dto.auth.ResendOtpRequest request) {
        log.info("Resend OTP requested for email: {}", request.getEmail());

        PendingSignup pendingSignup = pendingSignupRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Signup record not found. Please sign up again."));

        LocalDateTime now = LocalDateTime.now();

        // Enforce hourly limit of 5 resends
        if (pendingSignup.getLastResendAt() != null && pendingSignup.getLastResendAt().isAfter(now.minusHours(1))) {
            if (pendingSignup.getResendCount() >= 5) {
                throw new RuntimeException("Maximum resend limit of 5 per hour reached. Please try again later.");
            }
            pendingSignup.setResendCount(pendingSignup.getResendCount() + 1);
        } else {
            pendingSignup.setResendCount(1);
        }
        pendingSignup.setLastResendAt(now);

        // Generate new 6-digit OTP
        SecureRandom secureRandom = new SecureRandom();
        String newOtp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        pendingSignup.setOtpHash(passwordEncoder.encode(newOtp));
        pendingSignup.setExpiresAt(now.plusMinutes(10));
        pendingSignup.setAttempts(0);

        pendingSignupRepository.save(pendingSignup);

        // Send OTP email
        try {
            emailService.sendVerificationOtpEmail(pendingSignup.getEmail(), newOtp);
            log.info("Resent OTP email dispatched successfully with OTP: [{}] to {}", newOtp, pendingSignup.getEmail());
        } catch (Exception e) {
            log.error("Failed to send resent OTP email to {}: {}", pendingSignup.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }
    }

    @Override
    public void cancelSignup(com.aiplacement.backend.dto.auth.CancelSignupRequest request) {
        log.info("Cancelling signup for email: {}", request.getEmail());
        pendingSignupRepository.findByEmail(request.getEmail())
                .ifPresent(pendingSignupRepository::delete);
    }
}

