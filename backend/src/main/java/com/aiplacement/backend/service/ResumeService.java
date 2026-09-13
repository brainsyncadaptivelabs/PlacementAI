package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.AtsResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeService {

    AtsResponseDto uploadResume(MultipartFile file);
    AtsResponseDto uploadResume(MultipartFile file, String jobDescription);
    com.aiplacement.backend.dto.ResumeDto uploadResumeOnly(MultipartFile file);
    String getLatestResumeText();
    java.util.List<com.aiplacement.backend.dto.ResumeDto> getAllResumes();
    org.springframework.data.domain.Page<com.aiplacement.backend.dto.ResumeDto> getMyResumes(int page, int size);
    AtsResponseDto getResumeAnalysis(Long resumeId);
}