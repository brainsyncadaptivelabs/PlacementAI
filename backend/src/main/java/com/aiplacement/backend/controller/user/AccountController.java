package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.dto.user.DeleteAccountRequestDto;
import com.aiplacement.backend.dto.user.GoogleDeleteAccountRequestDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.AuthProvider;
import com.aiplacement.backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @PostMapping("/delete")
    public ResponseEntity<String> deleteAccount(@Valid @RequestBody DeleteAccountRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password.");
        }

        performSoftDelete(user);
        return ResponseEntity.ok("Account successfully deleted");
    }

    @PostMapping("/delete/google")
    public ResponseEntity<String> deleteAccountGoogle(@Valid @RequestBody GoogleDeleteAccountRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAuthProvider() != AuthProvider.GOOGLE) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Account is not a Google account.");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            
            if (idToken == null) {
                // Fallback for dev mode
                idToken = GoogleIdToken.parse(new GsonFactory(), request.getIdToken());
            }

            if (idToken == null || idToken.getPayload() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
            }

            String googleEmail = idToken.getPayload().getEmail();
            if (!currentEmail.equals(googleEmail)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google account mismatch");
            }

        } catch (Exception e) {
            log.error("[DELETE_GOOGLE] Token verification failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google verification failed.");
        }

        performSoftDelete(user);
        return ResponseEntity.ok("Account successfully deleted");
    }

    private void performSoftDelete(User user) {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        user.setEmail("deleted_" + user.getId() + "_" + randomSuffix + "@deleted.com");
        user.setFullName("Deleted User");
        user.setProfileImage(null);
        user.setLinkedinUrl(null);
        user.setGithubUrl(null);
        user.setPassword("");
        user.setCollegeName(null);
        user.setBranch(null);
        user.setGraduationYear(null);
        user.setDateOfBirth(null);
        user.setSkills(null);
        user.setCompanyName(null);
        user.setCompanyWebsite(null);
        user.setCompanySize(null);
        
        userRepository.save(user);
    }
}
