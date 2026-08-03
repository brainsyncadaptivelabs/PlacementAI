package com.aiplacement.backend.service.ats;

import com.aiplacement.backend.dto.ats.*;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.SeniorityTier;

import java.util.List;

public interface AtsAnalysisService {

    AtsGeneralScanResponseDto analyzeGeneral(Long resumeId);

    AtsJdScanResponseDto analyzeAgainstJd(Long resumeId, AtsJdScanRequestDto request);

    Object overrideExperienceLevel(Long analysisId, SeniorityTier newLevel);

    List<Object> getScanHistoryByResumeId(Long resumeId);

    SeniorityTier resolveEffectiveExperienceLevel(AtsAnalysis analysis);
}
