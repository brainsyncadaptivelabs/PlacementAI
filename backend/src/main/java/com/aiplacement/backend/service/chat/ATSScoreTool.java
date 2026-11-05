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
public class ATSScoreTool implements PlacementTool {

    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;

    @Override
    public String getName() {
        return "ats-score";
    }

    @Override
    public String getDescription() {
        return "Calculates keywords matching ratio against standard templates.";
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
                   "  \"version\": 1,\n" +
                   "  \"schema\": \"placementai-widget-container\",\n" +
                   "  \"layout\": \"stack\",\n" +
                   "  \"widgets\": [\n" +
                   "    {\n" +
                   "      \"id\": \"ats-score-widget\",\n" +
                   "      \"type\": \"progress\",\n" +
                   "      \"priority\": 1,\n" +
                   "      \"title\": \"ATS Match Rating\",\n" +
                   "      \"data\": {\n" +
                   "        \"overall\": 0,\n" +
                   "        \"categories\": [\n" +
                   "          { \"name\": \"ATS Readiness (Resume Pending)\", \"score\": 0 }\n" +
                   "        ]\n" +
                   "      }\n" +
                   "    }\n" +
                   "  ]\n" +
                   "}";
        }

        AtsAnalysis latest = analyses.get(0);
        int score = latest.getAtsScore() != null ? latest.getAtsScore() : 60;
        String role = latest.getBestRole() != null ? latest.getBestRole() : "Professional";

        return "{\n" +
               "  \"version\": 1,\n" +
               "  \"schema\": \"placementai-widget-container\",\n" +
               "  \"layout\": \"stack\",\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"id\": \"ats-score-widget\",\n" +
               "      \"type\": \"progress\",\n" +
               "      \"priority\": 1,\n" +
               "      \"title\": \"ATS Match Rating\",\n" +
               "      \"data\": {\n" +
               "        \"overall\": " + score + ",\n" +
               "        \"categories\": [\n" +
               "          { \"name\": \"Match Rating for " + role + "\", \"score\": " + score + " }\n" +
               "        ]\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
