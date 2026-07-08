package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PlacementReadinessContextProvider implements ChatContextProvider {

    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;

    @Override
    public String provideContext(AISessionContext sessionContext) {
        if (sessionContext.getEmail() == null || "anonymous".equals(sessionContext.getEmail())) {
            return "";
        }
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(sessionContext.getEmail());
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(u);
            if (intel == null) {
                return "";
            }
            StringBuilder sb = new StringBuilder();
            sb.append("PLACEMENT READINESS INTELLIGENCE:\n");
            sb.append(String.format("- Overall Placement Readiness Score: %d/100\n", intel.getOverallPlacementReadiness()));
            sb.append(String.format("- Resume ATS Score: %d/100\n", intel.getAtsScore()));
            sb.append(String.format("- Target JD Match: %d%%\n", intel.getJdMatch()));
            sb.append(String.format("- Technical Coding Score: %d/100\n", intel.getCodingScore()));
            sb.append(String.format("- Interview Performance Score: %d/100\n", intel.getInterviewScore()));
            sb.append(String.format("- Salary Prediction Range: %s\n", intel.getSalaryPrediction() != null ? intel.getSalaryPrediction() : "TBD"));
            sb.append(String.format("- Estimated Hiring Probability: %d%%\n", intel.getHiringProbability()));
            if (intel.getCandidateStrengths() != null && !intel.getCandidateStrengths().isEmpty()) {
                sb.append("- Key Strengths: ").append(String.join(", ", intel.getCandidateStrengths())).append("\n");
            }
            if (intel.getWeaknesses() != null && !intel.getWeaknesses().isEmpty()) {
                sb.append("- Areas for Improvement: ").append(String.join(", ", intel.getWeaknesses())).append("\n");
            }
            if (intel.getSkillGaps() != null && !intel.getSkillGaps().isEmpty()) {
                sb.append("- Identified Skill Gaps: ").append(String.join(", ", intel.getSkillGaps())).append("\n");
            }
            return sb.toString();
        }
        return "";
    }

    @Override
    public String getName() {
        return "PlacementReadinessContext";
    }
}
