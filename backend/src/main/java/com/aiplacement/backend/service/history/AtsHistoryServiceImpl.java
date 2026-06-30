package com.aiplacement.backend.service.history;

import com.aiplacement.backend.dto.history.AtsHistoryDto;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class AtsHistoryServiceImpl
        implements AtsHistoryService {

    private final AtsAnalysisRepository atsAnalysisRepository;

    private final UserRepository userRepository;

    @Override
    public List<AtsHistoryDto> getHistory() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        List<AtsAnalysis> analyses =
                atsAnalysisRepository
                        .findByUserOrderByCreatedAtDesc(
                                user
                        );

        return analyses.stream()
                .limit(10)
                .map(analysis -> {
                    String rawResumeName = (analysis.getResume() != null) ? analysis.getResume().getFileName() : "Unknown";
                    if (rawResumeName != null && rawResumeName.contains("_")) {
                        int index = rawResumeName.indexOf("_");
                        if (index < rawResumeName.length() - 1) {
                            rawResumeName = rawResumeName.substring(index + 1);
                        }
                    }
                    String grade = getGrade(analysis.getAtsScore());

                    return AtsHistoryDto.builder()
                            .id(analysis.getId())
                            .atsScore(analysis.getAtsScore())
                            .bestRole(analysis.getBestRole())
                            .resumeName(rawResumeName)
                            .grade(grade)
                            .createdAt(analysis.getCreatedAt())
                            .build();
                })
                .toList();
    }

    private static String getGrade(Integer score) {
        if (score == null) return "D";
        if (score >= 89) return "A+";
        if (score >= 79) return "A";
        if (score >= 66) return "B+";
        if (score >= 50) return "C";
        return "D";
    }
}