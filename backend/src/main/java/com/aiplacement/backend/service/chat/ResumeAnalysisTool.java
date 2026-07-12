package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResumeAnalysisTool implements PlacementTool {

    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "resume-analysis";
    }

    @Override
    public String getDescription() {
        return "Extracts resume strengths and weaknesses for ATS optimization.";
    }

    @Override
    public String execute(String context) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return "{\"error\": \"Unauthenticated\"}";
        }
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "{\"error\": \"User not found\"}";
        }

        List<AtsAnalysis> analyses = atsAnalysisRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
        if (analyses.isEmpty()) {
            return "{\n" +
                   "  \"widgets\": [\n" +
                   "    {\n" +
                   "      \"type\": \"comparison\",\n" +
                   "      \"title\": \"ATS Resume Improvements\",\n" +
                   "      \"data\": {\n" +
                   "        \"score\": 0,\n" +
                   "        \"strengths\": [],\n" +
                   "        \"weaknesses\": [\"Insufficient information. Please upload a resume first.\"],\n" +
                   "        \"recommendations\": []\n" +
                   "      }\n" +
                   "    }\n" +
                   "  ]\n" +
                   "}";
        }

        AtsAnalysis latest = analyses.get(0);
        int score = latest.getAtsScore() != null ? latest.getAtsScore() : 60;
        List<String> strengths = latest.getStrengths() != null ? latest.getStrengths() : List.of();
        List<String> weaknesses = latest.getWeaknesses() != null ? latest.getWeaknesses() : List.of();
        List<String> recommendations = latest.getSuggestions() != null ? latest.getSuggestions() : List.of();

        // Safe JSON string creation
        String strengthsJson = "[]";
        String weaknessesJson = "[]";
        String recsJson = "[]";
        try {
            strengthsJson = objectMapper.writeValueAsString(strengths);
            weaknessesJson = objectMapper.writeValueAsString(weaknesses);
            recsJson = objectMapper.writeValueAsString(recommendations);
        } catch (Exception ex) {
            log.error("Failed to serialize list to JSON", ex);
        }

        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"comparison\",\n" +
               "      \"title\": \"ATS Resume Improvements\",\n" +
               "      \"data\": {\n" +
               "        \"score\": " + score + ",\n" +
               "        \"strengths\": " + strengthsJson + ",\n" +
               "        \"weaknesses\": " + weaknessesJson + ",\n" +
               "        \"recommendations\": " + recsJson + "\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
