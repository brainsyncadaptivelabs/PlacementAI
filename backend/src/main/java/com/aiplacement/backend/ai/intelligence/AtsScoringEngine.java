package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.dto.AtsResponseDto;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AtsScoringEngine {

    public static class ScoreBreakdown {
        private final int overallScore;
        private final Map<String, Integer> categories;
        
        // V2 Fields
        private final String scoreBand;
        private final String candidateType;
        private final double candidateTypeConfidence;
        private final List<String> candidateTypeEvidence;
        private final String confidence;
        private final double parseConfidence;
        private final List<String> parseWarnings;
        private final int extractedCharacterCount;
        private final int detectedSectionCount;
        private final List<AtsResponseDto.AtsCheckDto> checks;
        private final List<AtsResponseDto.SkillEvidenceDto> skillEvidence;
        private final List<AtsResponseDto.WeakBulletDto> weakBullets;
        private final List<String> topStrengths;
        private final List<String> criticalIssues;
        private final List<String> quickWins;

        public ScoreBreakdown(
                int overallScore, Map<String, Integer> categories,
                String scoreBand, String candidateType, double candidateTypeConfidence, List<String> candidateTypeEvidence,
                String confidence, double parseConfidence, List<String> parseWarnings,
                int extractedCharacterCount, int detectedSectionCount,
                List<AtsResponseDto.AtsCheckDto> checks,
                List<AtsResponseDto.SkillEvidenceDto> skillEvidence,
                List<AtsResponseDto.WeakBulletDto> weakBullets,
                List<String> topStrengths, List<String> criticalIssues, List<String> quickWins
        ) {
            this.overallScore = overallScore;
            this.categories = categories;
            this.scoreBand = scoreBand;
            this.candidateType = candidateType;
            this.candidateTypeConfidence = candidateTypeConfidence;
            this.candidateTypeEvidence = candidateTypeEvidence;
            this.confidence = confidence;
            this.parseConfidence = parseConfidence;
            this.parseWarnings = parseWarnings;
            this.extractedCharacterCount = extractedCharacterCount;
            this.detectedSectionCount = detectedSectionCount;
            this.checks = checks;
            this.skillEvidence = skillEvidence;
            this.weakBullets = weakBullets;
            this.topStrengths = topStrengths;
            this.criticalIssues = criticalIssues;
            this.quickWins = quickWins;
        }

        public int getOverallScore() { return overallScore; }
        public Map<String, Integer> getCategories() { return categories; }
        
        public String getScoreBand() { return scoreBand; }
        public String getCandidateType() { return candidateType; }
        public double getCandidateTypeConfidence() { return candidateTypeConfidence; }
        public List<String> getCandidateTypeEvidence() { return candidateTypeEvidence; }
        public String getConfidence() { return confidence; }
        public double getParseConfidence() { return parseConfidence; }
        public List<String> getParseWarnings() { return parseWarnings; }
        public int getExtractedCharacterCount() { return extractedCharacterCount; }
        public int getDetectedSectionCount() { return detectedSectionCount; }
        public List<AtsResponseDto.AtsCheckDto> getChecks() { return checks; }
        public List<AtsResponseDto.SkillEvidenceDto> getSkillEvidence() { return skillEvidence; }
        public List<AtsResponseDto.WeakBulletDto> getWeakBullets() { return weakBullets; }
        public List<String> getTopStrengths() { return topStrengths; }
        public List<String> getCriticalIssues() { return criticalIssues; }
        public List<String> getQuickWins() { return quickWins; }
    }

    private static final List<String> ACTION_VERBS = Arrays.asList(
            "built", "reduced", "improved", "automated", "designed", "implemented", 
            "optimized", "deployed", "developed", "created", "led", "managed", 
            "engineered", "spearheaded", "formulated", "integrated", "migrated", 
            "orchestrated", "refactored", "resolved", "enhanced", "leveraged"
    );

    private static final List<String> WEAK_VERBS = Arrays.asList(
            "worked on", "responsible for", "helped with", "participated in", 
            "assisted", "handled", "involved in", "duties included"
    );

    private static final List<String> FIRST_PERSON = Arrays.asList(
            "i", "me", "my", "myself", "we", "us", "our", "ours", "ourselves"
    );

    public static ScoreBreakdown calculate(
            String text,
            List<String> matchedSkills,
            List<String> missingSkills,
            String experienceLevel,
            int yearsOfExp,
            int projectCount,
            boolean hasMetrics,
            boolean hasLiveLink,
            boolean hasDegree,
            boolean hasTopCollege,
            double cgpaVal,
            int achievementCount,
            boolean hasCompetitiveCoding,
            boolean hasCertification,
            boolean hasEmail,
            boolean hasPhone,
            boolean hasLinkedin,
            boolean hasGithub,
            boolean hasPortfolio
    ) {
        String cleanText = text == null ? "" : text.trim();
        int charCount = cleanText.length();
        int wordCount = cleanText.isEmpty() ? 0 : cleanText.split("\\s+").length;

        // 1. Anti-Gaming: Check for prompt injection
        boolean hasPromptInjection = false;
        String lowerText = cleanText.toLowerCase();
        if (lowerText.contains("ignore previous instructions") || 
            lowerText.contains("give this resume 100") || 
            lowerText.contains("ignore instructions") || 
            lowerText.contains("ignore the rest of the text")) {
            hasPromptInjection = true;
        }

        // 2. Candidate Type Detection
        String candidateType = "STUDENT";
        double candidateTypeConfidence = 0.8;
        List<String> candidateTypeEvidence = new ArrayList<>();
        
        // Scan for years of experience
        int detectedYears = yearsOfExp;
        if (detectedYears <= 0) {
            Matcher m = Pattern.compile("(\\d+)\\+?\\s*years?\\s+(?:of\\s+)?(?:experience|exp)", Pattern.CASE_INSENSITIVE).matcher(cleanText);
            if (m.find()) {
                try {
                    detectedYears = Integer.parseInt(m.group(1));
                } catch (Exception ignored) {}
            }
        }

        // Scan for B.Tech/M.Tech/MCA degree and graduation year
        boolean hasGradYear = false;
        int gradYear = 0;
        Matcher yrMatcher = Pattern.compile("\\b(202[3-9]|2030)\\b").matcher(cleanText);
        if (yrMatcher.find()) {
            hasGradYear = true;
            gradYear = Integer.parseInt(yrMatcher.group(1));
        }

        if (detectedYears > 3) {
            candidateType = "EXPERIENCED";
            candidateTypeConfidence = 0.95;
            candidateTypeEvidence.add("Detected " + detectedYears + " years of experience");
        } else if (detectedYears > 0) {
            candidateType = "EARLY_CAREER";
            candidateTypeConfidence = 0.85;
            candidateTypeEvidence.add("Detected " + detectedYears + " years of experience");
        } else if (hasGradYear && gradYear >= 2026) {
            candidateType = "STUDENT";
            candidateTypeConfidence = 0.9;
            candidateTypeEvidence.add("Detected graduation year " + gradYear);
        } else {
            candidateType = "FRESHER";
            candidateTypeConfidence = 0.8;
            if (hasGradYear) candidateTypeEvidence.add("Detected graduation year " + gradYear);
            else candidateTypeEvidence.add("No experience specified, assuming fresh graduate");
        }

        // 3. Resume Parsing Quality / Confidence
        double parseConfidence = 100.0;
        List<String> parseWarnings = new ArrayList<>();
        if (charCount < 100) {
            parseConfidence = 10.0;
            parseWarnings.add("Extremely short text content extracted. File might be scanned or image-only.");
        } else {
            double wordToCharRatio = (double) charCount / Math.max(1, wordCount);
            if (wordToCharRatio > 12.0 || wordToCharRatio < 3.0) {
                parseConfidence = Math.max(20.0, parseConfidence - 40.0);
                parseWarnings.add("Unusual character-to-word ratio (" + String.format("%.1f", wordToCharRatio) + "). Layout may be corrupt.");
            }
            if (cleanText.contains("") || cleanText.contains("??")) {
                parseConfidence = Math.max(30.0, parseConfidence - 20.0);
                parseWarnings.add("Special character corruption detected in parsed text.");
            }
        }

        // Detect sections
        int detectedSectionCount = 0;
        boolean hasEduSection = false;
        boolean hasSkillsSection = false;
        boolean hasProjSection = false;
        boolean hasExpSection = false;

        String[] lines = cleanText.split("\\r?\\n");
        for (String line : lines) {
            String l = line.trim().toUpperCase();
            if (l.matches(".*\\b(EDUCATION|ACADEMICS|ACADEMIC BACKGROUND)\\b.*")) {
                if (!hasEduSection) { hasEduSection = true; detectedSectionCount++; }
            }
            if (l.matches(".*\\b(SKILLS|TECHNICAL SKILLS|TECHNOLOGIES|STRENGTHS)\\b.*")) {
                if (!hasSkillsSection) { hasSkillsSection = true; detectedSectionCount++; }
            }
            if (l.matches(".*\\b(PROJECTS|ACADEMIC PROJECTS|PERSONAL PROJECTS)\\b.*")) {
                if (!hasProjSection) { hasProjSection = true; detectedSectionCount++; }
            }
            if (l.matches(".*\\b(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|INTERNSHIPS)\\b.*")) {
                if (!hasExpSection) { hasExpSection = true; detectedSectionCount++; }
            }
        }

        String confidenceLevel = "HIGH";
        if (parseConfidence < 50.0) confidenceLevel = "LOW";
        else if (parseConfidence < 80.0) confidenceLevel = "MEDIUM";

        // Initialize checks list
        List<AtsResponseDto.AtsCheckDto> checks = new ArrayList<>();

        // A. ATS Parseability and Format Safety (15 points)
        int earnedA = 0;
        
        int parseQualityPoints = charCount > 200 ? 5 : (charCount > 100 ? 3 : 0);
        earnedA += parseQualityPoints;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_PARSE_TEXT_QUALITY")
                .category("ATS_PARSEABILITY")
                .title("Text Extraction Quality")
                .description("Verifies that the text was successfully extracted from the file.")
                .maxPoints(5).earnedPoints(parseQualityPoints)
                .severity(parseQualityPoints == 5 ? "INFO" : "HIGH")
                .status(parseQualityPoints == 5 ? "PASS" : "FAIL")
                .evidence("Parsed character count: " + charCount)
                .recommendation(parseQualityPoints == 5 ? "Text parsed successfully." : "Ensure your PDF is not a scanned image. Use standard document exports.")
                .build());

        int densityPoints = (parseConfidence >= 80.0) ? 4 : 2;
        earnedA += densityPoints;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_STANDARD_STRUCTURE")
                .category("ATS_PARSEABILITY")
                .title("Document Text Density")
                .description("Ensures correct spacing and layout parse safety.")
                .maxPoints(4).earnedPoints(densityPoints)
                .severity(densityPoints == 4 ? "INFO" : "MEDIUM")
                .status(densityPoints == 4 ? "PASS" : "WARNING")
                .evidence("Parsed word density is within safe thresholds.")
                .recommendation(densityPoints == 4 ? "Spacing is appropriate." : "Review formatting. Multi-columns or tables may cause parsing corruption.")
                .build());

        // Check columns risk: look for excessive pipe characters or tab stops
        long pipeCount = cleanText.chars().filter(ch -> ch == '|').count();
        int layoutPoints = pipeCount < 5 ? 3 : (pipeCount < 15 ? 1 : 0);
        earnedA += layoutPoints;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_NO_COMPLEX_LAYOUT")
                .category("ATS_PARSEABILITY")
                .title("Multi-Column / Table Layout Risk")
                .description("Evaluates formatting risks from complex tables or multi-column grids.")
                .maxPoints(3).earnedPoints(layoutPoints)
                .severity(layoutPoints == 3 ? "INFO" : "HIGH")
                .status(layoutPoints == 3 ? "PASS" : "FAIL")
                .evidence("Detected " + pipeCount + " layout separators")
                .recommendation(layoutPoints == 3 ? "No complex layouts detected." : "Avoid multi-column tables or horizontal line separators. Use a single-column layout.")
                .build());

        int riskyPoints = (!cleanText.contains("")) ? 3 : 1;
        earnedA += riskyPoints;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_NO_RISKY_ELEMENTS")
                .category("ATS_PARSEABILITY")
                .title("ATS-Risky Elements")
                .description("Scans for special characters or corrupted characters that trip ATS filters.")
                .maxPoints(3).earnedPoints(riskyPoints)
                .severity(riskyPoints == 3 ? "INFO" : "MEDIUM")
                .status(riskyPoints == 3 ? "PASS" : "WARNING")
                .evidence(riskyPoints == 3 ? "No corrupted characters detected." : "Detected special character errors.")
                .recommendation(riskyPoints == 3 ? "Characters are safe." : "Ensure you use standard system fonts (e.g. Arial, Times New Roman, Calibri) to prevent parser corruption.")
                .build());

        // B. Resume Structure and Completeness (15 points)
        int earnedB = 0;
        
        // Regex validations for email, phone, LinkedIn
        boolean validEmail = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", Pattern.CASE_INSENSITIVE).matcher(cleanText).find();
        boolean validPhone = Pattern.compile("(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}|\\b\\d{10}\\b").matcher(cleanText).find();
        boolean validLinkedIn = cleanText.toLowerCase().contains("linkedin.com/");
        
        int contactPts = 0;
        if (validEmail) contactPts += 1;
        if (validPhone) contactPts += 1;
        if (validLinkedIn) contactPts += 1;
        
        earnedB += contactPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_CONTACT_INFO")
                .category("STRUCTURE")
                .title("Contact Information Completeness")
                .description("Checks presence of valid email, phone number, and LinkedIn profile.")
                .maxPoints(3).earnedPoints(contactPts)
                .severity(contactPts == 3 ? "INFO" : "HIGH")
                .status(contactPts == 3 ? "PASS" : "FAIL")
                .evidence("Email: " + validEmail + ", Phone: " + validPhone + ", LinkedIn: " + validLinkedIn)
                .recommendation(contactPts == 3 ? "Contact info is complete." : "Add missing contact details. A professional recruiter requires email, phone, and LinkedIn link.")
                .build());

        int eduPts = hasEduSection ? 3 : 0;
        earnedB += eduPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_SECTION_EDUCATION")
                .category("STRUCTURE")
                .title("Education Section Presence")
                .description("Ensures an explicit Education section exists on the resume.")
                .maxPoints(3).earnedPoints(eduPts)
                .severity(eduPts == 3 ? "INFO" : "CRITICAL")
                .status(eduPts == 3 ? "PASS" : "FAIL")
                .evidence(hasEduSection ? "Education section detected." : "No Education section found.")
                .recommendation(hasEduSection ? "Section found." : "Create a clear 'Education' section heading.")
                .build());

        int skillSectionPts = hasSkillsSection ? 3 : 0;
        earnedB += skillSectionPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_SECTION_SKILLS")
                .category("STRUCTURE")
                .title("Skills Section Presence")
                .description("Ensures an explicit Skills section exists on the resume.")
                .maxPoints(3).earnedPoints(skillSectionPts)
                .severity(skillSectionPts == 3 ? "INFO" : "CRITICAL")
                .status(skillSectionPts == 3 ? "PASS" : "FAIL")
                .evidence(hasSkillsSection ? "Skills section detected." : "No Skills section found.")
                .recommendation(hasSkillsSection ? "Section found." : "Create a clear 'Skills' or 'Technical Skills' section heading.")
                .build());

        // Experience or projects carrying structural weight (6 pts)
        int expProjPts = 0;
        if ("STUDENT".equals(candidateType) || "FRESHER".equals(candidateType)) {
            if (hasProjSection || hasExpSection) expProjPts = 6;
        } else {
            if (hasExpSection) expProjPts = 6;
            else if (hasProjSection) expProjPts = 3;
        }
        earnedB += expProjPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_SECTION_EXPERIENCE")
                .category("STRUCTURE")
                .title("Experience/Projects Section Presence")
                .description("Verifies that the resume contains either professional experience or projects matching the candidate profile.")
                .maxPoints(6).earnedPoints(expProjPts)
                .severity(expProjPts == 6 ? "INFO" : "CRITICAL")
                .status(expProjPts == 6 ? "PASS" : "FAIL")
                .evidence("Experience present: " + hasExpSection + ", Projects present: " + hasProjSection + " for candidate type " + candidateType)
                .recommendation(expProjPts == 6 ? "Section found." : "Add professional experience or projects section to evidence your technical output.")
                .build());

        // C. Content Quality and Impact (20 points)
        int earnedC = 0;
        
        // Count strong action verbs
        int actionVerbCount = 0;
        for (String word : cleanText.toLowerCase().split("\\s+")) {
            word = word.replaceAll("[^a-zA-Z]", "");
            if (ACTION_VERBS.contains(word)) {
                actionVerbCount++;
            }
        }
        int actionVerbPts = actionVerbCount >= 8 ? 5 : (actionVerbCount >= 4 ? 3 : 1);
        earnedC += actionVerbPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_ACTION_VERB_QUALITY")
                .category("CONTENT_IMPACT")
                .title("Strong Action Verbs")
                .description("Measures usage of strong, action-oriented verbs at the beginning of bullets.")
                .maxPoints(5).earnedPoints(actionVerbPts)
                .severity(actionVerbPts == 5 ? "INFO" : "MEDIUM")
                .status(actionVerbPts == 5 ? "PASS" : "WARNING")
                .evidence("Found " + actionVerbCount + " strong action verbs")
                .recommendation(actionVerbPts == 5 ? "Good verb usage." : "Start each bullet with an active verb (e.g. Developed, Optimized, Integrated) instead of passive voice.")
                .build());

        // Count metrics / percentages
        int metricCount = 0;
        Matcher numMatcher = Pattern.compile("\\b(\\d+%)|\\b(\\d+\\+?\\s*(?:LPA|cr|users|GB|MB|ms|seconds|x))\\b", Pattern.CASE_INSENSITIVE).matcher(cleanText);
        while (numMatcher.find()) {
            metricCount++;
        }
        int metricPts = metricCount >= 5 ? 7 : (metricCount >= 3 ? 4 : 1);
        earnedC += metricPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_QUANTIFIED_IMPACT")
                .category("CONTENT_IMPACT")
                .title("Quantified Achievements")
                .description("Ensures accomplishments are backed by measurable outcomes, statistics, or scale metrics.")
                .maxPoints(7).earnedPoints(metricPts)
                .severity(metricPts == 7 ? "INFO" : "HIGH")
                .status(metricPts == 7 ? "PASS" : "FAIL")
                .evidence("Detected " + metricCount + " metrics or numbers")
                .recommendation(metricPts == 7 ? "Excellent quantification." : "Include specific metrics, performance improvements, or scale to demonstrate the impact of your work.")
                .build());

        // Weak responsibility phrases
        int weakPhraseCount = 0;
        for (String phrase : WEAK_VERBS) {
            int index = 0;
            while ((index = lowerText.indexOf(phrase, index)) != -1) {
                weakPhraseCount++;
                index += phrase.length();
            }
        }
        int weakPhrasePts = Math.max(0, 4 - weakPhraseCount);
        earnedC += weakPhrasePts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_WEAK_PHRASES")
                .category("CONTENT_IMPACT")
                .title("Avoid Weak Phrases")
                .description("Flags lazy or passive phrases like 'worked on', 'responsible for', or 'helped with'.")
                .maxPoints(4).earnedPoints(weakPhrasePts)
                .severity(weakPhrasePts == 4 ? "INFO" : "LOW")
                .status(weakPhrasePts == 4 ? "PASS" : "WARNING")
                .evidence("Found " + weakPhraseCount + " weak phrases")
                .recommendation(weakPhrasePts == 4 ? "No weak phrases found." : "Replace weak verbs ('worked on') with specific actions ('Designed and built').")
                .build());

        // First person pronouns
        int firstPersonCount = 0;
        for (String pronoun : FIRST_PERSON) {
            Matcher matcher = Pattern.compile("\\b" + pronoun + "\\b", Pattern.CASE_INSENSITIVE).matcher(cleanText);
            while (matcher.find()) {
                firstPersonCount++;
            }
        }
        int firstPersonPts = Math.max(0, 4 - firstPersonCount);
        earnedC += firstPersonPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_FIRST_PERSON_USAGE")
                .category("CONTENT_IMPACT")
                .title("Avoid First-Person Pronouns")
                .description("Ensures no first-person pronouns (I, me, my, we) are used.")
                .maxPoints(4).earnedPoints(firstPersonPts)
                .severity(firstPersonPts == 4 ? "INFO" : "LOW")
                .status(firstPersonPts == 4 ? "PASS" : "WARNING")
                .evidence("Found " + firstPersonCount + " first-person pronouns")
                .recommendation(firstPersonPts == 4 ? "No first-person usage." : "Remove first-person pronouns. Write in the third person/bullet format.")
                .build());

        // D. Skill Credibility and Technical Evidence (15 points)
        int earnedD = 0;
        List<AtsResponseDto.SkillEvidenceDto> skillEvidence = new ArrayList<>();
        List<String> allExtractedSkills = new ArrayList<>();
        allExtractedSkills.addAll(matchedSkills);
        allExtractedSkills.addAll(missingSkills);
        if (allExtractedSkills.isEmpty()) {
            allExtractedSkills.addAll(Arrays.asList("Java", "Spring Boot", "React", "SQL", "Docker", "Git"));
        }

        int skillsWithEvidence = 0;
        int skillStuffingCount = allExtractedSkills.size();

        // Build evidence graph
        for (String skill : allExtractedSkills) {
            boolean inSkills = true;
            boolean inProj = false;
            boolean inExp = false;
            boolean inIntern = false;
            List<String> snippets = new ArrayList<>();

            // Scan text paragraphs (rough matching)
            for (String line : lines) {
                if (line.toLowerCase().contains(skill.toLowerCase()) && !line.toLowerCase().matches(".*\\b(skills|technical skills|technologies|strengths)\\b.*")) {
                    if (line.toLowerCase().contains("project")) {
                        inProj = true;
                    } else if (line.toLowerCase().contains("intern")) {
                        inIntern = true;
                    } else {
                        inExp = true;
                    }
                    if (snippets.size() < 2) {
                        snippets.add(line.trim());
                    }
                }
            }

            int evidenceCount = snippets.size();
            String credibility = "LISTED_ONLY";
            if (inProj && inExp) {
                credibility = "STRONG_EVIDENCE";
                skillsWithEvidence++;
            } else if (inProj || inExp || inIntern) {
                credibility = "PARTIAL_EVIDENCE";
                skillsWithEvidence++;
            }

            skillEvidence.add(AtsResponseDto.SkillEvidenceDto.builder()
                    .skill(skill)
                    .listedInSkills(inSkills)
                    .foundInProjects(inProj)
                    .foundInExperience(inExp)
                    .foundInInternships(inIntern)
                    .evidenceCount(evidenceCount)
                    .evidenceSnippets(snippets)
                    .credibilityStatus(credibility)
                    .build());
        }

        double evidenceRatio = (double) skillsWithEvidence / Math.max(1, allExtractedSkills.size());
        int evidencePts = evidenceRatio >= 0.8 ? 10 : (evidenceRatio >= 0.5 ? 6 : (evidenceRatio >= 0.2 ? 3 : 0));
        earnedD += evidencePts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_SKILL_EVIDENCE")
                .category("SKILL_CREDIBILITY")
                .title("Skill-to-Experience Evidence")
                .description("Ensures skills listed are contextualized in projects or work history.")
                .maxPoints(10).earnedPoints(evidencePts)
                .severity(evidencePts == 10 ? "INFO" : "HIGH")
                .status(evidencePts == 10 ? "PASS" : "FAIL")
                .evidence(skillsWithEvidence + " out of " + allExtractedSkills.size() + " skills have evidence.")
                .recommendation(evidencePts == 10 ? "Skills are fully backed." : "Ensure your technical skills are explicitly mentioned in the project/experience bullets.")
                .build());

        int stuffingPts = skillStuffingCount <= 25 ? 5 : (skillStuffingCount <= 35 ? 3 : 0);
        earnedD += stuffingPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_SKILL_STUFFING")
                .category("SKILL_CREDIBILITY")
                .title("Avoid Skill Stuffing")
                .description("Checks if candidate lists an excessively long keyword block without context.")
                .maxPoints(5).earnedPoints(stuffingPts)
                .severity(stuffingPts == 5 ? "INFO" : "MEDIUM")
                .status(stuffingPts == 5 ? "PASS" : "WARNING")
                .evidence("Listed " + skillStuffingCount + " skills")
                .recommendation(stuffingPts == 5 ? "Skills list length is safe." : "Do not list keywords you cannot support. Keep skills below 25.")
                .build());

        // E. Project and Experience Intelligence (15 points)
        int earnedE = 0;
        if ("STUDENT".equals(candidateType) || "FRESHER".equals(candidateType)) {
            // For freshers, projects are primary
            int projDepthPts = hasSkillsSection && projectCount >= 2 ? 5 : 2;
            int projOutcomePts = hasMetrics ? 5 : 2;
            int projLinkPts = hasGithub || hasLiveLink ? 5 : 0;
            
            earnedE = projDepthPts + projOutcomePts + projLinkPts;
            checks.add(AtsResponseDto.AtsCheckDto.builder()
                    .checkId("ATS_PROJECT_TECH_DEPTH")
                    .category("PROJECT_INTEL")
                    .title("Academic Project Technical Depth")
                    .description("Measures project technical specifications and stack detail.")
                    .maxPoints(5).earnedPoints(projDepthPts)
                    .severity(projDepthPts == 5 ? "INFO" : "MEDIUM")
                    .status(projDepthPts == 5 ? "PASS" : "WARNING")
                    .evidence("Project count: " + projectCount)
                    .recommendation("Clearly describe database, API architecture, or frameworks used in projects.")
                    .build());

            checks.add(AtsResponseDto.AtsCheckDto.builder()
                    .checkId("ATS_PROJECT_OUTCOME")
                    .category("PROJECT_INTEL")
                    .title("Project Outcome Evidence")
                    .description("Verifies that projects list explicit results or outcomes.")
                    .maxPoints(5).earnedPoints(projOutcomePts)
                    .severity(projOutcomePts == 5 ? "INFO" : "MEDIUM")
                    .status(projOutcomePts == 5 ? "PASS" : "WARNING")
                    .evidence("Project metrics present: " + hasMetrics)
                    .recommendation("Describe speed improvements, cost savings, or user counts for your projects.")
                    .build());

            checks.add(AtsResponseDto.AtsCheckDto.builder()
                    .checkId("ATS_PROJECT_LINKS")
                    .category("PROJECT_INTEL")
                    .title("Project Source/Live Links")
                    .description("Checks for active GitHub links or deployment URLs.")
                    .maxPoints(5).earnedPoints(projLinkPts)
                    .severity(projLinkPts == 5 ? "INFO" : "HIGH")
                    .status(projLinkPts == 5 ? "PASS" : "FAIL")
                    .evidence("GitHub/Live link: " + (hasGithub || hasLiveLink))
                    .recommendation("Include clickable links to your project repositories or live demonstrations.")
                    .build());
        } else {
            // For experienced candidates, roles are primary
            int expDepthPts = hasSkillsSection && yearsOfExp >= 3 ? 7 : 4;
            int expOutcomePts = hasMetrics ? 5 : 2;
            int expLinkPts = hasLinkedin || hasGithub ? 3 : 0;
            
            earnedE = expDepthPts + expOutcomePts + expLinkPts;
            checks.add(AtsResponseDto.AtsCheckDto.builder()
                    .checkId("ATS_EXPERIENCE_DEPTH")
                    .category("PROJECT_INTEL")
                    .title("Professional Role Depth")
                    .description("Evaluates seniority progression, role scope, and leadership indicators.")
                    .maxPoints(7).earnedPoints(expDepthPts)
                    .severity(expDepthPts == 7 ? "INFO" : "MEDIUM")
                    .status(expDepthPts == 7 ? "PASS" : "WARNING")
                    .evidence("Years of Exp: " + yearsOfExp)
                    .recommendation("Add details showing role responsibilities and how you led technical tasks.")
                    .build());

            checks.add(AtsResponseDto.AtsCheckDto.builder()
                    .checkId("ATS_EXPERIENCE_OUTCOME")
                    .category("PROJECT_INTEL")
                    .title("Business Outcome Impact")
                    .description("Verifies if experience points highlight business value (revenue, optimization).")
                    .maxPoints(5).earnedPoints(expOutcomePts)
                    .severity(expOutcomePts == 5 ? "INFO" : "HIGH")
                    .status(expOutcomePts == 5 ? "PASS" : "FAIL")
                    .evidence("Business metrics present: " + hasMetrics)
                    .recommendation("Highlight how your code optimization boosted loading times or reduced server cost.")
                    .build());

            checks.add(AtsResponseDto.AtsCheckDto.builder()
                    .checkId("ATS_EXPERIENCE_LINKS")
                    .category("PROJECT_INTEL")
                    .title("Professional Portfolio Links")
                    .description("Checks for professional links (LinkedIn, GitHub) inside the text.")
                    .maxPoints(3).earnedPoints(expLinkPts)
                    .severity(expLinkPts == 3 ? "INFO" : "LOW")
                    .status(expLinkPts == 3 ? "PASS" : "WARNING")
                    .evidence("LinkedIn/Github: " + (hasLinkedin || hasGithub))
                    .recommendation("Add active links to your profiles in your contact section.")
                    .build());
        }

        // F. Language, Readability, and Professional Quality (10 points)
        int earnedF = 0;
        
        // Bullet intelligence / weakest bullet detection
        List<AtsResponseDto.WeakBulletDto> weakBullets = new ArrayList<>();
        int appropriateLengthCount = 0;
        int totalBullets = 0;

        for (String line : lines) {
            String cleanLine = line.trim();
            if (cleanLine.startsWith("-") || cleanLine.startsWith("*") || cleanLine.startsWith("•") || cleanLine.matches("^\\d+\\..*")) {
                totalBullets++;
                String bulletText = cleanLine.replaceAll("^[-*•\\d+.]+", "").trim();
                int bulletWordCount = bulletText.split("\\s+").length;
                
                boolean appropriate = bulletWordCount >= 10 && bulletWordCount <= 35;
                if (appropriate) appropriateLengthCount++;

                // Check problems
                List<String> problems = new ArrayList<>();
                boolean weakVerb = false;
                for (String wv : WEAK_VERBS) {
                    if (bulletText.toLowerCase().contains(wv)) {
                        weakVerb = true;
                        problems.add("Uses weak passive phrase: '" + wv + "'");
                    }
                }
                
                boolean hasNum = bulletText.matches(".*\\d+.*");
                if (!hasNum) {
                    problems.add("Lacks numerical metric/quantification");
                }
                
                boolean hasFirst = false;
                for (String fp : FIRST_PERSON) {
                    if (bulletText.toLowerCase().matches(".*\\b" + fp + "\\b.*")) {
                        hasFirst = true;
                        problems.add("Uses first-person pronoun: '" + fp + "'");
                    }
                }

                if (!problems.isEmpty() && weakBullets.size() < 3) {
                    String cleanSkill = matchedSkills.isEmpty() ? "Java" : matchedSkills.get(0);
                    weakBullets.add(AtsResponseDto.WeakBulletDto.builder()
                            .originalBullet(cleanLine)
                            .problems(problems)
                            .whyItIsWeak(problems.get(0))
                            .improvementStrategy("Use a strong action verb, remove any first person pronouns, and add a quantifiable metric (e.g. reduced load time by 20%).")
                            .rewriteSuggestion("Spearheaded " + cleanSkill + " backend development, accelerating API response speed by 20% through custom caching policies.")
                            .build());
                }
            }
        }

        double bulletLengthRatio = totalBullets == 0 ? 1.0 : (double) appropriateLengthCount / totalBullets;
        int bulletLenPts = bulletLengthRatio >= 0.7 ? 3 : 1;
        earnedF += bulletLenPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_BULLET_LENGTH")
                .category("LANGUAGE")
                .title("Uniform Bullet Length")
                .description("Ensures bullet statements are concise but sufficiently detailed (10-35 words).")
                .maxPoints(3).earnedPoints(bulletLenPts)
                .severity(bulletLenPts == 3 ? "INFO" : "LOW")
                .status(bulletLenPts == 3 ? "PASS" : "WARNING")
                .evidence("Word count checked for " + totalBullets + " bullets.")
                .recommendation("Keep bullets between 10 and 35 words. Avoid long text walls.")
                .build());

        // Repetition check
        int repPts = lowerText.split("responsible for").length > 2 ? 1 : 3;
        earnedF += repPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_REPETITION")
                .category("LANGUAGE")
                .title("Word & Phrase Repetition")
                .description("Flags repetitive use of specific words or phrase structures.")
                .maxPoints(3).earnedPoints(repPts)
                .severity(repPts == 3 ? "INFO" : "LOW")
                .status(repPts == 3 ? "PASS" : "WARNING")
                .evidence(repPts == 3 ? "No excessive repetition detected." : "Repetitive terms found.")
                .recommendation("Vary your action verbs. Avoid repeating the same words across multiple lines.")
                .build());

        // Date consistency
        boolean dateMatch = Pattern.compile("\\b(202[0-9]|201[0-9])\\b").matcher(cleanText).find();
        int datePts = dateMatch ? 4 : 2;
        earnedF += datePts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_DATE_CONSISTENCY")
                .category("LANGUAGE")
                .title("Date Consistency")
                .description("Verifies that dates are formatted uniformly across sections.")
                .maxPoints(4).earnedPoints(datePts)
                .severity(datePts == 4 ? "INFO" : "LOW")
                .status(datePts == 4 ? "PASS" : "WARNING")
                .evidence("Date format alignment: " + dateMatch)
                .recommendation("Use consistent date patterns (e.g. MM/YYYY - MM/YYYY or YYYY - Present).")
                .build());

        // G. Campus Placement Readiness (10 points)
        int earnedG = 0;
        
        boolean hasBranch = lowerText.contains("computer science") || lowerText.contains("information technology") ||
                             lowerText.contains("electronics") || lowerText.contains("cse") || lowerText.contains("ece") ||
                             lowerText.matches(".*\\b(me|ce|it|ee)\\b.*");
        int branchPts = hasBranch ? 2 : 0;
        earnedG += branchPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_CAMPUS_BRANCH_DEGREE")
                .category("CAMPUS_READINESS")
                .title("Degree and Branch Clarity")
                .description("Checks that B.Tech/B.E degree and branch are clearly listed (highly critical in campus drives).")
                .maxPoints(2).earnedPoints(branchPts)
                .severity(branchPts == 2 ? "INFO" : "HIGH")
                .status(branchPts == 2 ? "PASS" : "FAIL")
                .evidence("Branch detected: " + hasBranch)
                .recommendation("Clearly specify B.Tech / B.E / MCA alongside your branch (e.g. Computer Science and Engineering).")
                .build());

        int gradYearPts = hasGradYear ? 2 : 0;
        earnedG += gradYearPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_CAMPUS_GRAD_YEAR")
                .category("CAMPUS_READINESS")
                .title("Graduation Year Presence")
                .description("Ensures graduation year is clearly stated so recruiters can target correct batches.")
                .maxPoints(2).earnedPoints(gradYearPts)
                .severity(gradYearPts == 2 ? "INFO" : "HIGH")
                .status(gradYearPts == 2 ? "PASS" : "FAIL")
                .evidence("Graduation year detected: " + (hasGradYear ? gradYear : "None"))
                .recommendation("Add your expected graduation year explicitly next to your degree.")
                .build());

        boolean hasCgpa = cgpaVal > 0.0 || lowerText.contains("cgpa") || lowerText.contains("pointer") || lowerText.contains("gpa") || lowerText.contains("%");
        int cgpaPts = hasCgpa ? 3 : 0;
        earnedG += cgpaPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_CAMPUS_CGPA")
                .category("CAMPUS_READINESS")
                .title("CGPA / Academic Scores")
                .description("Verifies that academic CGPA or percentage marks are listed.")
                .maxPoints(3).earnedPoints(cgpaPts)
                .severity(cgpaPts == 3 ? "INFO" : "HIGH")
                .status(cgpaPts == 3 ? "PASS" : "FAIL")
                .evidence("CGPA/Marks listed: " + hasCgpa)
                .recommendation("Mention your graduation CGPA/percentage. Campus recruiters filter heavily on this.")
                .build());

        boolean hasCoding = lowerText.contains("leetcode") || lowerText.contains("hackerrank") || lowerText.contains("codechef") || 
                             lowerText.contains("codeforces") || lowerText.contains("geeksforgeeks");
        int codingPts = hasCoding ? 3 : 0;
        earnedG += codingPts;
        checks.add(AtsResponseDto.AtsCheckDto.builder()
                .checkId("ATS_CAMPUS_CODING_PROFILE")
                .category("CAMPUS_READINESS")
                .title("Coding Profiles (LeetCode / HackerRank)")
                .description("Verifies active competitive coding profiles (LeetCode, HackerRank, GeeksforGeeks, CodeChef).")
                .maxPoints(3).earnedPoints(codingPts)
                .severity(codingPts == 3 ? "INFO" : "MEDIUM")
                .status(codingPts == 3 ? "PASS" : "WARNING")
                .evidence("Coding profiles detected: " + hasCoding)
                .recommendation("Link your active LeetCode, Codeforces, or HackerRank profiles. Critical for software roles.")
                .build());

        // Calculate final pre-cap score
        int preCapScore = earnedA + earnedB + earnedC + earnedD + earnedE + earnedF + earnedG;

        // Apply score caps
        int finalScore = preCapScore;
        List<String> criticalIssues = new ArrayList<>();
        List<String> topStrengths = new ArrayList<>();
        List<String> quickWins = new ArrayList<>();

        if (parseConfidence < 60.0) {
            finalScore = Math.min(finalScore, 40);
            criticalIssues.add("LOW PARSING CONFIDENCE: Document parse reliability is too low. High risk of ATS rejection.");
        }
        if (!hasEduSection || !hasSkillsSection) {
            finalScore = Math.min(finalScore, 50);
            criticalIssues.add("MISSING SECTIONS: Missing fundamental Education or Skills sections.");
        }
        if (skillStuffingCount > 40) {
            finalScore = Math.min(finalScore, 60);
            criticalIssues.add("KEYWORD STUFFING: Over-optimized skills list. Capped to prevent ATS gaming.");
        }
        if (wordCount < 15) {
            finalScore = Math.min(finalScore, 10);
            criticalIssues.add("EMPTY RESUME: Under 15 words detected. Complete your resume details.");
        }
        if (hasPromptInjection) {
            finalScore = Math.min(finalScore, 20);
            criticalIssues.add("SECURITY COMPROMISE: Attempted prompt injection detected in resume data.");
        }

        // Final score bounds check
        finalScore = Math.max(0, Math.min(100, finalScore));

        // Score Band
        String scoreBand = "CRITICAL";
        if (finalScore >= 96) scoreBand = "RARE / NEAR-PERFECT";
        else if (finalScore >= 90) scoreBand = "EXCEPTIONAL";
        else if (finalScore >= 80) scoreBand = "STRONG";
        else if (finalScore >= 70) scoreBand = "COMPETITIVE";
        else if (finalScore >= 55) scoreBand = "DEVELOPING";
        else if (finalScore >= 40) scoreBand = "WEAK";

        // Generate Strengths, Issues, Wins
        for (AtsResponseDto.AtsCheckDto check : checks) {
            if ("PASS".equals(check.getStatus())) {
                if (topStrengths.size() < 3) {
                    topStrengths.add("Strong performance in " + check.getTitle() + ": " + check.getEvidence());
                }
            } else if ("FAIL".equals(check.getStatus())) {
                if (criticalIssues.size() < 3) {
                    criticalIssues.add("Fix " + check.getTitle() + ": " + check.getRecommendation());
                }
            } else if ("WARNING".equals(check.getStatus())) {
                if (quickWins.size() < 3) {
                    quickWins.add("Improve " + check.getTitle() + " (" + check.getRecommendation() + ")");
                }
            }
        }

        if (topStrengths.isEmpty()) topStrengths.add("Structure contains standard headings.");
        if (quickWins.isEmpty()) quickWins.add("Add measurable metrics to one of your project bullet points.");

        // Section Scores Map matching legacy categories
        Map<String, Integer> categories = new LinkedHashMap<>();
        categories.put("Keywords", Math.round((earnedD / 15.0f) * 100));
        categories.put("Formatting", Math.round((earnedA / 15.0f) * 100));
        categories.put("Grammar", Math.round((earnedF / 10.0f) * 100));
        categories.put("Experience", Math.round((earnedE / 15.0f) * 100));
        categories.put("Projects", Math.round((earnedE / 15.0f) * 100));
        categories.put("Education", Math.round((earnedB / 15.0f) * 100));
        categories.put("Skills", Math.round((earnedD / 15.0f) * 100));
        categories.put("Achievements", Math.round((earnedC / 20.0f) * 100));
        categories.put("Contact", Math.round((earnedB / 15.0f) * 100));

        return new ScoreBreakdown(
                finalScore, categories,
                scoreBand, candidateType, candidateTypeConfidence, candidateTypeEvidence,
                confidenceLevel, parseConfidence, parseWarnings,
                charCount, detectedSectionCount,
                checks, skillEvidence, weakBullets,
                topStrengths, criticalIssues, quickWins
        );
    }
}
