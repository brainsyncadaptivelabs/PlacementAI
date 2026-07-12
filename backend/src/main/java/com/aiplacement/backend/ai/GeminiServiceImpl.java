package com.aiplacement.backend.ai;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.ai.intelligence.*;
import com.aiplacement.backend.dto.AtsResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    private final AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AtsResponseDto analyzeResume(String resumeText) {
        return analyzeResume(resumeText, null);
    }

    @Override
    public AtsResponseDto analyzeResume(String resumeText, String jobDescription) {
        if (resumeText == null || resumeText.trim().split("\\s+").length < 25) {
            log.warn("Resume text is empty or too short. Returning Insufficient Information response.");
            return getFallbackAts(resumeText, true);
        }

        String prompt = "Analyze this resume text and extract only the semantic parameters as a JSON object matching the schema below. " +
                "Do not calculate scores or compatibility percentages yourself. Respond ONLY with valid JSON. " +
                "Do not include markdown wrappers like ```json or trailing text.\n" +
                "{\n" +
                "  \"industry\": \"Software Engineering\",\n" +
                "  \"careerDomain\": \"Backend\",\n" +
                "  \"primaryProfession\": \"Java Developer\",\n" +
                "  \"subDomain\": \"Cloud Services\",\n" +
                "  \"experienceLevel\": \"Senior\",\n" +
                "  \"industryConfidence\": 0.95,\n" +
                "  \"careerDomainConfidence\": 0.90,\n" +
                "  \"primaryProfessionConfidence\": 0.85,\n" +
                "  \"experienceLevelConfidence\": 0.95,\n" +
                "  \"skills\": [\"Java\", \"Spring Boot\", \"REST\", \"Docker\", \"SQL\"],\n" +
                "  \"projectsCount\": 3,\n" +
                "  \"hasMetrics\": true,\n" +
                "  \"hasLiveLink\": false,\n" +
                "  \"hasDegree\": true,\n" +
                "  \"hasTopCollege\": false,\n" +
                "  \"cgpa\": 8.5,\n" +
                "  \"hasEmail\": true,\n" +
                "  \"hasPhone\": true,\n" +
                "  \"hasLinkedin\": true,\n" +
                "  \"hasGithub\": true,\n" +
                "  \"hasPortfolio\": false,\n" +
                "  \"strengths\": [\"Strong Java/Spring background\", \"Experience with distributed messaging\"],\n" +
                "  \"weaknesses\": [\"No visible portfolio website\", \"Lacks cloud deployment details\"],\n" +
                "  \"suggestions\": [\"Add a link to your active GitHub profile\", \"Describe cloud deployment steps for projects\"],\n" +
                "  \"recruiterFeedback\": \"Good engineering profile with solid database fundamentals. Needs modern cloud exposure.\",\n" +
                "  \"detailedSuggestions\": [\n" +
                "    {\n" +
                "      \"text\": \"Add a link to your active GitHub profile\",\n" +
                "      \"impact\": \"High\",\n" +
                "      \"difficulty\": \"Easy\",\n" +
                "      \"estimatedImprovement\": \"+5%\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                (jobDescription != null && !jobDescription.trim().isEmpty() ? "\nTarget Job Description to analyze against:\n" + jobDescription : "") +
                "\nResume Text:\n" + resumeText;

        JsonNode aiJson = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                log.info("Sending resume to AI provider for detailed semantic analysis, attempt: {}", attempt);
                aiJson = aiClient.generateJson(
                        "You are PlacementAI, an expert ATS resume analyser. Respond ONLY with valid JSON.",
                        prompt, 0.2, 4096, e -> {
                            throw new RuntimeException("AI request failed", e);
                        });
                if (aiJson != null && aiJson.has("careerDomain")) {
                    break;
                }
            } catch (Exception e) {
                log.error("AI ATS request failed on attempt {}: {}", attempt, e.getMessage());
            }
        }

        if (aiJson == null) {
            return getFallbackAts(resumeText, false);
        }

        try {
            // 1. Parse AI extracted values with default confidence rules
            String industry = aiJson.has("industry") ? aiJson.get("industry").asText() : "General Professional";
            String careerDomain = aiJson.has("careerDomain") ? aiJson.get("careerDomain").asText() : "General Professional";
            String primaryProfession = aiJson.has("primaryProfession") ? aiJson.get("primaryProfession").asText() : "General Professional";
            String subDomain = aiJson.has("subDomain") ? aiJson.get("subDomain").asText() : "General Professional";
            String experienceLevel = aiJson.has("experienceLevel") ? aiJson.get("experienceLevel").asText() : "Fresher";

            double industryConfidence = aiJson.has("industryConfidence") ? aiJson.get("industryConfidence").asDouble() : 1.0;
            double careerDomainConfidence = aiJson.has("careerDomainConfidence") ? aiJson.get("careerDomainConfidence").asDouble() : 1.0;
            double primaryProfessionConfidence = aiJson.has("primaryProfessionConfidence") ? aiJson.get("primaryProfessionConfidence").asDouble() : 1.0;
            double experienceLevelConfidence = aiJson.has("experienceLevelConfidence") ? aiJson.get("experienceLevelConfidence").asDouble() : 1.0;

            // Confidence thresholds filter
            if (industryConfidence < 0.40) industry = "Insufficient confidence";
            if (careerDomainConfidence < 0.40) careerDomain = "Insufficient confidence";
            if (primaryProfessionConfidence < 0.40) primaryProfession = "Insufficient confidence";
            if (experienceLevelConfidence < 0.40) experienceLevel = "Insufficient confidence";

            List<String> extractedSkills = getList(aiJson, "skills");
            int projectsCount = aiJson.has("projectsCount") ? aiJson.get("projectsCount").asInt() : 0;
            boolean hasMetrics = aiJson.has("hasMetrics") && aiJson.get("hasMetrics").asBoolean();
            boolean hasLiveLink = aiJson.has("hasLiveLink") && aiJson.get("hasLiveLink").asBoolean();
            boolean hasDegree = aiJson.has("hasDegree") && aiJson.get("hasDegree").asBoolean();
            boolean hasTopCollege = aiJson.has("hasTopCollege") && aiJson.get("hasTopCollege").asBoolean();
            double cgpa = aiJson.has("cgpa") ? aiJson.get("cgpa").asDouble() : 0.0;
            
            boolean hasEmail = aiJson.has("hasEmail") && aiJson.get("hasEmail").asBoolean();
            boolean hasPhone = aiJson.has("hasPhone") && aiJson.get("hasPhone").asBoolean();
            boolean hasLinkedin = aiJson.has("hasLinkedin") && aiJson.get("hasLinkedin").asBoolean();
            boolean hasGithub = aiJson.has("hasGithub") && aiJson.get("hasGithub").asBoolean();
            boolean hasPortfolio = aiJson.has("hasPortfolio") && aiJson.get("hasPortfolio").asBoolean();

            List<String> strengths = getList(aiJson, "strengths");
            List<String> weaknesses = getList(aiJson, "weaknesses");
            List<String> suggestions = getList(aiJson, "suggestions");
            String recruiterFeedback = aiJson.has("recruiterFeedback") ? aiJson.get("recruiterFeedback").asText() : "Analysis completed.";
            List<AtsResponseDto.AtsSuggestionDto> detailedSuggestions = parseDetailedSuggestions(aiJson, "detailedSuggestions");

            // 2. Fetch Knowledge Base target profile for the detected domain
            AtsKnowledgeBase.DomainProfile profile = AtsKnowledgeBase.getProfile(careerDomain);
            List<String> expectedSkills = profile.getRequiredSkills();
            List<String> optionalSkills = profile.getOptionalSkills();

            // 3. Partition missing and matched skills based on Knowledge Base (or JD)
            List<String> matchedKeywords = new ArrayList<>();
            List<String> missingKeywords = new ArrayList<>();
            List<String> criticalSkills = new ArrayList<>();
            List<String> importantSkills = new ArrayList<>();
            List<String> niceToHaveSkills = new ArrayList<>();

            List<String> skillsToCheck = (jobDescription != null && !jobDescription.trim().isEmpty()) 
                    ? extractJdSkills(jobDescription) // Mode 2: compare against JD
                    : expectedSkills;

            // Compute missing & matched skills
            for (String reqSkill : skillsToCheck) {
                boolean hasSkill = extractedSkills.stream().anyMatch(es -> es.equalsIgnoreCase(reqSkill) || es.toLowerCase().contains(reqSkill.toLowerCase()));
                if (hasSkill) {
                    matchedKeywords.add(reqSkill);
                    criticalSkills.add(reqSkill);
                } else {
                    missingKeywords.add(reqSkill);
                    criticalSkills.add(reqSkill);
                }
            }

            // Populate other skill tiers
            if (jobDescription == null || jobDescription.trim().isEmpty()) {
                for (String optSkill : optionalSkills) {
                    boolean hasSkill = extractedSkills.stream().anyMatch(es -> es.equalsIgnoreCase(optSkill) || es.toLowerCase().contains(optSkill.toLowerCase()));
                    if (hasSkill) {
                        matchedKeywords.add(optSkill);
                        importantSkills.add(optSkill);
                    } else {
                        missingKeywords.add(optSkill);
                        niceToHaveSkills.add(optSkill);
                    }
                }
            }

            // Estimate candidate experience years from text
            int yearsOfExp = 0;
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)\\+?\\s*years?\\s+(?:of\\s+)?(?:experience|exp)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(resumeText);
            if (m.find()) {
                try {
                    yearsOfExp = Integer.parseInt(m.group(1));
                } catch (Exception ignored) {}
            }

            // 4. Run Deterministic Scoring Engine
            AtsScoringEngine.ScoreBreakdown scoring = AtsScoringEngine.calculate(
                    resumeText, matchedKeywords, missingKeywords, experienceLevel, yearsOfExp, projectsCount,
                    hasMetrics, hasLiveLink, hasDegree, hasTopCollege, cgpa, strengths.size() + detailedSuggestions.size(),
                    hasCompetitiveCoding(resumeText), !profile.getRecommendedCertifications().isEmpty(),
                    hasEmail, hasPhone, hasLinkedin, hasGithub, hasPortfolio
            );

            // 5. Run Deterministic Company Match Engine
            List<AtsResponseDto.CompanyMatchDto> companyMatches = AtsCompanyMatchEngine.match(
                    careerDomain, extractedSkills, yearsOfExp, scoring.getOverallScore()
            );

            // 6. Run Deterministic Salary Engine
            String location = extractLocation(resumeText);
            AtsSalaryEngine.SalaryResult salary = AtsSalaryEngine.estimate(
                    careerDomain, experienceLevel, yearsOfExp, extractedSkills, projectsCount, hasTopCollege,
                    hasCertifications(resumeText), location
            );

            // 7. Run Deterministic Placement Readiness Engine
            Map<String, Integer> readiness = AtsReadinessEngine.calculate(
                    careerDomain, scoring.getOverallScore(), extractedSkills, projectsCount, yearsOfExp,
                    hasDegree, hasTopCollege, hasMetrics, hasCompetitiveCoding(resumeText), hasCertifications(resumeText)
            );

            // 8. Run Recommendation Engine based on deficiencies
            List<AtsResponseDto.ImprovementDto> improvements = generateImprovements(
                    hasGithub, hasLinkedin, hasMetrics, hasLiveLink, hasDegree, hasTopCollege, 
                    profile.getRecommendedCertifications(), profile.getRecommendedProjects(), 
                    criticalSkills, missingKeywords, extractedSkills
            );

            // 9. Build and return the final DTO
            return AtsResponseDto.builder()
                    .atsScore(scoring.getOverallScore())
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .missingKeywords(missingKeywords)
                    .matchedKeywords(matchedKeywords)
                    .suggestions(suggestions)
                    .bestRole(primaryProfession)
                    .sectionScores(scoring.getCategories())
                    .recruiterFeedback(recruiterFeedback)
                    .recommendedRoles(Collections.singletonList(primaryProfession))
                    .minSalary(salary.getMinSalary())
                    .maxSalary(salary.getMaxSalary())
                    .salaryExplanation(salary.getSalaryExplanation())
                    .detailedSuggestions(detailedSuggestions)
                    .industry(industry)
                    .careerDomain(careerDomain)
                    .primaryProfession(primaryProfession)
                    .subDomain(subDomain)
                    .careerDomainConfidence(careerDomainConfidence)
                    .experienceLevelConfidence(experienceLevelConfidence)
                    .primaryProfessionConfidence(primaryProfessionConfidence)
                    .industryConfidence(industryConfidence)
                    .experienceLevel(experienceLevel)
                    .targetRole(jobDescription != null ? "Target Role Alignment" : primaryProfession)
                    .placementReadiness(readiness)
                    .criticalSkills(criticalSkills)
                    .importantSkills(importantSkills)
                    .niceToHaveSkills(niceToHaveSkills)
                    .companyMatches(companyMatches)
                    .improvements(improvements)
                    .isJobDescriptionComparison(jobDescription != null)
                    .jobDescriptionTitle(jobDescription != null ? "Selected Job Description" : null)
                    .build();

        } catch (Exception e) {
            log.error("Failed to map parsed ATS response JSON, calling fallback", e);
            return getFallbackAts(resumeText, false);
        }
    }

    private List<String> extractJdSkills(String jdText) {
        List<String> skills = new ArrayList<>();
        String[] keywords = {"Java", "Python", "React", "Angular", "Vue", "Docker", "Kubernetes", "AWS", "SQL", "Spring Boot", "DevOps", "SEO", "Google Ads", "Finance", "Accounting", "HR"};
        for (String kw : keywords) {
            if (java.util.regex.Pattern.compile("\\b" + java.util.regex.Pattern.quote(kw) + "\\b", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(jdText).find()) {
                skills.add(kw);
            }
        }
        if (skills.isEmpty()) {
            skills.add("Core Requirements");
        }
        return skills;
    }

    private String extractLocation(String text) {
        String[] locations = {"Bangalore", "Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "San Francisco", "New York", "London"};
        for (String loc : locations) {
            if (text.toLowerCase().contains(loc.toLowerCase())) {
                return loc;
            }
        }
        return "Remote / General";
    }

    private boolean hasCompetitiveCoding(String text) {
        return java.util.regex.Pattern.compile("leetcode|codeforces|hackerrank|codechef", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text).find();
    }

    private boolean hasCertifications(String text) {
        return java.util.regex.Pattern.compile("certif", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text).find();
    }

    private List<AtsResponseDto.ImprovementDto> generateImprovements(
            boolean hasGithub, boolean hasLinkedin, boolean hasMetrics, boolean hasLiveLink, boolean hasDegree,
            boolean hasTopCollege, List<String> recCerts, List<String> recProjects, List<String> criticalSkills,
            List<String> missingKeywords, List<String> extractedSkills
    ) {
        List<AtsResponseDto.ImprovementDto> improvements = new ArrayList<>();

        if (!hasGithub) {
            improvements.add(new AtsResponseDto.ImprovementDto("Add GitHub Portfolio Link", 8, "Recruiters check active code codebases to verify implementation experience."));
        }
        if (!hasLinkedin) {
            improvements.add(new AtsResponseDto.ImprovementDto("Include LinkedIn URL", 5, "Enables recruiters to double-verify professional network presence."));
        }
        if (!hasMetrics) {
            improvements.add(new AtsResponseDto.ImprovementDto("Quantify Project & Experience Results", 10, "Use STAR format (e.g., 'Optimized query speeds by 30% using Redis')."));
        }
        if (!hasLiveLink && !recProjects.isEmpty()) {
            improvements.add(new AtsResponseDto.ImprovementDto("Include Live Project Deployments", 6, "Add Vercel / Netlify / AWS URLs to show working builds."));
        }

        if (!recCerts.isEmpty()) {
            improvements.add(new AtsResponseDto.ImprovementDto("Earn " + recCerts.get(0), 7, "Highly recognized certification for your career track."));
        }

        if (!missingKeywords.isEmpty()) {
            improvements.add(new AtsResponseDto.ImprovementDto("Incorporate Skill: " + missingKeywords.get(0), 9, "This is expected for your career level."));
        }

        improvements.sort((a, b) -> b.getBoost().compareTo(a.getBoost()));
        return improvements.subList(0, Math.min(5, improvements.size()));
    }

    @SuppressWarnings("unchecked")
    private List<String> getList(JsonNode node, String field) {
        if (node.has(field) && node.get(field).isArray()) {
            return objectMapper.convertValue(node.get(field), List.class);
        }
        return List.of();
    }

    private List<AtsResponseDto.AtsSuggestionDto> parseDetailedSuggestions(JsonNode node, String field) {
        List<AtsResponseDto.AtsSuggestionDto> list = new ArrayList<>();
        if (node != null && node.has(field) && node.get(field).isArray()) {
            for (JsonNode item : node.get(field)) {
                list.add(AtsResponseDto.AtsSuggestionDto.builder()
                        .text(item.has("text") ? item.get("text").asText() : "")
                        .impact(item.has("impact") ? item.get("impact").asText() : "Medium")
                        .difficulty(item.has("difficulty") ? item.get("difficulty").asText() : "Medium")
                        .estimatedImprovement(item.has("estimatedImprovement") ? item.get("estimatedImprovement").asText() : "+3%")
                        .build());
            }
        }
        return list;
    }

    private AtsResponseDto getFallbackAts(String resumeText, boolean insufficientInfo) {
        String msg = insufficientInfo ? "Insufficient information" : "Analysis offline";
        return AtsResponseDto.builder()
                .atsScore(null)
                .strengths(List.of())
                .weaknesses(List.of())
                .missingKeywords(List.of())
                .matchedKeywords(List.of())
                .suggestions(List.of(msg))
                .bestRole(msg)
                .recruiterFeedback(msg)
                .minSalary("N/A")
                .maxSalary("N/A")
                .salaryExplanation(msg)
                .industry(msg)
                .careerDomain(msg)
                .primaryProfession(msg)
                .subDomain(msg)
                .experienceLevel(msg)
                .targetRole(msg)
                .placementReadiness(Map.of())
                .criticalSkills(List.of())
                .importantSkills(List.of())
                .niceToHaveSkills(List.of())
                .companyMatches(List.of())
                .improvements(List.of())
                .build();
    }
}
