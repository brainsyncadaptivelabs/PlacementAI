package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecruiterMatchingEngine {

    public boolean matchesRequirements(User candidate, List<String> requiredSkills) {
        if (candidate.getSkills() == null) return false;
        String candidateSkills = candidate.getSkills().toLowerCase();

        for (String skill : requiredSkills) {
            if (candidateSkills.contains(skill.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
}
