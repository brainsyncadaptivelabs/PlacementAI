package com.aiplacement.backend.service.ats;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.ats.*;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.exception.AtsInferenceParseException;
import com.aiplacement.backend.exception.ResourceNotFoundException;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.PdfService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsAnalysisServiceImpl implements AtsAnalysisService {

    private final ResumeRepository resumeRepository;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;
    private final PdfService pdfService;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Regex patterns for explicit experience detection
    private static final Pattern YEARS_PATTERN_1 = Pattern.compile("(?i)(\\d+)\\s*\\+\\s*years?");
    private static final Pattern YEARS_PATTERN_2 = Pattern.compile("(?i)(\\d+)\\s*(?:-|to)\\s*(\\d+)\\s*years?\\s*(?:of)?\\s*experience");
    private static final Pattern YEARS_PATTERN_3 = Pattern.compile("(?i)(?:minimum|at\\s+least|requires?)\\s*(\\d+)\\s*years?");

    @Override
    @Transactional
    public AtsGeneralScanResponseDto analyzeGeneral(Long resumeId) {
        Resume resume = getAuthenticatedUserResume(resumeId);
        String resumeText = resume.getExtractedText();
        if (resumeText == null || resumeText.trim().isEmpty()) {
            throw new IllegalArgumentException("Resume extracted text is empty.");
        }

        String systemPrompt = "You are PlacementAI, an expert ATS resume analyser. Respond ONLY with valid JSON.";
        String userPrompt = "Analyze this resume text and infer experience level, role, confidence, strengths, weaknesses, and growth areas.\n" +
                "Respond ONLY with valid JSON matching the schema below. Do NOT use markdown code fences.\n" +
                "{\n" +
                "  \"inferredRole\": \"Backend Developer\",\n" +
                "  \"inferredExperienceLevel\": \"MID\",\n" +
                "  \"inferenceConfidence\": 0.90,\n" +
                "  \"inferenceReasoning\": \"Has 3 years of experience in Java and Spring Boot.\",\n" +
                "  \"atsScore\": 82,\n" +
                "  \"strengths\": [\"Strong Java foundation\", \"REST API design\"],\n" +
                "  \"weaknesses\": [\"Lacks Kubernetes deployment experience\"],\n" +
                "  \"missingKeywords\": [\"Docker\", \"Kubernetes\"],\n" +
                "  \"matchedKeywords\": [\"Java\", \"Spring Boot\", \"PostgreSQL\"],\n" +
                "  \"suggestions\": [\"Highlight Docker containerization projects\"],\n" +
                "  \"growthAreas\": [\"Microservices Architecture\", \"CI/CD Pipelines\"]\n" +
                "}\n\n" +
                "Resume Text:\n" + resumeText;

        String rawResponseString = null;
        JsonNode aiJson = null;
        try {
            rawResponseString = aiClient.generate(systemPrompt, userPrompt, 0.0, 2048);
            aiJson = parseAndValidateJson(rawResponseString);
        } catch (Exception e) {
            log.error("AI General ATS analysis failed for resume ID {}. Raw response: {}", resumeId, rawResponseString, e);
            throw new AtsInferenceParseException("Failed to parse AI general ATS response", rawResponseString != null ? rawResponseString : "", e);
        }

        String inferredRole = aiJson.has("inferredRole") ? aiJson.get("inferredRole").asText() : "Software Engineer";
        SeniorityTier inferredLevel = parseSeniorityTier(aiJson.has("inferredExperienceLevel") ? aiJson.get("inferredExperienceLevel").asText() : "MID");
        Double confidence = aiJson.has("inferenceConfidence") ? aiJson.get("inferenceConfidence").asDouble() : 0.85;
        String reasoning = aiJson.has("inferenceReasoning") ? aiJson.get("inferenceReasoning").asText() : "";
        Integer atsScore = aiJson.has("atsScore") ? aiJson.get("atsScore").asInt() : 75;

        List<String> strengths = jsonArrayToList(aiJson.get("strengths"));
        List<String> weaknesses = jsonArrayToList(aiJson.get("weaknesses"));
        List<String> missingKeywords = jsonArrayToList(aiJson.get("missingKeywords"));
        List<String> matchedKeywords = jsonArrayToList(aiJson.get("matchedKeywords"));
        List<String> suggestions = jsonArrayToList(aiJson.get("suggestions"));
        List<String> growthAreas = jsonArrayToList(aiJson.get("growthAreas"));

        AtsAnalysis analysis = AtsAnalysis.builder()
                .resume(resume)
                .user(resume.getUser())
                .scanType(ScanType.GENERAL)
                .atsScore(atsScore)
                .inferredRole(inferredRole)
                .inferredExperienceLevel(inferredLevel)
                .inferenceConfidence(confidence)
                .inferenceReasoning(reasoning)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .missingKeywords(missingKeywords)
                .matchedKeywords(matchedKeywords)
                .suggestions(suggestions)
                .growthAreas(growthAreas)
                .createdAt(LocalDateTime.now())
                .build();

        atsAnalysisRepository.save(analysis);

        return mapToGeneralDto(analysis);
    }

    @Override
    @Transactional
    public AtsJdScanResponseDto analyzeAgainstJd(Long resumeId, AtsJdScanRequestDto request) {
        Resume resume = getAuthenticatedUserResume(resumeId);

        String jdText = request.getJdText();
        if ((jdText == null || jdText.trim().isEmpty()) && request.getJdFileUrl() != null) {
            jdText = extractTextFromUrl(request.getJdFileUrl());
        }

        if (jdText == null || jdText.trim().isEmpty()) {
            throw new IllegalArgumentException("Target Job Description text could not be resolved.");
        }

        SeniorityTier regexDetectedTier = detectSeniorityTierFromJdRegex(jdText);

        String systemPrompt = "You are PlacementAI, an expert ATS JD match analyser. Respond ONLY with valid JSON.";
        String userPrompt = "Analyze this candidate resume against the target Job Description.\n" +
                "Respond ONLY with valid JSON matching the schema below. Do NOT use markdown code fences.\n" +
                "{\n" +
                "  \"inferredRole\": \"Backend Developer\",\n" +
                "  \"inferredExperienceLevel\": \"MID\",\n" +
                "  \"jdInferredLevel\": \"SENIOR\",\n" +
                "  \"inferenceConfidence\": 0.88,\n" +
                "  \"inferenceReasoning\": \"JD demands 5+ years experience requiring Senior tier.\",\n" +
                "  \"atsScore\": 78,\n" +
                "  \"coreFitScore\": 82,\n" +
                "  \"fullJdMatchScore\": 74,\n" +
                "  \"strengths\": [\"Matched core Java & REST API requirements\"],\n" +
                "  \"weaknesses\": [\"Missing Kubernetes requirement\"],\n" +
                "  \"missingKeywords\": [\"Kubernetes\", \"AWS\"],\n" +
                "  \"matchedKeywords\": [\"Java\", \"Spring Boot\"],\n" +
                "  \"suggestions\": [\"Add container orchestration experience\"],\n" +
                "  \"growthAreas\": [\"Cloud Infrastructure\", \"Kubernetes\"]\n" +
                "}\n\n" +
                "Target Job Description:\n" + jdText + "\n\n" +
                "Resume Text:\n" + resume.getExtractedText();

        String rawResponseString = null;
        JsonNode aiJson = null;
        try {
            rawResponseString = aiClient.generate(systemPrompt, userPrompt, 0.0, 2048);
            aiJson = parseAndValidateJson(rawResponseString);
        } catch (Exception e) {
            log.error("AI JD ATS analysis failed for resume ID {}. Raw response: {}", resumeId, rawResponseString, e);
            throw new AtsInferenceParseException("Failed to parse AI JD ATS response", rawResponseString != null ? rawResponseString : "", e);
        }

        String inferredRole = aiJson.has("inferredRole") ? aiJson.get("inferredRole").asText() : "Software Engineer";
        SeniorityTier candidateInferredLevel = parseSeniorityTier(aiJson.has("inferredExperienceLevel") ? aiJson.get("inferredExperienceLevel").asText() : "MID");
        SeniorityTier aiJdLevel = parseSeniorityTier(aiJson.has("jdInferredLevel") ? aiJson.get("jdInferredLevel").asText() : "MID");

        // Stated regex experience tier beats AI inferred level if regex found explicit years
        SeniorityTier finalJdLevel = regexDetectedTier != null ? regexDetectedTier : aiJdLevel;

        Double confidence = aiJson.has("inferenceConfidence") ? aiJson.get("inferenceConfidence").asDouble() : 0.85;
        String reasoning = aiJson.has("inferenceReasoning") ? aiJson.get("inferenceReasoning").asText() : "";
        Integer atsScore = aiJson.has("atsScore") ? aiJson.get("atsScore").asInt() : 75;
        Integer coreFitScore = aiJson.has("coreFitScore") ? aiJson.get("coreFitScore").asInt() : 80;
        Integer fullJdMatchScore = aiJson.has("fullJdMatchScore") ? aiJson.get("fullJdMatchScore").asInt() : 70;

        Boolean levelGapDetected = finalJdLevel.ordinal() > candidateInferredLevel.ordinal();

        List<String> strengths = jsonArrayToList(aiJson.get("strengths"));
        List<String> weaknesses = jsonArrayToList(aiJson.get("weaknesses"));
        List<String> missingKeywords = jsonArrayToList(aiJson.get("missingKeywords"));
        List<String> matchedKeywords = jsonArrayToList(aiJson.get("matchedKeywords"));
        List<String> suggestions = jsonArrayToList(aiJson.get("suggestions"));
        List<String> growthAreas = jsonArrayToList(aiJson.get("growthAreas"));

        AtsAnalysis analysis = AtsAnalysis.builder()
                .resume(resume)
                .user(resume.getUser())
                .scanType(ScanType.JD_BASED)
                .atsScore(atsScore)
                .coreFitScore(coreFitScore)
                .fullJdMatchScore(fullJdMatchScore)
                .inferredRole(inferredRole)
                .inferredExperienceLevel(candidateInferredLevel)
                .jdInferredLevel(finalJdLevel)
                .levelGapDetected(levelGapDetected)
                .inferenceConfidence(confidence)
                .inferenceReasoning(reasoning)
                .jdTextSnapshot(jdText)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .missingKeywords(missingKeywords)
                .matchedKeywords(matchedKeywords)
                .suggestions(suggestions)
                .growthAreas(growthAreas)
                .createdAt(LocalDateTime.now())
                .build();

        atsAnalysisRepository.save(analysis);

        return mapToJdDto(analysis);
    }

    @Override
    @Transactional
    public Object overrideExperienceLevel(Long analysisId, SeniorityTier newLevel) {
        AtsAnalysis analysis = atsAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("ATS Analysis not found with ID: " + analysisId));

        validateOwnership(analysis);

        analysis.setCandidateOverrideLevel(newLevel);

        if (analysis.getScanType() == ScanType.JD_BASED) {
            SeniorityTier effectiveCandidateLevel = resolveEffectiveExperienceLevel(analysis);
            SeniorityTier jdLevel = analysis.getJdInferredLevel() != null ? analysis.getJdInferredLevel() : SeniorityTier.MID;

            boolean gap = jdLevel.ordinal() > effectiveCandidateLevel.ordinal();
            analysis.setLevelGapDetected(gap);

            // Local recomputation of coreFitScore based on level gap delta (no AI re-call)
            SeniorityTier origLevel = analysis.getInferredExperienceLevel() != null ? analysis.getInferredExperienceLevel() : SeniorityTier.FRESHER;
            int candidateDelta = effectiveCandidateLevel.ordinal() - origLevel.ordinal();
            int baseCoreFit = analysis.getCoreFitScore() != null ? analysis.getCoreFitScore() : analysis.getAtsScore();
            int recomputedCoreFit = Math.min(100, Math.max(0, baseCoreFit + (candidateDelta * 5)));
            analysis.setCoreFitScore(recomputedCoreFit);
        }

        atsAnalysisRepository.save(analysis);

        if (analysis.getScanType() == ScanType.JD_BASED) {
            return mapToJdDto(analysis);
        } else {
            return mapToGeneralDto(analysis);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object> getScanHistoryByResumeId(Long resumeId) {
        Resume resume = getAuthenticatedUserResume(resumeId);
        List<AtsAnalysis> scans = atsAnalysisRepository.findByResumeId(resume.getId());

        scans.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        List<Object> dtos = new ArrayList<>();
        for (AtsAnalysis scan : scans) {
            if (scan.getScanType() == ScanType.JD_BASED) {
                dtos.add(mapToJdDto(scan));
            } else {
                dtos.add(mapToGeneralDto(scan));
            }
        }
        return dtos;
    }

    @Override
    public SeniorityTier resolveEffectiveExperienceLevel(AtsAnalysis analysis) {
        if (analysis == null) return SeniorityTier.FRESHER;
        return analysis.getCandidateOverrideLevel() != null ? analysis.getCandidateOverrideLevel() : analysis.getInferredExperienceLevel();
    }

    public SeniorityTier detectSeniorityTierFromJdRegex(String jdText) {
        if (jdText == null || jdText.trim().isEmpty()) return null;

        int years = -1;

        Matcher m1 = YEARS_PATTERN_1.matcher(jdText);
        if (m1.find()) {
            years = Integer.parseInt(m1.group(1));
        } else {
            Matcher m2 = YEARS_PATTERN_2.matcher(jdText);
            if (m2.find()) {
                years = Integer.parseInt(m2.group(1));
            } else {
                Matcher m3 = YEARS_PATTERN_3.matcher(jdText);
                if (m3.find()) {
                    years = Integer.parseInt(m3.group(1));
                }
            }
        }

        if (years < 0) return null;

        if (years <= 1) return SeniorityTier.FRESHER;
        if (years <= 4) return SeniorityTier.JUNIOR;
        if (years <= 8) return SeniorityTier.SENIOR;
        return SeniorityTier.LEAD;
    }

    private JsonNode parseAndValidateJson(String rawResponse) {
        if (rawResponse == null || rawResponse.trim().isEmpty()) {
            throw new IllegalArgumentException("AI response string is empty or null.");
        }

        String cleanJson = rawResponse.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        cleanJson = cleanJson.trim();

        try {
            return objectMapper.readTree(cleanJson);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JSON format", e);
        }
    }

    private Resume getAuthenticatedUserResume(Long resumeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with ID: " + resumeId));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to resume ID: " + resumeId);
        }
        return resume;
    }

    private void validateOwnership(AtsAnalysis analysis) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!analysis.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to analysis ID: " + analysis.getId());
        }
    }

    private String extractTextFromUrl(String url) {
        try {
            File file = new File(url);
            if (file.exists()) {
                return pdfService.extractText(file, file.getName());
            }
        } catch (Exception e) {
            log.warn("Failed to extract text from URL/File: {}", url, e);
        }
        return "";
    }

    private SeniorityTier parseSeniorityTier(String val) {
        if (val == null) return SeniorityTier.MID;
        try {
            return SeniorityTier.valueOf(val.toUpperCase());
        } catch (Exception e) {
            return SeniorityTier.MID;
        }
    }

    private List<String> jsonArrayToList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode elem : node) {
                list.add(elem.asText());
            }
        }
        return list;
    }

    private AtsGeneralScanResponseDto mapToGeneralDto(AtsAnalysis entity) {
        return AtsGeneralScanResponseDto.builder()
                .analysisId(entity.getId())
                .resumeId(entity.getResume() != null ? entity.getResume().getId() : null)
                .scanType(entity.getScanType())
                .atsScore(entity.getAtsScore())
                .inferredRole(entity.getInferredRole())
                .inferredExperienceLevel(entity.getInferredExperienceLevel())
                .inferenceConfidence(entity.getInferenceConfidence())
                .inferenceReasoning(entity.getInferenceReasoning())
                .candidateOverrideLevel(entity.getCandidateOverrideLevel())
                .effectiveExperienceLevel(resolveEffectiveExperienceLevel(entity))
                .strengths(entity.getStrengths())
                .weaknesses(entity.getWeaknesses())
                .missingKeywords(entity.getMissingKeywords())
                .matchedKeywords(entity.getMatchedKeywords())
                .suggestions(entity.getSuggestions())
                .growthAreas(entity.getGrowthAreas())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private AtsJdScanResponseDto mapToJdDto(AtsAnalysis entity) {
        return AtsJdScanResponseDto.builder()
                .analysisId(entity.getId())
                .resumeId(entity.getResume() != null ? entity.getResume().getId() : null)
                .scanType(entity.getScanType())
                .atsScore(entity.getAtsScore())
                .coreFitScore(entity.getCoreFitScore())
                .fullJdMatchScore(entity.getFullJdMatchScore())
                .inferredRole(entity.getInferredRole())
                .inferredExperienceLevel(entity.getInferredExperienceLevel())
                .jdInferredLevel(entity.getJdInferredLevel())
                .levelGapDetected(entity.getLevelGapDetected())
                .inferenceConfidence(entity.getInferenceConfidence())
                .inferenceReasoning(entity.getInferenceReasoning())
                .candidateOverrideLevel(entity.getCandidateOverrideLevel())
                .effectiveExperienceLevel(resolveEffectiveExperienceLevel(entity))
                .jdTextSnapshot(entity.getJdTextSnapshot())
                .strengths(entity.getStrengths())
                .weaknesses(entity.getWeaknesses())
                .missingKeywords(entity.getMissingKeywords())
                .matchedKeywords(entity.getMatchedKeywords())
                .suggestions(entity.getSuggestions())
                .growthAreas(entity.getGrowthAreas())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
