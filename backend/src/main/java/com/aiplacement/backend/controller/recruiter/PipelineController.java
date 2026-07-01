package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.JobApplicationDto;
import com.aiplacement.backend.dto.recruiter.PipelineColumnDto;
import com.aiplacement.backend.entity.ApplicationStatus;
import com.aiplacement.backend.service.recruiter.PipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recruiters/pipeline")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<PipelineColumnDto> getJobPipeline(@PathVariable Long jobId) {
        return ResponseEntity.ok(pipelineService.getJobPipeline(jobId));
    }

    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<JobApplicationDto> moveCandidate(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> body) {
        ApplicationStatus status = ApplicationStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(pipelineService.moveCandidate(applicationId, status));
    }

    @PostMapping("/applications/bulk-move")
    public ResponseEntity<List<JobApplicationDto>> bulkMove(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Long> ids = ((List<Integer>) body.get("applicationIds"))
                .stream().map(i -> i.longValue()).toList();
        ApplicationStatus status = ApplicationStatus.valueOf((String) body.get("status"));
        return ResponseEntity.ok(pipelineService.bulkMove(ids, status));
    }
}
