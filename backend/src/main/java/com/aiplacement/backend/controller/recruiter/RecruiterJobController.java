package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.JobDto;
import com.aiplacement.backend.dto.recruiter.ShortlistResultDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.recruiter.RecruiterJobService;
import com.aiplacement.backend.service.recruiter.SmartShortlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiter/jobs")
@RequiredArgsConstructor
public class RecruiterJobController {

    private final RecruiterJobService jobService;
    private final SmartShortlistService shortlistService;
    private final UserRepository userRepository;

    // ─── CRUD ────────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<JobDto> createJob(@RequestBody JobDto dto) {
        return ResponseEntity.ok(jobService.createJob(dto, currentUser()));
    }

    @GetMapping
    public ResponseEntity<List<JobDto>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobsForRecruiter(currentUser().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDto> updateJob(@PathVariable Long id, @RequestBody JobDto dto) {
        return ResponseEntity.ok(jobService.updateJob(id, dto, currentUser()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id, currentUser());
        return ResponseEntity.noContent().build();
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────────

    @PostMapping("/{id}/publish")
    public ResponseEntity<JobDto> publishJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.publishJob(id, currentUser()));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<JobDto> closeJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.closeJob(id, currentUser()));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<JobDto> archiveJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.archiveJob(id, currentUser()));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<JobDto> duplicateJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.duplicateJob(id, currentUser()));
    }

    // ─── AI Shortlist ────────────────────────────────────────────────────────────

    @PostMapping("/{id}/shortlist")
    public ResponseEntity<ShortlistResultDto> shortlist(@PathVariable Long id) {
        return ResponseEntity.ok(shortlistService.shortlistForJob(id));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────────

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }
}
