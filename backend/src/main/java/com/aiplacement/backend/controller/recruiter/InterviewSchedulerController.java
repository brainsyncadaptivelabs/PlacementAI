package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.InterviewScheduleDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.recruiter.InterviewSchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiters/interviews")
@RequiredArgsConstructor
public class InterviewSchedulerController {

    private final InterviewSchedulerService schedulerService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<InterviewScheduleDto> schedule(@RequestBody InterviewScheduleDto dto) {
        return ResponseEntity.ok(schedulerService.schedule(dto, currentUser()));
    }

    @GetMapping
    public ResponseEntity<List<InterviewScheduleDto>> getAll() {
        return ResponseEntity.ok(schedulerService.getSchedulesForRecruiter(currentUser().getId()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<InterviewScheduleDto>> getUpcoming() {
        return ResponseEntity.ok(schedulerService.getUpcomingForRecruiter(currentUser().getId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        schedulerService.cancelSchedule(id, currentUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<InterviewScheduleDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(schedulerService.markCompleted(id, currentUser()));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }
}
