package com.aiplacement.backend.service.email;

import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTransactionHelper {

    private final UserRepository userRepository;

    @Transactional
    public void markWelcomeEmailSent(Long userId) {
        log.info("Updating welcomeEmailSent");
        userRepository.findById(userId).ifPresentOrElse(
            user -> {
                user.setWelcomeEmailSent(true);
                userRepository.save(user);
            },
            () -> log.error("User not found during welcomeEmailSent update: {}", userId)
        );
    }
}
