package com.aiplacement.backend.controller.skills;

import com.aiplacement.backend.dto.skills.SkillGapRequestDto;
import com.aiplacement.backend.dto.skills.SkillGapResponseDto;
import com.aiplacement.backend.service.skills.SkillGapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor

public class SkillGapController {

    private final SkillGapService skillGapService;

    @PostMapping("/analyze")

    public SkillGapResponseDto analyzeSkills(
            @RequestBody SkillGapRequestDto request
    ) {

        return skillGapService.analyzeSkills(
                request
        );
    }
}