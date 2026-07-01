package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/intelligence")
@RequiredArgsConstructor
public class IntelligenceController {

    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;

    @GetMapping("/me")
    public ResponseEntity<PlacementIntelligenceDto> getMyIntelligence() {
        User currentUser = getCurrentUser();
        PlacementIntelligenceDto intelligence = placementReadinessService.getIntelligence(currentUser);
        return ResponseEntity.ok(intelligence);
    }

    @GetMapping("/candidates/{id}")
    public ResponseEntity<PlacementIntelligenceDto> getCandidateIntelligence(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        User candidate = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (candidate.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate intelligence is only available for students");
        }

        if (currentUser.getRole() == Role.STUDENT && !currentUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (currentUser.getRole() == Role.RECRUITER || currentUser.getRole() == Role.PLACEMENT_OFFICER || currentUser.getRole() == Role.ADMIN || currentUser.getId().equals(id)) {
            PlacementIntelligenceDto intelligence = placementReadinessService.getIntelligence(candidate);
            return ResponseEntity.ok(intelligence);
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}