package com.aiplacement.backend.config;

import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.Event;
import com.aiplacement.backend.entity.InterviewRecord;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.EventRepository;
import com.aiplacement.backend.repository.InterviewRecordRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final InterviewRecordRepository interviewRecordRepository;

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

            if (atsAnalysisRepository.count() == 0) {
                AtsAnalysis analysis1 = AtsAnalysis.builder()
                        .atsScore(65)
                        .user(user)
                        .createdAt(LocalDateTime.now().minusDays(10))
                        .build();
                AtsAnalysis analysis2 = AtsAnalysis.builder()
                        .atsScore(72)
                        .user(user)
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .build();
                AtsAnalysis analysis3 = AtsAnalysis.builder()
                        .atsScore(85)
                        .user(user)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build();
                atsAnalysisRepository.saveAll(List.of(analysis1, analysis2, analysis3));
            }

            if (interviewRecordRepository.count() == 0) {
                InterviewRecord record1 = InterviewRecord.builder()
                        .role("Java Developer")
                        .score(70)
                        .user(user)
                        .interviewDate(LocalDateTime.now().minusDays(7))
                        .build();
                InterviewRecord record2 = InterviewRecord.builder()
                        .role("Backend Engineer")
                        .score(85)
                        .user(user)
                        .interviewDate(LocalDateTime.now().minusDays(2))
                        .build();
                interviewRecordRepository.saveAll(List.of(record1, record2));
            }
        });
    }
}
