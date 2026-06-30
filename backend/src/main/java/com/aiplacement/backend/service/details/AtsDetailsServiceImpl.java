package com.aiplacement.backend.service.details;

import com.aiplacement.backend.dto.details.AtsDetailsDto;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor

public class AtsDetailsServiceImpl
        implements AtsDetailsService {

    private final AtsAnalysisRepository atsAnalysisRepository;

    private final UserRepository userRepository;

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

    /** Null-safe wrapper — returns empty list instead of null for @ElementCollection fields */
    private static List<String> safe(List<String> list) {
        return list != null ? list : Collections.emptyList();
    }
}