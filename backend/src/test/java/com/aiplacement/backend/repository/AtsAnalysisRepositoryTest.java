package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.ScanType;
import com.aiplacement.backend.entity.SeniorityTier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AtsAnalysisRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AtsAnalysisRepository atsAnalysisRepository;

    @Test
    @DisplayName("Should persist multiple AtsAnalysis rows (GENERAL and JD_BASED) for a single resume without unique constraint violations")
    void testMultipleScansPerResume() {
        Resume resume = Resume.builder()
                .filePath("http://example.com/resume.pdf")
                .extractedText("Java Developer Resume Text")
                .createdAt(LocalDateTime.now())
                .build();
        entityManager.persistAndFlush(resume);

        AtsAnalysis generalScan = AtsAnalysis.builder()
                .resume(resume)
                .scanType(ScanType.GENERAL)
                .atsScore(85)
                .inferredRole("Backend Engineer")
                .inferredExperienceLevel(SeniorityTier.MID)
                .inferenceConfidence(0.92)
                .inferenceReasoning("Strong experience with Java and Spring Boot.")
                .growthAreas(List.of("System Design", "Cloud Infrastructure"))
                .createdAt(LocalDateTime.now())
                .build();
        atsAnalysisRepository.save(generalScan);

        AtsAnalysis jdScan = AtsAnalysis.builder()
                .resume(resume)
                .scanType(ScanType.JD_BASED)
                .atsScore(78)
                .coreFitScore(82)
                .fullJdMatchScore(75)
                .inferredRole("Senior Backend Engineer")
                .inferredExperienceLevel(SeniorityTier.MID)
                .jdInferredLevel(SeniorityTier.SENIOR)
                .levelGapDetected(true)
                .jdTextSnapshot("Looking for a Senior Backend Engineer with Kubernetes experience.")
                .growthAreas(List.of("Kubernetes", "Distributed Systems"))
                .createdAt(LocalDateTime.now())
                .build();
        atsAnalysisRepository.save(jdScan);

        List<AtsAnalysis> scans = atsAnalysisRepository.findByResumeId(resume.getId());
        assertThat(scans).hasSize(2);

        AtsAnalysis fetchedGeneral = scans.stream().filter(s -> s.getScanType() == ScanType.GENERAL).findFirst().orElseThrow();
        assertThat(fetchedGeneral.getAtsScore()).isEqualTo(85);
        assertThat(fetchedGeneral.getGrowthAreas()).containsExactly("System Design", "Cloud Infrastructure");

        AtsAnalysis fetchedJd = scans.stream().filter(s -> s.getScanType() == ScanType.JD_BASED).findFirst().orElseThrow();
        assertThat(fetchedJd.getCoreFitScore()).isEqualTo(82);
        assertThat(fetchedJd.getFullJdMatchScore()).isEqualTo(75);
        assertThat(fetchedJd.getLevelGapDetected()).isTrue();
        assertThat(fetchedJd.getJdTextSnapshot()).contains("Kubernetes");
        assertThat(fetchedJd.getGrowthAreas()).containsExactly("Kubernetes", "Distributed Systems");
    }
}
