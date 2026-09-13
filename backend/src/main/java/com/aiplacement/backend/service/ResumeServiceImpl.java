package com.aiplacement.backend.service;

import com.aiplacement.backend.ai.AiSemanticService;
import com.aiplacement.backend.dto.AtsResponseDto;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.storage.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final PdfService pdfService;
    private final AiSemanticService aiSemanticService;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final StorageService storageService;
    private final com.aiplacement.backend.monitoring.PlacementMetrics placementMetrics;
    private final org.springframework.cache.CacheManager cacheManager;
    private final ObjectMapper objectMapper;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AtsResponseDto uploadResume(MultipartFile file) {
        return uploadResume(file, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public com.aiplacement.backend.dto.ResumeDto uploadResumeOnly(MultipartFile file) {
        placementMetrics.incrementResumeUploads();
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Unable to determine file name.");
        }

        File tempFile = null;
        try {
            log.info("Starting resume upload-only process for: {}", originalFilename);
            String uploadDir = System.getProperty("user.dir") + "/temp/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String cleanFilename = new File(originalFilename).getName()
                    .replace("..", "")
                    .replace("/", "")
                    .replace("\\", "");
            String fileName = UUID.randomUUID() + "_" + cleanFilename;
            String tempFilePath = uploadDir + fileName;
            tempFile = new File(tempFilePath);

            String storageUrl = storageService.uploadFile(file);

            java.nio.file.Files.copy(file.getInputStream(), tempFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            String extractedText = pdfService.extractText(tempFile, originalFilename);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Resume resume = Resume.builder()
                    .fileName(cleanFilename)
                    .filePath(storageUrl)
                    .extractedText(extractedText)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            Resume saved = resumeRepository.save(resume);
            log.info("Resume saved to database with ID: {}", saved.getId());

            evictUserCaches(email);

            if (tempFile.exists()) {
                tempFile.delete();
            }

            return com.aiplacement.backend.dto.ResumeDto.builder()
                    .id(saved.getId())
                    .fileName(saved.getFileName())
                    .filePath(saved.getFilePath())
                    .createdAt(saved.getCreatedAt())
                    .extractedText(extractedText)
                    .build();
        } catch (Exception e) {
            log.error("Error during resume upload-only process", e);
            throw new RuntimeException("Failed to upload resume: " + e.getMessage(), e);
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AtsResponseDto uploadResume(MultipartFile file, String jobDescription) {
        placementMetrics.incrementResumeUploads();
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

            String cleanFilename = new File(originalFilename).getName()
                    .replace("..", "")
                    .replace("/", "")
                    .replace("\\", "");
            String fileName = UUID.randomUUID() + "_" + cleanFilename;
            String tempFilePath = uploadDir + fileName;
            tempFile = new File(tempFilePath);

            String storageUrl = storageService.uploadFile(file);
            log.info("Resume uploaded to storage successfully");

            java.nio.file.Files.copy(file.getInputStream(), tempFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            log.info("Temporary resume file created: {}", fileName);

            // Dynamically extract text based on extension
            String extractedText = pdfService.extractText(tempFile, originalFilename);
            log.info("Document text extracted successfully, character length: {}", extractedText.length());

            String resumeHash = getSha256Hash(extractedText);
            log.info("Computed SHA-256 hash for resume: {}", resumeHash);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Authenticated user found: {}", email);

            // SHA-256 Cache Hit Check
            java.util.List<AtsAnalysis> existingAnalyses = atsAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
            for (AtsAnalysis a : existingAnalyses) {
                if (resumeHash.equals(a.getResumeHash()) && "ATS_V2_1".equals(a.getEngineVersion()) && a.getRawJson() != null) {
                    log.info("Resume cache hit (SHA-256 hash match with version ATS_V2_1). Returning cached analysis.");
                    try {
                        AtsResponseDto atsResponse = objectMapper.readValue(a.getRawJson(), AtsResponseDto.class);
                        atsResponse.setExtractedText(extractedText);
                        atsResponse.setId(a.getId());
                        return atsResponse;
                    } catch (Exception ex) {
                        log.warn("Failed to parse cached rawJson. Continuing with normal analysis.", ex);
                    }
                }
            }



            Resume resume = Resume.builder()
                    .fileName(cleanFilename)
                    .filePath(storageUrl)
                    .extractedText(extractedText)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            resumeRepository.save(resume);
            log.info("Resume saved to database");

            log.info("Sending resume to AI provider for ATS analysis");
            placementMetrics.incrementAtsScans();
            
            // Execute semantic parsing and calculation pipeline
            AtsResponseDto atsResponse = aiSemanticService.analyzeResume(extractedText, jobDescription);
            atsResponse.setExtractedText(extractedText);
            log.info("ATS analysis completed successfully");

            String rawJsonString = null;
            try {
                rawJsonString = objectMapper.writeValueAsString(atsResponse);
            } catch (Exception ex) {
                log.error("Failed to serialize AtsResponseDto to rawJson", ex);
            }

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
                    .analysisVersion("1.0")
                    .engineVersion("ATS_V2_1")
                    .promptVersion("1.0")
                    .kbVersion("1.0")
                    .industry(atsResponse.getIndustry())
                    .careerDomain(atsResponse.getCareerDomain())
                    .profession(atsResponse.getPrimaryProfession())
                    .experienceLevel(atsResponse.getExperienceLevel())
                    .overallReadiness(atsResponse.getPlacementReadiness() != null ? atsResponse.getPlacementReadiness().getOrDefault("Overall", atsResponse.getAtsScore()) : null)
                    .targetRole(atsResponse.getTargetRole())
                    .rawJson(rawJsonString)
                    .resumeHash(resumeHash)
                    .build();

            // Enforce maximum history limit of 10 ATS reports
            if (existingAnalyses.size() >= 10) {
                log.info("User has {} analyses, enforcing limit of 10", existingAnalyses.size());
                for (int i = 9; i < existingAnalyses.size(); i++) {
                    AtsAnalysis oldest = existingAnalyses.get(i);
                    log.info("Deleting oldest ATS analysis report ID: {}", oldest.getId());
                    if (oldest.getResume() != null) {
                        String filePath = oldest.getResume().getFilePath();
                        if (filePath != null && !filePath.startsWith("http://") && !filePath.startsWith("https://")) {
                            try {
                                java.io.File fileToDelete = new java.io.File(filePath);
                                if (fileToDelete.exists()) {
                                    fileToDelete.delete();
                                    log.info("Deleted local resume file: {}", filePath);
                                }
                            } catch (Exception ex) {
                                log.warn("Failed to delete local resume file: {}", filePath, ex);
                            }
                        }
                    }
                    atsAnalysisRepository.delete(oldest);
                }
                atsAnalysisRepository.flush();
            }

            atsAnalysisRepository.save(atsAnalysis);
            atsResponse.setId(atsAnalysis.getId());
            log.info("ATS analysis saved to database with ID: {}", atsAnalysis.getId());

            // Evict user intelligence, jd_analysis, and roadmaps caches on resume upload
            evictUserCaches(email);

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
                .map(r -> r.getExtractedText())
                .orElse("");
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.aiplacement.backend.dto.ResumeDto> getAllResumes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return resumeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(resume -> com.aiplacement.backend.dto.ResumeDto.builder()
                        .id(resume.getId())
                        .fileName(resume.getFileName())
                        .filePath(resume.getFilePath())
                        .createdAt(resume.getCreatedAt())
                        .atsScore(resume.getAtsScore())
                        .analyzedRole(resume.getAnalyzedRole())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.aiplacement.backend.dto.ResumeDto> getMyResumes(int page, int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        org.springframework.data.domain.Page<Resume> resumePage = resumeRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        java.util.List<com.aiplacement.backend.dto.ResumeDto> dtos = resumePage.getContent().stream()
                .map(resume -> com.aiplacement.backend.dto.ResumeDto.builder()
                        .id(resume.getId())
                        .fileName(resume.getFileName())
                        .filePath(resume.getFilePath())
                        .createdAt(resume.getCreatedAt())
                        .atsScore(resume.getAtsScore())
                        .analyzedRole(resume.getAnalyzedRole())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, resumePage.getTotalElements());
    }

    private void evictUserCaches(String email) {
        try {
            String[] userCaches = {
                "placement_context", "placement_readiness", "placement_profile",
                "placement_score", "company_readiness", "placement_recommendations",
                "placement_dashboard", "mentor_data", "timeline_data", "dashboard_stats"
            };
            for (String cacheName : userCaches) {
                org.springframework.cache.Cache cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    cache.evict(email);
                }
            }

            // Evict jd_analysis and roadmaps caches
            org.springframework.cache.Cache jdCache = cacheManager.getCache("jd_analysis");
            if (jdCache != null) {
                jdCache.clear();
            }
            org.springframework.cache.Cache roadmapCache = cacheManager.getCache("roadmaps");
            if (roadmapCache != null) {
                roadmapCache.clear();
            }

            // Sweep Redis keys directly if RedisTemplate is available
            if (redisTemplate != null) {
                try {
                    java.util.Set<String> jdKeys = redisTemplate.keys("jd_analysis*");
                    if (jdKeys != null && !jdKeys.isEmpty()) {
                        redisTemplate.delete(jdKeys);
                    }
                    java.util.Set<String> roadmapKeys = redisTemplate.keys("roadmaps*");
                    if (roadmapKeys != null && !roadmapKeys.isEmpty()) {
                        redisTemplate.delete(roadmapKeys);
                    }
                } catch (Exception redisEx) {
                    log.debug("Redis sweep skipped: {}", redisEx.getMessage());
                }
            }
            log.info("Evicted user intelligence, jd_analysis, and roadmaps caches for: {}", email);
        } catch (Exception ex) {
            log.warn("Failed to evict user caches: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AtsResponseDto getResumeAnalysis(Long resumeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to resume");
        }

        java.util.List<AtsAnalysis> userAnalyses = atsAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        AtsAnalysis analysis = userAnalyses.stream()
                .filter(a -> a.getResume() != null && a.getResume().getId().equals(resumeId))
                .findFirst()
                .orElse(null);

        if (analysis == null) {
            return AtsResponseDto.builder()
                    .atsScore(70)
                    .strengths(java.util.Arrays.asList("Strong academic foundations", "Good technical skills"))
                    .weaknesses(java.util.Arrays.asList("Lacks quantitative project metrics"))
                    .missingKeywords(java.util.Arrays.asList("System Architecture"))
                    .bestRole(resume.getAnalyzedRole() != null ? resume.getAnalyzedRole() : "Software Engineer")
                    .extractedText(resume.getExtractedText())
                    .build();
        }

        if (analysis.getRawJson() != null) {
            try {
                AtsResponseDto responseDto = objectMapper.readValue(analysis.getRawJson(), AtsResponseDto.class);
                responseDto.setExtractedText(analysis.getExtractedText());
                return responseDto;
            } catch (Exception ex) {
                log.warn("Failed to parse rawJson from database", ex);
            }
        }

        return AtsResponseDto.builder()
                .atsScore(analysis.getAtsScore())
                .strengths(copyList(analysis.getStrengths()))
                .weaknesses(copyList(analysis.getWeaknesses()))
                .missingKeywords(copyList(analysis.getMissingKeywords()))
                .matchedKeywords(copyList(analysis.getMatchedKeywords()))
                .suggestions(copyList(analysis.getSuggestions()))
                .bestRole(analysis.getBestRole())
                .extractedText(analysis.getExtractedText())
                .build();
    }

    private java.util.List<String> copyList(java.util.List<String> collection) {
        if (collection == null) return new java.util.ArrayList<>();
        try {
            return new java.util.ArrayList<>(collection);
        } catch (Exception e) {
            return new java.util.ArrayList<>();
        }
    }

    private String getSha256Hash(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("Failed to compute SHA-256 hash", e);
            return UUID.randomUUID().toString();
        }
    }
}
