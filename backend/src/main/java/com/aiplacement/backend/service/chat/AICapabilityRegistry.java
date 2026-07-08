package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AICapability;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AICapabilityRegistry {

    private final Map<String, AICapability> capabilities = new ConcurrentHashMap<>();

    public AICapabilityRegistry() {
        register(AICapability.builder()
                .name("general-chat")
                .version("1.0.0")
                .description("Generates conversational guidance and career answers")
                .requiredPermissions(List.of("ROLE_STUDENT", "ROLE_RECRUITER"))
                .isActive(true)
                .build());

        register(AICapability.builder()
                .name("ats-analysis")
                .version("1.2.0")
                .description("Enforces resume compliance validation score tracking")
                .requiredPermissions(List.of("ROLE_STUDENT"))
                .isActive(true)
                .build());

        register(AICapability.builder()
                .name("career-roadmap")
                .version("1.1.0")
                .description("Dynamically computes study blueprints based on skills")
                .requiredPermissions(List.of("ROLE_STUDENT"))
                .isActive(true)
                .build());
    }

    public void register(AICapability capability) {
        capabilities.put(capability.getName().toLowerCase(), capability);
    }

    public AICapability getCapability(String name) {
        return capabilities.get(name.toLowerCase());
    }

    public List<AICapability> getAllCapabilities() {
        return new ArrayList<>(capabilities.values());
    }
}
