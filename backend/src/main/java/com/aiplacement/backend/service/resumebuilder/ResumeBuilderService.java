package com.aiplacement.backend.service.resumebuilder;

import com.aiplacement.backend.dto.resumebuilder.ResumeBuilderRequestDto;
import com.aiplacement.backend.dto.resumebuilder.ResumeBuilderResponseDto;

import java.util.List;

public interface ResumeBuilderService {

    ResumeBuilderResponseDto createResume(
            ResumeBuilderRequestDto request
    );

    List<ResumeBuilderRequestDto> getAllResumes();

    ResumeBuilderRequestDto getResumeById(Long id);

    ResumeBuilderResponseDto updateResume(
            Long resumeId,
            ResumeBuilderRequestDto request
    );

    void deleteResume(
            Long resumeId
    );
}
