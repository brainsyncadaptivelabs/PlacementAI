package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.RecruiterNoteDto;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.recruiter.RecruiterNoteService;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recruiter/candidates")
@RequiredArgsConstructor
public class RecruiterCandidateController {

    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;
    private final RecruiterNoteService noteService;

    // ─── Filtered Candidate List ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<CandidateSummaryDto>> getAllCandidates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .collect(Collectors.toList());

        // Apply filters
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            students = students.stream()
                    .filter(s -> (s.getFullName() != null && s.getFullName().toLowerCase().contains(q))
                            || (s.getSkills() != null && s.getSkills().toLowerCase().contains(q))
                            || (s.getCollegeName() != null && s.getCollegeName().toLowerCase().contains(q))
                            || (s.getBranch() != null && s.getBranch().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        if (college != null && !college.isBlank()) {
            String c = college.toLowerCase();
            students = students.stream()
                    .filter(s -> s.getCollegeName() != null && s.getCollegeName().toLowerCase().contains(c))
                    .collect(Collectors.toList());
        }

        if (department != null && !department.isBlank()) {
            String d = department.toLowerCase();
            students = students.stream()
                    .filter(s -> s.getBranch() != null && s.getBranch().toLowerCase().contains(d))
                    .collect(Collectors.toList());
        }

        if (graduationYear != null) {
            students = students.stream()
                    .filter(s -> graduationYear.equals(s.getGraduationYear()))
                    .collect(Collectors.toList());
        }

        // Build summaries with intelligence scores
        List<CandidateSummaryDto> summaries = students.stream()
                .map(s -> {
                    PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(s);
                    return buildSummary(s, intel);
                })
                .collect(Collectors.toList());

        // Sort
        if ("ATS".equals(sortBy)) {
            summaries.sort((a, b) -> Integer.compare(b.atsScore(), a.atsScore()));
        } else if ("CODING".equals(sortBy)) {
            summaries.sort((a, b) -> Integer.compare(b.codingScore(), a.codingScore()));
        } else if ("INTERVIEW".equals(sortBy)) {
            summaries.sort((a, b) -> Integer.compare(b.hiringProbability(), a.hiringProbability()));
        } else {
            // Default: READINESS
            summaries.sort((a, b) -> Integer.compare(b.readinessScore(), a.readinessScore()));
        }

        // Paginate
        int from = page * size;
        int to = Math.min(from + size, summaries.size());
        if (from >= summaries.size()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(summaries.subList(from, to));
    }

    // ─── Full Intelligence Profile ────────────────────────────────────────────────

    @GetMapping("/{id}/intelligence")
    public ResponseEntity<PlacementIntelligenceDto> getCandidateIntelligence(@PathVariable Long id) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        PlacementIntelligenceDto dto = placementReadinessService.getIntelligence(student);
        return ResponseEntity.ok(dto);
    }

    // ─── Profile Info ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/profile")
    public ResponseEntity<CandidateSummaryDto> getCandidateProfile(@PathVariable Long id) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(student);
        return ResponseEntity.ok(buildSummary(student, intel));
    }

    // ─── Notes ───────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<RecruiterNoteDto>> getNotes(@PathVariable Long id) {
        User recruiter = currentUser();
        return ResponseEntity.ok(noteService.getNotesForStudent(recruiter.getId(), id));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private CandidateSummaryDto buildSummary(User s, PlacementIntelligenceDto intel) {
        String band = intel.getOverallPlacementReadiness() >= 90 ? "Platinum" :
                      intel.getOverallPlacementReadiness() >= 75 ? "Gold" :
                      intel.getOverallPlacementReadiness() >= 60 ? "Silver" : "Needs Improvement";

        return new CandidateSummaryDto(
                s.getId(), s.getFullName(), s.getEmail(),
                s.getBranch(), s.getCollegeName(), s.getGraduationYear(),
                s.getSkills(), s.getProfileImage(),
                intel.getOverallPlacementReadiness(),
                intel.getAtsScore(), intel.getCodingScore(),
                intel.getJdMatch(), intel.getHiringProbability(),
                intel.getSalaryPrediction(), band,
                intel.getAiSummary()
        );
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }

    // ─── Inner DTO ────────────────────────────────────────────────────────────────

    public record CandidateSummaryDto(
            Long id,
            String name,
            String email,
            String branch,
            String collegeName,
            Integer graduationYear,
            String skills,
            String profileImage,
            int readinessScore,
            int atsScore,
            int codingScore,
            int jdMatchScore,
            int hiringProbability,
            String expectedSalary,
            String candidateBand,
            String aiSummary
    ) {}
}
