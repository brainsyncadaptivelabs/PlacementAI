package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserContextProvider implements ChatContextProvider {

    private final UserRepository userRepository;

    @Override
    public String provideContext(AISessionContext sessionContext) {
        if (sessionContext.getEmail() == null || "anonymous".equals(sessionContext.getEmail())) {
            return "Student: Anonymous Guest User";
        }
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(sessionContext.getEmail());
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            return String.format(
                "STUDENT PROFILE CONTEXT:\n- Name: %s\n- Email: %s\n- Target Role: %s\n",
                u.getFullName() != null ? u.getFullName() : "Not Specified",
                u.getEmail(),
                u.getDesignation() != null ? u.getDesignation() : "Not Specified"
            );
        }
        return "Student Context: Profile details unavailable.";
    }

    @Override
    public String getName() {
        return "UserContext";
    }
}
