package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.ShortlistResultDto;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.Job;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.JobRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Job-specific AI Shortlisting.
 * 
 * Given a Job ID, evaluates ALL eligible students using PlacementReadinessService
 * and returns the top candidates with full scorecards, AI reasons, risk flags.
 */
@Service
@RequiredArgsConstructor
public class SmartShortlistService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;

    // Weights for composite rank score
    private static final double W_READINESS = 0.30;
    private static final double W_ATS       = 0.20;
    private static final double W_JD        = 0.20;
    private static final double W_CODING    = 0.15;
    private static final double W_INTERVIEW = 0.15;

    public ShortlistResultDto shortlistForJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        // Fetch all students
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .collect(Collectors.toList());

        // Apply eligibility filters from job config
        List<User> eligible = allStudents.stream()
                .filter(s -> isEligible(s, job))
                .collect(Collectors.toList());

        // Score each eligible candidate
        List<ScoredCandidate> scored = eligible.stream()
                .map(student -> scoreCandidate(student, job))
                .sorted(Comparator.comparingInt((ScoredCandidate sc) -> sc.rankScore()).reversed())
                .collect(Collectors.toList());

        // Build top-30 (or fewer) candidate DTOs
        int limit = Math.min(scored.size(), 30);
        List<ShortlistResultDto.ShortlistedCandidateDto> topCandidates = scored.subList(0, limit)
                .stream()
                .map(sc -> buildCandidateDto(sc, job))
                .collect(Collectors.toList());

        return ShortlistResultDto.builder()
                .jobId(jobId)
                .jobTitle(job.getTitle())
                .companyName(job.getCompany())
                .totalEvaluated(eligible.size())
                .topCandidates(topCandidates)
                .build();
    }

    // ─── Eligibility gate ────────────────────────────────────────────────────────

    private boolean isEligible(User student, Job job) {
        // CGPA filter
        if (job.getMinCgpa() != null && student.getSkills() == null) {
            // No CGPA field on User — pass all for now; placeholder for future field
        }

        // Department filter
        if (job.getDepartments() != null && !job.getDepartments().isBlank()
                && student.getBranch() != null) {
            List<String> allowed = Arrays.stream(job.getDepartments().split(","))
                    .map(s -> s.trim()).map(s -> s.toUpperCase()).collect(Collectors.toList());
            boolean match = allowed.stream()
                    .anyMatch(d -> student.getBranch().toUpperCase().contains(d));
            if (!match) return false;
        }

        return true;
    }

    // ─── Scoring ─────────────────────────────────────────────────────────────────

    private ScoredCandidate scoreCandidate(User student, Job job) {
        PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(student);

        int readiness = intel.getOverallPlacementReadiness();
        int ats       = intel.getAtsScore();
        int jd        = intel.getJdMatch();
        int coding    = intel.getCodingScore();
        int interview = intel.getCodingScore(); // Note: when interview score available, use it

        // Job skill bonus: if student's skills overlap with required skills
        int skillBonus = computeSkillBonus(student, job);

        int rank = (int) (
                readiness * W_READINESS +
                ats       * W_ATS +
                jd        * W_JD +
                coding    * W_CODING +
                interview * W_INTERVIEW +
                skillBonus
        );

        // Company readiness for this specific company
        int companyReadiness = intel.getCompanyReadiness() != null
                ? intel.getCompanyReadiness().getOrDefault(job.getCompany(), readiness)
                : readiness;

        return new ScoredCandidate(student, intel, readiness, ats, jd, coding, interview,
                hiringProbability(readiness), companyReadiness, Math.min(100, rank));
    }

    private int computeSkillBonus(User student, Job job) {
        if (job.getRequiredSkills() == null || student.getSkills() == null) return 0;
        Set<String> required = Arrays.stream(job.getRequiredSkills().split(","))
                .map(s -> s.trim()).map(s -> s.toLowerCase()).collect(Collectors.toSet());
        Set<String> has = Arrays.stream(student.getSkills().split(","))
                .map(s -> s.trim()).map(s -> s.toLowerCase()).collect(Collectors.toSet());

        long matched = required.stream().filter(has::contains).count();
        if (required.isEmpty()) return 0;
        double ratio = (double) matched / required.size();
        return (int)(ratio * 10); // Up to 10 bonus points
    }

    private int hiringProbability(int readiness) {
        return Math.min(100, (int)(readiness * 0.90 + 8));
    }

    // ─── DTO builder ─────────────────────────────────────────────────────────────

    private ShortlistResultDto.ShortlistedCandidateDto buildCandidateDto(ScoredCandidate sc, Job job) {
        PlacementIntelligenceDto intel = sc.intel;

        String band = sc.readiness >= 90 ? "Platinum" :
                      sc.readiness >= 75 ? "Gold" :
                      sc.readiness >= 60 ? "Silver" : "Needs Improvement";

        // Risk level
        String riskLevel = sc.readiness >= 80 ? "LOW" :
                           sc.readiness >= 65 ? "MEDIUM" : "HIGH";

        List<String> riskFlags = new ArrayList<>();
        if (sc.coding < 60)       riskFlags.add("Low coding score");
        if (sc.ats < 60)          riskFlags.add("Low ATS score");
        if (sc.jd < 60)           riskFlags.add("Poor JD alignment");
        if (sc.readiness < 65)    riskFlags.add("Below readiness threshold");

        // Category tags (internal classification)
        List<String> tags = classifyCandidate(sc.student, intel, job);

        // Confidence = min(100, rank * 0.95)
        int confidence = (int) Math.min(100, sc.rankScore * 0.95);

        String whySelected = buildWhySelected(sc, job);
        String aiReason = intel.getHiringRecommendation() != null
                ? intel.getHiringRecommendation()
                : "Strong PlacementAI Readiness (" + sc.readiness + "%). " +
                  "ATS: " + sc.ats + "%, JD Match: " + sc.jd + "%, Coding: " + sc.coding + "%.";

        return ShortlistResultDto.ShortlistedCandidateDto.builder()
                .studentId(sc.student.getId())
                .studentName(sc.student.getFullName())
                .collegeName(sc.student.getCollegeName())
                .branch(sc.student.getBranch())
                .placementAiReadiness(sc.readiness)
                .atsMatch(sc.ats)
                .jdMatch(sc.jd)
                .interviewScore(sc.interview)
                .codingScore(sc.coding)
                .hiringProbability(sc.hiringProbability)
                .companyReadiness(sc.companyReadiness)
                .overallRankScore(sc.rankScore)
                .candidateBand(band)
                .aiReason(aiReason)
                .whySelected(whySelected)
                .whyRejected(sc.rankScore < 60 ? "Overall rank below shortlist threshold." : null)
                .riskLevel(riskLevel)
                .riskFlags(riskFlags)
                .expectedCtc(intel.getSalaryPrediction())
                .confidence(confidence)
                .categoryTags(tags)
                .build();
    }

    private String buildWhySelected(ScoredCandidate sc, Job job) {
        List<String> reasons = new ArrayList<>();
        if (sc.readiness >= 80) reasons.add("High PlacementAI Readiness (" + sc.readiness + "%)");
        if (sc.ats >= 75)       reasons.add("Strong ATS alignment (" + sc.ats + "%)");
        if (sc.jd >= 75)        reasons.add("Excellent JD match (" + sc.jd + "%)");
        if (sc.coding >= 75)    reasons.add("Solid coding performance (" + sc.coding + "%)");
        if (reasons.isEmpty())  reasons.add("Meets minimum eligibility criteria");
        return String.join(". ", reasons) + ".";
    }

    private List<String> classifyCandidate(User student, PlacementIntelligenceDto intel, Job job) {
        List<String> tags = new ArrayList<>();
        String skills = student.getSkills() != null ? student.getSkills().toLowerCase() : "";
        if (skills.contains("java") || skills.contains("spring"))   tags.add("Top Java");
        if (skills.contains("react") || skills.contains("angular")) tags.add("Top Frontend");
        if (skills.contains("python") || skills.contains("django")) tags.add("Top Python");
        if (skills.contains("aws") || skills.contains("cloud"))     tags.add("Top Cloud");
        if (skills.contains("ml") || skills.contains("ai"))         tags.add("Top AI/ML");
        if (intel.getOverallPlacementReadiness() >= 85)             tags.add("Top Overall");
        return tags;
    }

    // ─── Inner data class ────────────────────────────────────────────────────────

    private record ScoredCandidate(
            User student,
            PlacementIntelligenceDto intel,
            int readiness, int ats, int jd, int coding, int interview,
            int hiringProbability, int companyReadiness, int rankScore
    ) {}
}
