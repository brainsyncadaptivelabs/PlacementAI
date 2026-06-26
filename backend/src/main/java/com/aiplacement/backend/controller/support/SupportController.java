package com.aiplacement.backend.controller.support;

import com.aiplacement.backend.dto.support.SupportTicketRequestDto;
import com.aiplacement.backend.entity.SupportTicket;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.SupportTicketRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    @PostMapping("/ticket")
    public ResponseEntity<String> createSupportTicket(@RequestBody SupportTicketRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Subject is required");
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message is required");
        }

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(request.getSubject())
                .message(request.getMessage())
                .status("OPEN")
                .build();

        supportTicketRepository.save(ticket);

        return ResponseEntity.ok("Support ticket submitted successfully");
    }
}
