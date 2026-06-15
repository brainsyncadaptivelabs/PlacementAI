package com.aiplacement.backend.service.compare;

import com.aiplacement.backend.dto.compare.ResumeCompareRequestDto;
import com.aiplacement.backend.dto.compare.ResumeCompareResponseDto;

public interface ResumeCompareService {

    ResumeCompareResponseDto compareResumes(
            ResumeCompareRequestDto request
    );
}