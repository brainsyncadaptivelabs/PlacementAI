package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.exception.ai.AIException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PolicyEngine {

    private final UserRepository userRepository;

    public void enforceBusinessPolicy(AISessionContext sessionContext, String capabilityRequested) {
        if (sessionContext.getEmail() == null || "anonymous".equals(sessionContext.getEmail())) {
            log.warn("Anonymous user requested capability: {}", capabilityRequested);
            return;
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(sessionContext.getEmail());
        if (userOpt.isEmpty()) {
            throw new AIException("User validation failed. Access denied.");
        }

        User u = userOpt.get();
        Role userRole = u.getRole();

        log.info("Policy checks for user={}, role={}, capability={}", u.getEmail(), userRole, capabilityRequested);

        // Simple validation rule matching user permissions
        if ("RECRUITER_PANEL".equals(capabilityRequested) && userRole != Role.RECRUITER && userRole != Role.ADMIN) {
            log.error("Access denied for role {} on recruiter capabilities", userRole);
            throw new AIException("Access Denied: You do not have permissions to use recruiter capabilities.");
        }
    }
}
