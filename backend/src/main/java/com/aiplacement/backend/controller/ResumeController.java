package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.AtsResponseDto;
import com.aiplacement.backend.dto.ImageResumeResponseDto;
import com.aiplacement.backend.service.ResumeService;
import com.aiplacement.backend.service.ocr.OcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController

@RequestMapping("/api/v1/resume")

@RequiredArgsConstructor
@Slf4j
public class ResumeController {

    private final ResumeService resumeService;

    private final OcrService ocrService;

    @PostMapping("/upload")

    public ResponseEntity<AtsResponseDto> uploadResume(

            @RequestParam("file")
            MultipartFile file

    ) {
        log.info("Resume upload and ATS analysis requested: {}", file.getOriginalFilename());
        AtsResponseDto response =
                resumeService.uploadResume(file);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-image")

    public ResponseEntity<ImageResumeResponseDto>
    uploadImageResume(

            @RequestParam("file")
            MultipartFile file

    ) {

        String extractedText =
                ocrService.extractTextFromImage(
                        file
                );

        return ResponseEntity.ok(

                new ImageResumeResponseDto(
                        extractedText
                )
        );
    }

    @GetMapping("/latest")
    public ResponseEntity<String> getLatestResumeText() {
        return ResponseEntity.ok(resumeService.getLatestResumeText());
    }
}
