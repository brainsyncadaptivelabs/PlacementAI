package com.aiplacement.backend.service;

import com.aiplacement.backend.ai.GeminiService;
import com.aiplacement.backend.dto.AtsResponseDto;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.cloudinary.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final PdfService pdfService;
    private final GeminiService geminiService;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AtsResponseDto uploadResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Unable to determine file name.");
        }

        File tempFile = null;
        try {
            log.info("Starting resume upload process for: {}", originalFilename);

            String uploadDir = System.getProperty("user.dir") + "/temp/";
            File directory = new File(uploadDir);

            if (!directory.exists()) {
                directory.mkdirs();
                log.info("Temp directory created");
            }

            String fileName = UUID.randomUUID() + "_" + originalFilename;
            String tempFilePath = uploadDir + fileName;
            tempFile = new File(tempFilePath);

            file.transferTo(tempFile);
            log.info("Temporary resume file created: {}", fileName);

            // Dynamically extract text based on extension
            String extractedText = pdfService.extractText(tempFile, originalFilename);
            log.info("Document text extracted successfully, character length: {}", extractedText.length());

            String cloudinaryUrl = cloudinaryService.uploadFile(file);
            log.info("Resume uploaded to Cloudinary successfully");

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Authenticated user found: {}", email);

            Resume resume = Resume.builder()
                    .fileName(fileName)
                    .filePath(cloudinaryUrl)
                    .extractedText(extractedText)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            resumeRepository.save(resume);
            log.info("Resume saved to database");

            log.info("Sending resume to OllamaClient for ATS analysis");
            AtsResponseDto atsResponse = geminiService.analyzeResume(extractedText);
            atsResponse.setExtractedText(extractedText);
            log.info("ATS analysis completed successfully");

            AtsAnalysis atsAnalysis = AtsAnalysis.builder()
                    .atsScore(atsResponse.getAtsScore())
                    .strengths(atsResponse.getStrengths())
                    .weaknesses(atsResponse.getWeaknesses())
                    .missingKeywords(atsResponse.getMissingKeywords())
                    .matchedKeywords(atsResponse.getMatchedKeywords())
                    .suggestions(atsResponse.getSuggestions())
                    .bestRole(atsResponse.getBestRole())
                    .extractedText(extractedText)
                    .resume(resume)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            atsAnalysisRepository.save(atsAnalysis);

            log.info("ATS analysis saved to database");

            return atsResponse;

        } catch (IllegalArgumentException e) {
            log.warn("Validation error during upload: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Resume parsing/upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload and parse resume: " + e.getMessage(), e);
        } finally {
            if (tempFile != null && tempFile.exists()) {
                boolean deleted = tempFile.delete();
                if (deleted) {
                    log.info("Temporary file deleted successfully");
                } else {
                    log.warn("Failed to delete temporary file: {}", tempFile.getAbsolutePath());
                }
            }
        }
    }

    @Override
    public String getLatestResumeText() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return resumeRepository.findFirstByUserOrderByCreatedAtDesc(user)
                .map(resume -> resume.getExtractedText())
                .orElse("");
    }
}

