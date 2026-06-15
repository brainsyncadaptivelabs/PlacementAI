package com.aiplacement.backend.controller.compare;

import com.aiplacement.backend.dto.compare.ResumeCompareRequestDto;
import com.aiplacement.backend.dto.compare.ResumeCompareResponseDto;
import com.aiplacement.backend.service.compare.ResumeCompareService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor

public class ResumeCompareController {

    private final ResumeCompareService resumeCompareService;

    @PostMapping("/compare")

    public ResumeCompareResponseDto compareResumes(
            @RequestBody ResumeCompareRequestDto request
    ) {

        return resumeCompareService.compareResumes(
                request
        );
    }
}