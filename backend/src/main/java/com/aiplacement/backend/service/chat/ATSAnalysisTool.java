package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ATSAnalysisTool implements PlacementTool {

    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;

    @Override
    public String getName() {
        return "ats-analysis";
    }

    @Override
    public String getDescription() {
        return "Executes Resume compliance calculations";
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
                   "      \"type\": \"progress\",\n" +
                   "      \"title\": \"Resume ATS Performance Metric\",\n" +
                   "      \"data\": {\n" +
                   "        \"score\": 0,\n" +
                   "        \"label\": \"Insufficient information. Please upload a resume first.\",\n" +
                   "        \"status\": \"warning\"\n" +
                   "      }\n" +
                   "    }\n" +
                   "  ]\n" +
                   "}";
        }

        AtsAnalysis latest = analyses.get(0);
        int score = latest.getAtsScore() != null ? latest.getAtsScore() : 60;
        String role = latest.getBestRole() != null ? latest.getBestRole() : "Professional";
        String status = score >= 80 ? "success" : "warning";

        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"progress\",\n" +
               "      \"title\": \"Resume ATS Performance Metric\",\n" +
               "      \"data\": {\n" +
               "        \"score\": " + score + ",\n" +
               "        \"label\": \"Ready for " + role + " Role\",\n" +
               "        \"status\": \"" + status + "\"\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
