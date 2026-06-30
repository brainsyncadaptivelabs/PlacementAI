package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.CompanyRequirement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.shared.CompanyRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CompanyReadinessService {
    
    private final CompanyRequirementRepository companyRequirementRepository;

    public Map<String, Integer> calculateCompanyReadiness(User user) {
        Map<String, Integer> readiness = new HashMap<>();
        List<CompanyRequirement> requirements = companyRequirementRepository.findAll();
        
        String userSkills = user.getSkills() != null ? user.getSkills().toLowerCase() : "";
        
        for (CompanyRequirement req : requirements) {
            if (req.getRequiredSkills() == null || req.getRequiredSkills().isEmpty()) {
                readiness.put(req.getCompanyName(), 0);
                continue;
            }
            
            String[] reqSkills = req.getRequiredSkills().split(",");
            int matchCount = 0;
            for (String skill : reqSkills) {
                if (userSkills.contains(skill.trim().toLowerCase())) {
                    matchCount++;
                }
            }
            
            int percentage = (int) Math.round(((double) matchCount / reqSkills.length) * 100);
            readiness.put(req.getCompanyName(), percentage);
        }
        
        return readiness;
    }
}
