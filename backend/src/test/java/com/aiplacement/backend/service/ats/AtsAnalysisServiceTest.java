package com.aiplacement.backend.service.ats;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.ats.*;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.exception.AtsInferenceParseException;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.PdfService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtsAnalysisServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private AtsAnalysisRepository atsAnalysisRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PdfService pdfService;

    @Mock
    private AIClient aiClient;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AtsAnalysisServiceImpl atsAnalysisService;

    private User testUser;
    private Resume testResume;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("student@placementai.com")
                .role(Role.STUDENT)
                .build();

        testResume = Resume.builder()
                .id(100L)
                .user(testUser)
                .filePath("http://example.com/resume.pdf")
                .extractedText("Extracted Resume Text for Testing with Java and Spring Boot experience.")
                .createdAt(LocalDateTime.now())
                .build();

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("student@placementai.com");
        SecurityContextHolder.setContext(securityContext);

        lenient().when(userRepository.findByEmail("student@placementai.com")).thenReturn(Optional.of(testUser));
        lenient().when(resumeRepository.findById(100L)).thenReturn(Optional.of(testResume));
    }

    @Test
    @DisplayName("1. Should throw AtsInferenceParseException when AI returns malformed JSON, fenced error, or empty response")
    void testAtsInferenceParseExceptionHandling() {
        // Case A: Malformed JSON
        when(aiClient.generate(anyString(), anyString(), anyDouble(), anyInt()))
                .thenReturn("THIS IS NOT VALID JSON AT ALL");

        assertThatThrownBy(() -> atsAnalysisService.analyzeGeneral(100L))
                .isInstanceOf(AtsInferenceParseException.class)
                .hasMessageContaining("Failed to parse AI general ATS response")
                .extracting("rawResponseBody")
                .isEqualTo("THIS IS NOT VALID JSON AT ALL");

        // Case B: Markdown-fenced non-JSON content
        when(aiClient.generate(anyString(), anyString(), anyDouble(), anyInt()))
                .thenReturn("```json\n{ invalid_json_keys: \n```");

        assertThatThrownBy(() -> atsAnalysisService.analyzeGeneral(100L))
                .isInstanceOf(AtsInferenceParseException.class)
                .extracting("rawResponseBody")
                .isEqualTo("```json\n{ invalid_json_keys: \n```");

        // Case C: Empty response
        when(aiClient.generate(anyString(), anyString(), anyDouble(), anyInt()))
                .thenReturn("");

        assertThatThrownBy(() -> atsAnalysisService.analyzeGeneral(100L))
                .isInstanceOf(AtsInferenceParseException.class);
    }

    @Test
    @DisplayName("2. Regex-based 'X+ years' override correctly beats AI's own jd_inferred_level when conflicting")
    void testRegexYearsOverrideBeatsAiInferredLevel() {
        // AI returns JUNIOR, but raw JD text states "5+ years experience" -> should override to SENIOR
        String validAiJson = "{\n" +
                "  \"inferredRole\": \"Senior Software Engineer\",\n" +
                "  \"inferredExperienceLevel\": \"MID\",\n" +
                "  \"jdInferredLevel\": \"JUNIOR\",\n" +
                "  \"inferenceConfidence\": 0.90,\n" +
                "  \"atsScore\": 80,\n" +
                "  \"coreFitScore\": 85,\n" +
                "  \"fullJdMatchScore\": 80\n" +
                "}";

        when(aiClient.generate(anyString(), anyString(), anyDouble(), anyInt())).thenReturn(validAiJson);
        when(atsAnalysisRepository.save(any(AtsAnalysis.class))).thenAnswer(inv -> inv.getArgument(0));

        AtsJdScanRequestDto req1 = AtsJdScanRequestDto.builder()
                .resumeId(100L)
                .jdText("Looking for a Developer with 5+ years experience in Java and Cloud microservices.")
                .build();

        AtsJdScanResponseDto res1 = atsAnalysisService.analyzeAgainstJd(100L, req1);

        // 5+ years regex maps to SENIOR tier, overriding AI's "JUNIOR"
        assertThat(res1.getJdInferredLevel()).isEqualTo(SeniorityTier.SENIOR);
        assertThat(res1.getLevelGapDetected()).isTrue(); // JdLevel SENIOR > CandidateInferred MID

        // Test phrasing 2: "3-5 years experience" -> JUNIOR tier
        AtsJdScanRequestDto req2 = AtsJdScanRequestDto.builder()
                .resumeId(100L)
                .jdText("Position requires 3-5 years experience in Software Development.")
                .build();

        AtsJdScanResponseDto res2 = atsAnalysisService.analyzeAgainstJd(100L, req2);
        assertThat(res2.getJdInferredLevel()).isEqualTo(SeniorityTier.JUNIOR);

        // Test phrasing 3: "minimum 7 years" -> SENIOR tier (5-8 years)
        AtsJdScanRequestDto req3 = AtsJdScanRequestDto.builder()
                .resumeId(100L)
                .jdText("Minimum 7 years experience required for Lead Architect role.")
                .build();

        AtsJdScanResponseDto res3 = atsAnalysisService.analyzeAgainstJd(100L, req3);
        assertThat(res3.getJdInferredLevel()).isEqualTo(SeniorityTier.SENIOR);
    }

    @Test
    @DisplayName("3. overrideExperienceLevel recomputes coreFitScore/levelGapDetected without re-calling AI client")
    void testOverrideExperienceLevelRecomputesWithoutAiRecall() {
        AtsAnalysis existingJdScan = AtsAnalysis.builder()
                .id(500L)
                .user(testUser)
                .resume(testResume)
                .scanType(ScanType.JD_BASED)
                .inferredExperienceLevel(SeniorityTier.JUNIOR)
                .jdInferredLevel(SeniorityTier.SENIOR)
                .levelGapDetected(true)
                .coreFitScore(70)
                .atsScore(75)
                .createdAt(LocalDateTime.now())
                .build();

        when(atsAnalysisRepository.findById(500L)).thenReturn(Optional.of(existingJdScan));
        when(atsAnalysisRepository.save(any(AtsAnalysis.class))).thenAnswer(inv -> inv.getArgument(0));

        // Override level to SENIOR (equal to JD level SENIOR)
        Object responseObj = atsAnalysisService.overrideExperienceLevel(500L, SeniorityTier.SENIOR);

        assertThat(responseObj).isInstanceOf(AtsJdScanResponseDto.class);
        AtsJdScanResponseDto response = (AtsJdScanResponseDto) responseObj;

        assertThat(response.getCandidateOverrideLevel()).isEqualTo(SeniorityTier.SENIOR);
        assertThat(response.getEffectiveExperienceLevel()).isEqualTo(SeniorityTier.SENIOR);
        assertThat(response.getLevelGapDetected()).isFalse(); // SENIOR is not < SENIOR
        assertThat(response.getCoreFitScore()).isEqualTo(80); // Recomputed locally

        // Crucial Assertion: Zero calls to AI client during experience level override!
        verifyNoInteractions(aiClient);
    }

    @Test
    @DisplayName("4. Creates GENERAL + JD_BASED scans for same resumeId, history returns both newest first")
    void testMultipleScansAndHistoryOrdering() {
        AtsAnalysis scan1 = AtsAnalysis.builder()
                .id(101L)
                .resume(testResume)
                .scanType(ScanType.GENERAL)
                .atsScore(85)
                .createdAt(LocalDateTime.of(2026, 8, 1, 10, 0))
                .build();

        AtsAnalysis scan2 = AtsAnalysis.builder()
                .id(102L)
                .resume(testResume)
                .scanType(ScanType.JD_BASED)
                .atsScore(90)
                .coreFitScore(92)
                .fullJdMatchScore(88)
                .jdTextSnapshot("Target JD snapshot text")
                .createdAt(LocalDateTime.of(2026, 8, 3, 14, 0))
                .build();

        List<AtsAnalysis> repoAnalyses = new ArrayList<>(List.of(scan1, scan2));
        when(atsAnalysisRepository.findByResumeId(100L)).thenReturn(repoAnalyses);

        List<Object> history = atsAnalysisService.getScanHistoryByResumeId(100L);

        assertThat(history).hasSize(2);
        // Newest first -> scan2 (Aug 3) then scan1 (Aug 1)
        assertThat(history.get(0)).isInstanceOf(AtsJdScanResponseDto.class);
        assertThat(((AtsJdScanResponseDto) history.get(0)).getAnalysisId()).isEqualTo(102L);

        assertThat(history.get(1)).isInstanceOf(AtsGeneralScanResponseDto.class);
        assertThat(((AtsGeneralScanResponseDto) history.get(1)).getAnalysisId()).isEqualTo(101L);
    }
}
