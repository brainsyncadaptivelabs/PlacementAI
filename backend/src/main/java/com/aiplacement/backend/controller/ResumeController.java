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

    private final com.aiplacement.backend.service.PdfService pdfService;

    @PostMapping("/extract-text")
    public ResponseEntity<String> extractText(
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Generic text extraction requested for file: {}", file.getOriginalFilename());
        try {
            java.io.File tempFile = java.io.File.createTempFile("extract-", "_" + file.getOriginalFilename());
            file.transferTo(tempFile);
            String text = pdfService.extractText(tempFile, file.getOriginalFilename());
            if (!tempFile.delete()) {
                log.warn("Failed to delete temp file: {}", tempFile.getAbsolutePath());
            }
            return ResponseEntity.ok(text);
        } catch (IllegalArgumentException e) {
            // Validation error — empty file, unsupported type, etc. — is a client error
            log.warn("File validation failed during text extraction: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to extract text from file", e);
            return ResponseEntity.status(500).body("Failed to extract text: " + e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<AtsResponseDto> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false) String jobDescription
    ) {
        log.info("Resume upload and ATS analysis requested: {}, with JD present: {}", 
                file.getOriginalFilename(), jobDescription != null);
        AtsResponseDto response =
                resumeService.uploadResume(file, jobDescription);

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

    @GetMapping("/all")
    public ResponseEntity<java.util.List<com.aiplacement.backend.dto.ResumeDto>> getAllResumes() {
        log.info("Request to fetch all resumes for authenticated user");
        return ResponseEntity.ok(resumeService.getAllResumes());
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<AtsResponseDto> getResumeAnalysis(@PathVariable Long id) {
        log.info("Request to fetch resume analysis for resume ID: {}", id);
        return ResponseEntity.ok(resumeService.getResumeAnalysis(id));
    }
}
