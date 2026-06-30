package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recruiter/candidates")
@RequiredArgsConstructor
public class RecruiterCandidateController {

    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllCandidates() {
        // Simple un-paginated response for Phase 1 MVP
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .collect(Collectors.toList());

        List<UserDto> response = students.stream()
                .map(s -> new UserDto(s.getId(), s.getFullName(), s.getBranch(), s.getGraduationYear(), s.getSkills()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/intelligence")
    public ResponseEntity<PlacementIntelligenceDto> getCandidateIntelligence(@PathVariable Long id) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        PlacementIntelligenceDto dto = placementReadinessService.getIntelligence(student);
        return ResponseEntity.ok(dto);
    }

    public static class UserDto {
        public Long id;
        public String name;
        public String branch;
        public Integer graduationYear;
        public String skills;
        public UserDto(Long id, String name, String branch, Integer graduationYear, String skills) {
            this.id = id; this.name = name; this.branch = branch; this.graduationYear = graduationYear; this.skills = skills;
        }
    }
}
