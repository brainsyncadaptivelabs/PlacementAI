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

@Service
@RequiredArgsConstructor

public class AtsDetailsServiceImpl
        implements AtsDetailsService {

    private final AtsAnalysisRepository atsAnalysisRepository;

    private final UserRepository userRepository;

    @Override
    public AtsDetailsDto getDetails(
            Long id
    ) {

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

        AtsAnalysis analysis =
                atsAnalysisRepository
                        .findByIdAndUser(
                                id,
                                user
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "ATS report not found"
                                )
                        );

        return AtsDetailsDto.builder()

                .atsScore(
                        analysis.getAtsScore()
                )

                .strengths(
                        analysis.getStrengths()
                )

                .weaknesses(
                        analysis.getWeaknesses()
                )

                .missingKeywords(
                        analysis.getMissingKeywords()
                )

                .bestRole(
                        analysis.getBestRole()
                )

                .createdAt(
                        analysis.getCreatedAt()
                )

                .build();
    }
}