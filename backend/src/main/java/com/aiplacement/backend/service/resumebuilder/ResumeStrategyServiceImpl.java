package com.aiplacement.backend.service.resumebuilder;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.jd.JdMatchRequestDto;
import com.aiplacement.backend.dto.jd.JdMatchResponseDto;
import com.aiplacement.backend.dto.resumebuilder.JdAnalysisResponse;
import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.service.jd.JdMatchService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeStrategyServiceImpl implements ResumeStrategyService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JdMatchService jdMatchService;
    private final AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public JdAnalysisResponse buildStrategy(JdAnalysisResponse analysis, String jobDescription) {
        User user = getAuthenticatedUser();
        Optional<Resume> latestResumeOpt = Optional.empty();
        if (user != null) {
            latestResumeOpt = resumeRepository.findFirstByUserOrderByCreatedAtDesc(user);
        }

        int currentMatch = 35; // default for fresh start
        String resumeText = "No current resume uploaded.";

        if (latestResumeOpt.isPresent()) {
            Resume resume = latestResumeOpt.get();
            resumeText = resume.getExtractedText();
            try {
                JdMatchRequestDto matchRequest = JdMatchRequestDto.builder()
                        .resumeText(resumeText)
                        .jobDescription(jobDescription)
                        .build();
                JdMatchResponseDto matchResponse = jdMatchService.matchJobDescription(matchRequest);
                currentMatch = matchResponse.getMatchPercentage();
            } catch (Exception e) {
                log.warn("Failed to calculate current ATS match: {}", e.getMessage());
                currentMatch = 45; // fallback
            }
        }

        int estimatedMatch = Math.min(Math.max(currentMatch + 20, 85), 98);

        String prompt = "You are a senior career advisor. Compare the candidate's current resume against the job description (JD) and suggest tailored, high-impact replacements for the following sections:\n" +
                "1. summary (A professional, result-driven 3-4 sentence pitch)\n" +
                "2. skills (A comma-separated list of most relevant skills)\n" +
                "3. experience (A list of 2-3 tailored bullet points using action verbs and STAR methodology)\n" +
                "4. projects (Tailored description for projects highlighting core stack matching the JD)\n" +
                "5. achievements (A bullet point highlighting quantifiable impact)\n\n" +
                "Return ONLY a valid JSON object matching this schema:\n" +
                "{\n" +
                "  \"summary\": \"suggested summary text\",\n" +
                "  \"skills\": \"suggested skills text\",\n" +
                "  \"experience\": \"suggested experience bullets\",\n" +
                "  \"projects\": \"suggested projects text\",\n" +
                "  \"achievements\": \"suggested achievements bullets\",\n" +
                "  \"recommendedTemplate\": \"Modern ATS\",\n" +
                "  \"recommendedTemplateReason\": \"Clean layout suitable for software developers.\"\n" +
                "}\n\n" +
                "Current Resume Text:\n" + resumeText + "\n\nJD:\n" + jobDescription;

        try {
            JsonNode jsonNode = aiClient.generateJson(
                    "You are a professional resume strategy consultant. Respond ONLY with valid JSON.",
                    prompt,
                    0.4,
                    2048,
                    e -> "{}"
            );

            Map<String, String> aiSuggestions = new HashMap<>();
            aiSuggestions.put("summary", jsonNode.has("summary") ? jsonNode.get("summary").asText() : "");
            aiSuggestions.put("skills", jsonNode.has("skills") ? jsonNode.get("skills").asText() : "");
            aiSuggestions.put("experience", jsonNode.has("experience") ? jsonNode.get("experience").asText() : "");
            aiSuggestions.put("projects", jsonNode.has("projects") ? jsonNode.get("projects").asText() : "");
            aiSuggestions.put("achievements", jsonNode.has("achievements") ? jsonNode.get("achievements").asText() : "");

            String recommendedTemplate = jsonNode.has("recommendedTemplate") ? jsonNode.get("recommendedTemplate").asText() : "Modern ATS";
            String recommendedTemplateReason = jsonNode.has("recommendedTemplateReason") ? jsonNode.get("recommendedTemplateReason").asText() : "Clean layout optimized for technical roles.";

            analysis.setCurrentMatch(currentMatch);
            analysis.setEstimatedMatch(estimatedMatch);
            analysis.setAiSuggestions(aiSuggestions);
            analysis.setRecommendedTemplate(recommendedTemplate);
            analysis.setRecommendedTemplateReason(recommendedTemplateReason);

        } catch (Exception e) {
            log.error("Failed to build optimization strategy: {}", e.getMessage(), e);
            // set default values on error
            analysis.setCurrentMatch(currentMatch);
            analysis.setEstimatedMatch(estimatedMatch);
            analysis.setAiSuggestions(new HashMap<>());
            analysis.setRecommendedTemplate("Modern ATS");
            analysis.setRecommendedTemplateReason("Clean layout designed for ATS compatibility.");
        }

        return analysis;
    }
}
