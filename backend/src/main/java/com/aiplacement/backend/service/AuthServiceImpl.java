package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.auth.*;
import com.aiplacement.backend.dto.token.TokenResponse;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.PendingSignup;
import com.aiplacement.backend.entity.EmailVerificationOtp;
import com.aiplacement.backend.exception.DatabaseConflictException;
import com.aiplacement.backend.repository.EmailVerificationOtpRepository;
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
    private final EmailVerificationOtpRepository emailVerificationOtpRepository;

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
        
        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(request.getEmail());
        
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

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully reset for email: {}", request.getEmail());

        otpService.clearOtp(request.getEmail());
    }

    private TokenResponse socialLogin(String email, String fullName, String requestedRole, String provider) {
        boolean isGitHub = "github".equalsIgnoreCase(provider);
        if (isGitHub) {
            log.info("Github login started");
        } else {
            log.info("Google login started");
        }

        log.info("Checking existing user");

        com.aiplacement.backend.entity.AuthProvider authProv = com.aiplacement.backend.entity.AuthProvider.GOOGLE;
        String defaultName = "Google User";
        if (isGitHub) {
            authProv = com.aiplacement.backend.entity.AuthProvider.GITHUB;
            defaultName = "GitHub User";
        }

        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = defaultName;
        }

        User user = null;
        try {
            Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);
            if (userOptional.isPresent()) {
                log.info("Existing user found");
                user = userOptional.get();
                boolean changed = false;

                if (user.getAuthProvider() != authProv) {
                    log.info("Updating provider information");
                    user.setAuthProvider(authProv);
                    changed = true;
                }

                if (Boolean.FALSE.equals(user.getEmailVerified()) || user.getEmailVerified() == null) {
                    user.setEmailVerified(true);
                    user.setVerifiedAt(LocalDateTime.now());
                    changed = true;
                }

                if (!"ACTIVE".equals(user.getAccountStatus())) {
                    user.setAccountStatus("ACTIVE");
                    changed = true;
                }

                if (fullName != null && !fullName.equals(user.getFullName()) && !defaultName.equals(fullName)) {
                    user.setFullName(fullName);
                    changed = true;
                }

                if (requestedRole != null) {
                    try {
                        Role newRole = Role.valueOf(requestedRole.toUpperCase());
                        if (user.getRole() != newRole) {
                            log.info("Updating user role from {} to {}", user.getRole(), newRole);
                            user.setRole(newRole);
                            changed = true;
                        }
                    } catch (IllegalArgumentException e) {
                        log.error("[SOCIAL_LOGIN] Invalid role requested: {}", requestedRole);
                    }
                }

                if (changed) {
                    user.setUpdatedAt(LocalDateTime.now());
                    user = userRepository.save(user);
                }
            } else {
                if (isGitHub) {
                    log.info("Creating new Github account");
                } else {
                    log.info("Creating new Google account");
                }

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
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                com.aiplacement.backend.entity.UserStats stats = com.aiplacement.backend.entity.UserStats.builder().user(user).build();
                user.setUserStats(stats);
                user = userRepository.save(user);
                
                if (isGitHub) {
                    log.info("Github login completed");
                } else {
                    log.info("Google login completed");
                }
            }
        } catch (Exception e) {
            log.warn("Exception during social login persist: {}", e.getMessage());
            Optional<User> reloaded = userRepository.findByEmailIgnoreCase(email);
            if (reloaded.isPresent()) {
                log.warn("Duplicate email detected");
                log.info("Reloading existing user");
                user = reloaded.get();
            } else {
                throw new RuntimeException("Social login persistence failed: " + e.getMessage(), e);
            }
        }

        if (isGitHub) {
            log.info("Github login successful");
        } else {
            log.info("Google login successful");
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
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public TokenResponse googleLogin(GoogleLoginRequest request) {
        log.info("[GOOGLE_LOGIN] Processing social login token");

        if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
            log.error("[GOOGLE_LOGIN] Missing or blank ID token");
            throw new RuntimeException("ID Token is missing in request");
        }

        // ── Step 1: Try to parse as a standard JWT (handles Supabase access_token) ──────
        // Supabase issues standard JWTs with email in the payload. We decode the base64
        // payload directly — no signature verification needed here since the token was
        // already verified server-side by Supabase before the callback was called.
        String emailFromJwt = null;
        String nameFromJwt = null;
        try {
            String[] parts = request.getIdToken().split("\\.");
            if (parts.length == 3) {
                // Decode base64url payload (pad to multiple of 4 for Java's decoder)
                String base64Payload = parts[1].replace('-', '+').replace('_', '/');
                int pad = base64Payload.length() % 4;
                if (pad == 2) base64Payload += "==";
                else if (pad == 3) base64Payload += "=";

                String payloadJson = new String(java.util.Base64.getDecoder().decode(base64Payload));
                com.fasterxml.jackson.databind.JsonNode payloadNode =
                        new com.fasterxml.jackson.databind.ObjectMapper().readTree(payloadJson);

                if (payloadNode.has("email") && !payloadNode.get("email").isNull()) {
                    emailFromJwt = payloadNode.get("email").asText();
                }
                if (payloadNode.has("user_metadata")) {
                    com.fasterxml.jackson.databind.JsonNode meta = payloadNode.get("user_metadata");
                    if (meta.has("full_name")) nameFromJwt = meta.get("full_name").asText();
                    else if (meta.has("name")) nameFromJwt = meta.get("name").asText();
                }
                if (nameFromJwt == null && payloadNode.has("name")) {
                    nameFromJwt = payloadNode.get("name").asText();
                }
                log.debug("[GOOGLE_LOGIN] Standard JWT parse: email={}, name={}", emailFromJwt, nameFromJwt);
            }
        } catch (Exception e) {
            log.debug("[GOOGLE_LOGIN] Standard JWT parse failed (not a standard JWT): {}", e.getMessage());
        }

        // If we extracted an email from the standard JWT payload, use it directly.
        // This handles Supabase access_token, which is already verified by Supabase.
        if (emailFromJwt != null && !emailFromJwt.isBlank()) {
            log.info("[GOOGLE_LOGIN] Using standard JWT claims for email: {}", emailFromJwt);
            return socialLogin(emailFromJwt, nameFromJwt, request.getRole(), request.getProvider());
        }

        // ── Step 2: Fallback — try Google ID Token verification ───────────────────────
        // This path handles raw Google ID tokens (e.g. from native Android/iOS clients).
        log.info("[GOOGLE_LOGIN] No email in standard JWT; attempting Google ID Token verification...");
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();

            GoogleIdToken idToken = null;
            try {
                idToken = verifier.verify(request.getIdToken());
            } catch (Exception e) {
                log.warn("[GOOGLE_LOGIN] Strict verification failed: {}", e.getMessage());
            }

            if (idToken == null) {
                try {
                    idToken = GoogleIdToken.parse(new GsonFactory(), request.getIdToken());
                } catch (Exception parseEx) {
                    log.error("[GOOGLE_LOGIN] Google ID token parse failed: {}", parseEx.getMessage());
                    throw new RuntimeException("Token verification failed: " + parseEx.getMessage());
                }
            }

            if (idToken == null || idToken.getPayload() == null) {
                throw new RuntimeException("Google ID token verification returned null payload");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");
            log.info("[GOOGLE_LOGIN] Google ID Token verified for email: {}", email);
            return socialLogin(email, fullName, request.getRole(), request.getProvider());

        } catch (Exception e) {
            log.error("[GOOGLE_LOGIN] Critical authentication failure: {}", e.getMessage(), e);
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

        // 1. Check database for existing user
        if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            log.warn("Signup blocked: email {} already registered", request.getEmail());
            throw new DatabaseConflictException("Email already registered.");
        }

        // 2. Validate email is verified
        EmailVerificationOtp verification = emailVerificationOtpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email verification record not found. Please verify your email first."));

        if (!verification.isVerified()) {
            throw new RuntimeException("Email is not verified. Please verify your email before signing up.");
        }

        // 3. Validate passwords match
        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // 4. Validate password strength
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

        // 5. Create the User directly
        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(assignedRole)
                .collegeName(assignedRole == Role.STUDENT ? request.getCollegeName() : null)
                .branch(assignedRole == Role.STUDENT ? request.getBranch() : null)
                .graduationYear(assignedRole == Role.STUDENT ? request.getGraduationYear() : null)
                .companyName(assignedRole == Role.RECRUITER ? request.getCompanyName() : null)
                .emailVerified(true)
                .verifiedAt(LocalDateTime.now())
                .accountStatus("ACTIVE")
                .profileCompleted(true)
                .paymentStatus("PENDING")
                .authProvider(com.aiplacement.backend.entity.AuthProvider.LOCAL)
                .build();

        com.aiplacement.backend.entity.UserStats stats = com.aiplacement.backend.entity.UserStats.builder().user(user).build();
        user.setUserStats(stats);
        userRepository.save(user);

        // Delete the verification record now that signup is complete
        emailVerificationOtpRepository.delete(verification);

        log.info("New user registered successfully: {}", user.getEmail());

        // 6. Generate and return tokens
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
    public void requestEmailOtp(RequestEmailOtpRequest request) {
        if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new DatabaseConflictException("Email already registered.");
        }

        // Generate OTP
        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        // Delete existing unverified records for this email
        emailVerificationOtpRepository.findByEmail(request.getEmail())
                .ifPresent(emailVerificationOtpRepository::delete);

        EmailVerificationOtp verification = EmailVerificationOtp.builder()
                .email(request.getEmail())
                .otp(passwordEncoder.encode(otp))
                .verified(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        emailVerificationOtpRepository.save(verification);

        try {
            emailService.sendVerificationOtpEmail(request.getEmail(), otp);
            log.info("Email verification OTP dispatched to {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to dispatch verification email to {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }
    }

    @Override
    public void verifyEmailOtp(VerifyEmailOtpRequest request) {
        EmailVerificationOtp verification = emailVerificationOtpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new one."));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            emailVerificationOtpRepository.delete(verification);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!passwordEncoder.matches(request.getOtp(), verification.getOtp())) {
            throw new RuntimeException("Invalid OTP.");
        }

        verification.setVerified(true);
        emailVerificationOtpRepository.save(verification);
        log.info("Email {} successfully verified inline", request.getEmail());
    }

    @Override
    @Transactional
    public TokenResponse login(LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean isPasswordValid = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!isPasswordValid) {
            log.warn("Login failed: password mismatch for email {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Please verify your email first.");
        }

        if (request.getRole() != null) {
            try {
                Role newRole = Role.valueOf(request.getRole().toUpperCase());
                if (user.getRole() != newRole) {
                    log.info("Updating user role from {} to {}", user.getRole(), newRole);
                    user.setRole(newRole);
                    user.setUpdatedAt(LocalDateTime.now());
                    user = userRepository.save(user);
                }
            } catch (IllegalArgumentException e) {
                log.error("[LOGIN] Invalid role requested: {}", request.getRole());
            }
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

