package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.AtsResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeService {

    AtsResponseDto uploadResume(MultipartFile file);
    String getLatestResumeText();
    }