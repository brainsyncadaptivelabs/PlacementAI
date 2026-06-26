package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.user.CompleteProfileRequest;
import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aiplacement.backend.service.cloudinary.CloudinaryService;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProfileController {

    private final ProfileService profileService;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = cloudinaryService.uploadFile(file);
        user.setProfileImage(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(imageUrl);
    }

    @PostMapping("/student")
    public ResponseEntity<String> completeStudentProfile(@RequestBody CompleteProfileRequest request) {
        profileService.completeStudentProfile(request);
        return ResponseEntity.ok("Student profile completed successfully");
    }

    @PostMapping("/recruiter")
    public ResponseEntity<String> completeRecruiterProfile(@RequestBody CompleteProfileRequest request) {
        profileService.completeRecruiterProfile(request);
        return ResponseEntity.ok("Recruiter profile completed successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<UserProfileDto> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.getPublicProfileById(id));
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateProfile(@RequestBody CompleteProfileRequest request) {
        profileService.updateProfile(request);
        return ResponseEntity.ok("Profile updated successfully");
    }
}