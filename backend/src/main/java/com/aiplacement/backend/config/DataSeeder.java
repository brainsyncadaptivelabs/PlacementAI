package com.aiplacement.backend.config;

import com.aiplacement.backend.entity.Event;
import com.aiplacement.backend.repository.EventRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

import org.springframework.context.annotation.Profile;

/**
 * Development data seeder.
 *
 * <p>Seeds only user-facing scheduling data (Events) for the first registered user,
 * ensuring the dashboard is non-empty in development without injecting fabricated analytics.
 *
 * <p><b>Zero Mock Rule:</b> This seeder MUST NOT seed ATS scores, interview scores,
 * readiness metrics, or any other analytics. All metrics must flow through
 * {@link com.aiplacement.backend.service.shared.PlacementReadinessService}.
 */
@Configuration
@Profile({"local", "dev", "test"})
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Override
    public void run(String... args) throws Exception {
        userRepository.findAll().stream().findFirst().ifPresent(user -> {
            if (eventRepository.count() == 0) {
                Event event1 = Event.builder()
                        .company("Google")
                        .type("Technical Interview")
                        .eventDate("June 15")
                        .eventTime("11:00 AM")
                        .color("bg-red-500")
                        .user(user)
                        .build();

                Event event2 = Event.builder()
                        .company("Meta")
                        .type("System Design")
                        .eventDate("June 18")
                        .eventTime("03:30 PM")
                        .color("bg-blue-600")
                        .user(user)
                        .build();

                eventRepository.saveAll(List.of(event1, event2));
            }
        });
    }
}
