package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.dto.coding.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.service.coding.CodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coding")
@RequiredArgsConstructor
@Slf4j
public class CodingProblemController {

    private final CodingService codingService;

    @GetMapping("/problems")
    public ResponseEntity<Page<ProblemDto>> getProblems(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @AuthenticationPrincipal User user) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(codingService.getProblems(difficulty, tag, query, user, pageable));
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<ProblemDto> getProblemById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codingService.getProblemById(id, user));
    }

    @PostMapping("/problems/{id}/run")
    public ResponseEntity<ProblemRunResponse> runCode(
            @PathVariable Long id,
            @RequestBody ProblemRunRequest request,
            @AuthenticationPrincipal User user) {
        log.info("[CODING] Candidate running code for problem ID: {}, language: {}", id, request.getLanguage());
        return ResponseEntity.ok(codingService.runProblemCode(id, request, user));
    }

    @PostMapping("/problems/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitCode(
            @PathVariable Long id,
            @RequestBody ProblemRunRequest request,
            @AuthenticationPrincipal User user) {
        log.info("[CODING] Candidate submitting code for problem ID: {}, language: {}", id, request.getLanguage());
        return ResponseEntity.ok(codingService.submitProblemCode(id, request, user));
    }

    @GetMapping("/problems/{id}/submissions")
    public ResponseEntity<List<Map<String, Object>>> getSubmissions(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codingService.getProblemSubmissions(id, user));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<CodingDashboardDto> getDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codingService.getCodingDashboard(user));
    }

    @PostMapping("/problems/{id}/copilot")
    public ResponseEntity<CopilotResponse> copilotAssist(
            @PathVariable Long id,
            @RequestBody CopilotRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(codingService.copilotAssist(id, request, user));
    }
}
