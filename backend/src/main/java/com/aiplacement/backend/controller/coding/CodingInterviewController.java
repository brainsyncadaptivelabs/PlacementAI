package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingReplay;
import com.aiplacement.backend.service.coding.CodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coding/interview")
@RequiredArgsConstructor
@Slf4j
public class CodingInterviewController {

    private final CodingService codingService;

    /**
     * GET /api/v1/coding/interview/problem/{interviewId}
     * Returns the current coding problem for the active CODING question (public fields only — no hidden test cases).
     */
    @GetMapping("/problem/{interviewId}")
    public ResponseEntity<?> getCurrentProblem(@PathVariable Long interviewId) {
        CodingProblem problem = codingService.getCurrentProblem(interviewId);

        // Return only public fields — never expose hidden test cases or solution
        Map<String, Object> response = new HashMap<>();
        response.put("problemId", problem.getId());
        response.put("title", problem.getTitle());
        response.put("difficulty", problem.getDifficulty());
        response.put("tags", problem.getTags());
        response.put("targetLanguages", problem.getTargetLanguages());
        response.put("problemStatement", problem.getProblemStatement());
        response.put("constraints", problem.getConstraints());
        response.put("examples", problem.getExamples());
        response.put("hints", problem.getHints());
        response.put("timeComplexityTarget", problem.getTimeComplexityTarget());
        response.put("spaceComplexityTarget", problem.getSpaceComplexityTarget());
        
        // Only public test cases
        if (problem.getTestCases() != null) {
            List<Map<String, Object>> publicTests = problem.getTestCases().stream()
                    .filter(tc -> !tc.isHidden())
                    .map(tc -> {
                        Map<String, Object> t = new HashMap<>();
                        t.put("ordinal", tc.getOrdinal());
                        t.put("input", tc.getInput());
                        t.put("expectedOutput", tc.getExpectedOutput());
                        t.put("description", tc.getDescription());
                        return t;
                    }).toList();
            response.put("publicTestCases", publicTests);
            response.put("totalTestCases", problem.getTestCases().size());
            response.put("hiddenTestCases", problem.getTestCases().stream().filter(tc -> tc != null && tc.isHidden()).count());
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/coding/interview/submission/{submissionId}
     * Full submission detail with test results, AI review, complexity analysis.
     */
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId) {
        Map<String, Object> submissionDetails = codingService.getSubmission(submissionId);
        return ResponseEntity.ok(submissionDetails);
    }

    /**
     * GET /api/v1/coding/interview/replay/{submissionId}
     * Returns code evolution snapshots for recruiter replay.
     */
    @GetMapping("/replay/{submissionId}")
    public ResponseEntity<List<CodingReplay>> getReplay(@PathVariable Long submissionId) {
        List<CodingReplay> snapshots = codingService.getReplay(submissionId);
        return ResponseEntity.ok(snapshots);
    }

    /**
     * GET /api/v1/coding/interview/profile/{userId}
     * Full coding language profile for a candidate. Used by recruiter dashboard.
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getCodingProfile(@PathVariable Long userId) {
        Map<String, Object> profile = codingService.getCodingProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
