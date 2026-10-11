package com.aiplacement.backend.performance;

import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserFeatureUsage;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.UserFeatureUsageRepository;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
import com.aiplacement.backend.repository.coding.ProgramOfDayRepository;
import com.aiplacement.backend.repository.coding.CodingStreakRepository;
import com.aiplacement.backend.service.payment.FeatureEntitlementService;
import com.aiplacement.backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DatabaseAndConcurrencyPerformanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFeatureUsageRepository userFeatureUsageRepository;

    @Autowired
    private FeatureEntitlementService featureEntitlementService;

    @Autowired
    private AtsAnalysisRepository atsAnalysisRepository;

    @Autowired
    private CodingProblemRepository codingProblemRepository;

    @Autowired
    private ProgramOfDayRepository programOfDayRepository;

    @Autowired
    private CodingStreakRepository codingStreakRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        public JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    private User testStudent;
    private String studentToken;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        String email = "perf_student_" + System.currentTimeMillis() + "@example.com";
        testStudent = User.builder()
                .email(email)
                .fullName("Performance Test Student")
                .password(passwordEncoder.encode("TestPassword123!"))
                .role(Role.STUDENT)
                .collegeName("Apex Institute of Technology")
                .branch("Computer Science")
                .graduationYear(2026)
                .plan("FREE")
                .emailVerified(true)
                .build();
        testStudent = userRepository.save(testStudent);
        studentToken = "Bearer " + jwtService.generateAccessToken(testStudent.getEmail(), "STUDENT");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        if (testStudent != null && testStudent.getId() != null) {
            programOfDayRepository.deleteByUserId(testStudent.getId());
            codingStreakRepository.deleteByUserId(testStudent.getId());
            userFeatureUsageRepository.findByUserId(testStudent.getId())
                    .forEach(u -> userFeatureUsageRepository.delete(u));
            userRepository.deleteById(testStudent.getId());
        }
    }

    @Test
    @DisplayName("Concurrency: 50 concurrent threads reserving quota cannot exceed maximum limit")
    void testConcurrentQuotaConsumptionIntegrity() throws Exception {
        int threads = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch readyLatch = new CountDownLatch(threads);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    // Attempt to reserve 1.0 unit of ATS_ANALYSIS for free tier (limit = 4)
                    var reservation = featureEntitlementService.reserveUsage(
                            testStudent,
                            "ATS_ANALYSIS",
                            1.0
                    );
                    if (reservation != null && reservation.getId() != null) {
                        successCount.incrementAndGet();
                    } else {
                        rejectedCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    rejectedCount.incrementAndGet();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown(); // Release all threads simultaneously

        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdown();

        // Total allowed for ATS_ANALYSIS on FREE tier is 4.0
        assertTrue(successCount.get() <= 4, "Successful reservations must never exceed free quota limit (4), but was: " + successCount.get());
        assertEquals(threads, successCount.get() + rejectedCount.get(), "All concurrent requests must be accounted for");
    }

    @Test
    @DisplayName("Database: Filtered candidate search executes cleanly with indexed role and college")
    void testCandidateSearchPerformance() {
        // Query candidate pool using Spring Data JPA repository method
        var page = userRepository.searchStudentsForRecruiter(
                "Apex",
                "Apex Institute of Technology",
                "Computer Science",
                2026,
                org.springframework.data.domain.PageRequest.of(0, 10)
        );
        assertNotNull(page);
        assertFalse(page.isEmpty());
        assertEquals("Apex Institute of Technology", page.getContent().get(0).getCollegeName());
    }

    @Test
    @DisplayName("API Latency Baseline: Authenticated student profile endpoint p99 under sequential load")
    void testSequentialProfileLatencyBaseline() throws Exception {
        int iterations = 20;
        List<Long> latencies = new ArrayList<>();

        for (int i = 0; i < iterations; i++) {
            long start = System.nanoTime();
            mockMvc.perform(get("/api/v1/profile/me")
                            .header("Authorization", studentToken))
                    .andExpect(status().isOk());
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            latencies.add(elapsedMs);
        }

        latencies.sort(Long::compareTo);
        long p50 = latencies.get(iterations / 2);
        long p95 = latencies.get((int) (iterations * 0.95));
        long p99 = latencies.get(iterations - 1);

        assertTrue(p50 < 200, "p50 latency should be under 200ms, actual: " + p50 + "ms");
        assertTrue(p99 < 1000, "p99 latency should be under 1000ms, actual: " + p99 + "ms");
    }

    @Test
    @DisplayName("API Resiliency: Public banner endpoint returns 200 without authentication under load")
    void testPublicBannerLatencyBaseline() throws Exception {
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(get("/api/v1/announcements/active-banner"))
                    .andExpect(status().isOk());
        }
    }
}
