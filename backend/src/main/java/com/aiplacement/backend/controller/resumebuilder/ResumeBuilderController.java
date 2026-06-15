package com.aiplacement.backend.controller.resumebuilder;

import com.aiplacement.backend.dto.resumebuilder.ResumeBuilderRequestDto;
import com.aiplacement.backend.dto.resumebuilder.ResumeBuilderResponseDto;
import com.aiplacement.backend.service.resumebuilder.ResumeBuilderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resume-builder")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ResumeBuilderController {

    private final ResumeBuilderService resumeBuilderService;

    @PostMapping
    public ResponseEntity<ResumeBuilderResponseDto> createResume(
            @RequestBody ResumeBuilderRequestDto request
    ) {
        return ResponseEntity.ok(resumeBuilderService.createResume(request));
    }

    @GetMapping
    public ResponseEntity<List<ResumeBuilderRequestDto>> getAllResumes() {
        return ResponseEntity.ok(resumeBuilderService.getAllResumes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeBuilderRequestDto> getResumeById(@PathVariable Long id) {
        return ResponseEntity.ok(resumeBuilderService.getResumeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeBuilderResponseDto> updateResume(
            @PathVariable Long id,
            @RequestBody ResumeBuilderRequestDto request
    ) {
        return ResponseEntity.ok(resumeBuilderService.updateResume(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long id
    ) {
        resumeBuilderService.deleteResume(id);
        return ResponseEntity.ok("Resume deleted successfully");
    }
}
