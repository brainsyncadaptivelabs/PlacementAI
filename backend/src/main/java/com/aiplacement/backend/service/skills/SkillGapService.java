package com.aiplacement.backend.service.skills;

import com.aiplacement.backend.dto.skills.SkillGapRequestDto;
import com.aiplacement.backend.dto.skills.SkillGapResponseDto;

public interface SkillGapService {

    SkillGapResponseDto analyzeSkills(
            SkillGapRequestDto request
    );
}