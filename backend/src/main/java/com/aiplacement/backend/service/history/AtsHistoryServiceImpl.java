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

                .map(analysis ->
                        AtsHistoryDto.builder()

                                .atsScore(
                                        analysis.getAtsScore()
                                )

                                .bestRole(
                                        analysis.getBestRole()
                                )

                                .createdAt(
                                        analysis.getCreatedAt()
                                )

                                .build()
                )

                .toList();
    }
}