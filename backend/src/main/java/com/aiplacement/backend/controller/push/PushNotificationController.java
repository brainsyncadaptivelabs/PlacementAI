package com.aiplacement.backend.controller.push;

import com.aiplacement.backend.dto.push.PushSubscriptionRequestDto;
import com.aiplacement.backend.entity.PushSubscription;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.PushSubscriptionRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1/push")
@RequiredArgsConstructor
public class PushNotificationController {

    private final PushSubscriptionRepository repository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;

    @PostMapping("/subscribe")
    @Transactional
    public ResponseEntity<?> subscribe(@RequestBody PushSubscriptionRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (repository.findByEndpoint(request.getEndpoint()).isEmpty()) {
            PushSubscription sub = PushSubscription.builder()
                    .user(user)
                    .endpoint(request.getEndpoint())
                    .p256dh(request.getKeys().getP256dh())
                    .auth(request.getKeys().getAuth())
                    .build();
            repository.save(sub);
        }

        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/unsubscribe")
    @Transactional
    public ResponseEntity<?> unsubscribe(@RequestBody PushSubscriptionRequestDto request) {
        repository.findByEndpoint(request.getEndpoint()).ifPresent(repository::delete);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test")
    public ResponseEntity<?> testNotification() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        pushNotificationService.sendNotification(user, "Test Notification", "This is a test web push notification from AI Placement!");
        return ResponseEntity.ok("Notification sent");
    }
}
