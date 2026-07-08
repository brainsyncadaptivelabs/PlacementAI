package com.aiplacement.backend.placementintelligence.placementofficer;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CompanyDemandEngine {

    public List<Map<String, Object>> analyzeCompanyDemand(int eligibleCount) {
        List<Map<String, Object>> demands = new ArrayList<>();

        demands.add(createDemandRow("Accenture", 10, eligibleCount, 75, "Spring Boot, Docker"));
        demands.add(createDemandRow("TCS", 15, eligibleCount, 82, "Java, SQL"));
        demands.add(createDemandRow("Oracle", 4, eligibleCount, 60, "Database, Data Structures"));
        demands.add(createDemandRow("FAANG", 1, eligibleCount, 25, "System Design, Algorithms"));

        return demands;
    }

    private Map<String, Object> createDemandRow(
            String company, int invitedSize, int eligibleCount, int avgReadiness, String missingSkills) {

        Map<String, Object> map = new HashMap<>();
        map.put("companyName", company);
        map.put("slotsInvited", invitedSize);
        map.put("eligibleCount", Math.max(invitedSize, eligibleCount / 2));
        map.put("averageReadiness", avgReadiness);
        map.put("predictedSelections", Math.max(1, invitedSize / 2));
        map.put("missingSkills", missingSkills);
        return map;
    }
}
