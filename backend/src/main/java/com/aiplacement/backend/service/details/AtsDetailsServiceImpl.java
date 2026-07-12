package com.aiplacement.backend.service.details;

import com.aiplacement.backend.dto.AtsResponseDto;
import com.aiplacement.backend.dto.details.AtsDetailsDto;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsDetailsServiceImpl implements AtsDetailsService {

    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public AtsDetailsDto getDetails(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException("User not found")
                        );

        AtsAnalysis analysis =
                atsAnalysisRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(
                                () -> new com.aiplacement.backend.exception.ResourceNotFoundException(
                                        "ATS report not found for id: " + id
                                )
                        );

        if (analysis.getRawJson() != null) {
            try {
                AtsResponseDto responseDto = objectMapper.readValue(analysis.getRawJson(), AtsResponseDto.class);
                return AtsDetailsDto.builder()
                        .id(analysis.getId())
                        .atsScore(responseDto.getAtsScore())
                        .strengths(safe(responseDto.getStrengths()))
                        .weaknesses(safe(responseDto.getWeaknesses()))
                        .missingKeywords(safe(responseDto.getMissingKeywords()))
                        .matchedKeywords(safe(responseDto.getMatchedKeywords()))
                        .suggestions(safe(responseDto.getSuggestions()))
                        .bestRole(responseDto.getBestRole())
                        .extractedText(analysis.getExtractedText() != null ? analysis.getExtractedText() : "")
                        .createdAt(analysis.getCreatedAt())
                        .industry(responseDto.getIndustry())
                        .careerDomain(responseDto.getCareerDomain())
                        .primaryProfession(responseDto.getPrimaryProfession())
                        .subDomain(responseDto.getSubDomain())
                        .careerDomainConfidence(responseDto.getCareerDomainConfidence())
                        .experienceLevelConfidence(responseDto.getExperienceLevelConfidence())
                        .primaryProfessionConfidence(responseDto.getPrimaryProfessionConfidence())
                        .industryConfidence(responseDto.getIndustryConfidence())
                        .experienceLevel(responseDto.getExperienceLevel())
                        .targetRole(responseDto.getTargetRole())
                        .placementReadiness(responseDto.getPlacementReadiness())
                        .criticalSkills(responseDto.getCriticalSkills())
                        .importantSkills(responseDto.getImportantSkills())
                        .niceToHaveSkills(responseDto.getNiceToHaveSkills())
                        .companyMatches(responseDto.getCompanyMatches())
                        .improvements(responseDto.getImprovements())
                        .detailedSuggestions(responseDto.getDetailedSuggestions())
                        .isJobDescriptionComparison(responseDto.getIsJobDescriptionComparison())
                        .jobDescriptionTitle(responseDto.getJobDescriptionTitle())
                        .scoreBand(responseDto.getScoreBand())
                        .candidateType(responseDto.getCandidateType())
                        .candidateTypeConfidence(responseDto.getCandidateTypeConfidence())
                        .candidateTypeEvidence(responseDto.getCandidateTypeEvidence())
                        .confidence(responseDto.getConfidence())
                        .parseConfidence(responseDto.getParseConfidence())
                        .parseWarnings(responseDto.getParseWarnings())
                        .extractedCharacterCount(responseDto.getExtractedCharacterCount())
                        .detectedSectionCount(responseDto.getDetectedSectionCount())
                        .checks(responseDto.getChecks())
                        .skillEvidence(responseDto.getSkillEvidence())
                        .weakBullets(responseDto.getWeakBullets())
                        .topStrengths(responseDto.getTopStrengths())
                        .criticalIssues(responseDto.getCriticalIssues())
                        .quickWins(responseDto.getQuickWins())
                        .atsSectionScores(responseDto.getAtsSectionScores())
                        .build();
            } catch (Exception ex) {
                log.error("Failed to parse rawJson from database", ex);
            }
        }

        return AtsDetailsDto.builder()
                .id(analysis.getId())
                .atsScore(analysis.getAtsScore())
                .strengths(safe(analysis.getStrengths()))
                .weaknesses(safe(analysis.getWeaknesses()))
                .missingKeywords(safe(analysis.getMissingKeywords()))
                .matchedKeywords(safe(analysis.getMatchedKeywords()))
                .suggestions(safe(analysis.getSuggestions()))
                .bestRole(analysis.getBestRole())
                .extractedText(analysis.getExtractedText() != null ? analysis.getExtractedText() : "")
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteAnalysis(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException("User not found")
                        );

        AtsAnalysis analysis =
                atsAnalysisRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(
                                () -> new RuntimeException("ATS report not found")
                        );

        atsAnalysisRepository.delete(analysis);
    }

    private static List<String> safe(List<String> list) {
        if (list != null) {
            return list;
        }
        return Collections.emptyList();
    }
}