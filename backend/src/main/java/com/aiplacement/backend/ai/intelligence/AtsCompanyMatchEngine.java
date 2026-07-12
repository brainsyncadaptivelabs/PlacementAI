package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.dto.AtsResponseDto.CompanyMatchDto;
import java.util.*;

public class AtsCompanyMatchEngine {

    public static class CompanyProfile {
        private final String name;
        private final String targetIndustry; // Tech, Marketing, Finance, HR
        private final List<String> preferredSkills;
        private final int minExperienceYears;
        private final double weightSkills;
        private final double weightExperience;

        public CompanyProfile(String name, String targetIndustry, List<String> preferredSkills,
                              int minExperienceYears, double weightSkills, double weightExperience) {
            this.name = name;
            this.targetIndustry = targetIndustry;
            this.preferredSkills = preferredSkills;
            this.minExperienceYears = minExperienceYears;
            this.weightSkills = weightSkills;
            this.weightExperience = weightExperience;
        }

        public String getName() { return name; }
        public String getTargetIndustry() { return targetIndustry; }
        public List<String> getPreferredSkills() { return preferredSkills; }
        public int getMinExperienceYears() { return minExperienceYears; }
        public double getWeightSkills() { return weightSkills; }
        public double getWeightExperience() { return weightExperience; }
    }

    private static final List<CompanyProfile> profiles = new ArrayList<>();

    static {
        // Tech giants
        profiles.add(new CompanyProfile("Google", "Tech", Arrays.asList("Java", "Python", "Go", "C++", "Kubernetes", "System Design", "Algorithms"), 3, 0.6, 0.4));
        profiles.add(new CompanyProfile("Microsoft", "Tech", Arrays.asList("C#", "TypeScript", "React", "SQL", "Azure", "System Design"), 2, 0.6, 0.4));
        profiles.add(new CompanyProfile("Amazon", "Tech", Arrays.asList("Java", "C++", "AWS", "Docker", "Microservices", "System Design"), 2, 0.6, 0.4));
        profiles.add(new CompanyProfile("Oracle", "Tech", Arrays.asList("Java", "SQL", "Databases", "PL/SQL", "Cloud Infrastructures"), 2, 0.7, 0.3));
        profiles.add(new CompanyProfile("IBM", "Tech", Arrays.asList("Java", "Python", "Cloud", "RedHat", "AI", "Docker"), 1, 0.6, 0.4));
        
        // IT Services
        profiles.add(new CompanyProfile("TCS", "Tech", Arrays.asList("Java", "SQL", "JavaScript", "HTML", "CSS"), 0, 0.5, 0.5));
        profiles.add(new CompanyProfile("Infosys", "Tech", Arrays.asList("Java", "SQL", "Python", "React", "Cloud Foundations"), 0, 0.5, 0.5));
        profiles.add(new CompanyProfile("Accenture", "Tech", Arrays.asList("Java", "Agile", "Cloud", "Salesforce", "React"), 0, 0.5, 0.5));
        profiles.add(new CompanyProfile("Capgemini", "Tech", Arrays.asList("Java", "React", "Angular", "Web Services", "SQL"), 0, 0.5, 0.5));
        profiles.add(new CompanyProfile("Deloitte", "Tech", Arrays.asList("SQL", "Tableau", "Power BI", "Python", "Project Management"), 1, 0.6, 0.4));

        // Marketing
        profiles.add(new CompanyProfile("Meta", "Marketing", Arrays.asList("Meta Ads Manager", "SEO", "Google Analytics", "SQL", "Content Strategy"), 2, 0.6, 0.4));
        profiles.add(new CompanyProfile("HubSpot", "Marketing", Arrays.asList("HubSpot", "SEO", "Email Marketing", "CRM", "Content Strategy"), 1, 0.5, 0.5));
        profiles.add(new CompanyProfile("Adobe", "Marketing", Arrays.asList("Figma", "Photoshop", "SEO", "Adobe Analytics", "Digital Marketing"), 2, 0.6, 0.4));

        // Finance
        profiles.add(new CompanyProfile("Goldman Sachs", "Finance", Arrays.asList("Java", "Python", "SQL", "Financial Modeling", "Excel", "Accounting"), 2, 0.5, 0.5));
        profiles.add(new CompanyProfile("JPMorgan", "Finance", Arrays.asList("Financial Analysis", "Excel", "Accounting", "SQL", "Tableau"), 1, 0.5, 0.5));

        // HR
        profiles.add(new CompanyProfile("LinkedIn", "HR", Arrays.asList("Talent Acquisition", "Sourcing", "ATS Systems", "Employee Relations", "Onboarding"), 2, 0.6, 0.4));
        profiles.add(new CompanyProfile("Workday", "HR", Arrays.asList("Workday", "HRIS Tools", "Compensation & Benefits", "Talent Management"), 2, 0.6, 0.4));
    }

    public static List<CompanyMatchDto> match(String candidateDomain, List<String> candidateSkills, int yearsOfExp, int atsScore) {
        List<CompanyMatchDto> matches = new ArrayList<>();
        String normalizedDomain = candidateDomain == null ? "Tech" : candidateDomain.toLowerCase();

        String industryCategory = "Tech";
        if (normalizedDomain.contains("market")) {
            industryCategory = "Marketing";
        } else if (normalizedDomain.contains("finance") || normalizedDomain.contains("account")) {
            industryCategory = "Finance";
        } else if (normalizedDomain.contains("hr") || normalizedDomain.contains("recruit") || normalizedDomain.contains("human")) {
            industryCategory = "HR";
        }

        for (CompanyProfile profile : profiles) {
            double industryFactor = 0.4;
            if (profile.getTargetIndustry().equalsIgnoreCase(industryCategory)) {
                industryFactor = 1.0;
            } else if (profile.getTargetIndustry().equalsIgnoreCase("Tech") && industryCategory.equalsIgnoreCase("Finance")) {
                // Fintech cross compatibility
                industryFactor = 0.7;
            } else if (profile.getTargetIndustry().equalsIgnoreCase("Finance") && industryCategory.equalsIgnoreCase("Tech")) {
                industryFactor = 0.7;
            }

            // Skill match percentage
            long matchedSkillsCount = profile.getPreferredSkills().stream()
                    .filter(ps -> candidateSkills.stream().anyMatch(cs -> cs.equalsIgnoreCase(ps) || cs.toLowerCase().contains(ps.toLowerCase())))
                    .count();
            double skillRatio = (double) matchedSkillsCount / Math.max(1, profile.getPreferredSkills().size());

            // Experience match score
            double expScore = 100.0;
            if (yearsOfExp < profile.getMinExperienceYears()) {
                expScore = 100.0 - (double)(profile.getMinExperienceYears() - yearsOfExp) * 15.0;
            }
            expScore = Math.max(40.0, expScore);

            // Compute compatibility
            double baseScore = (skillRatio * 100.0 * profile.getWeightSkills()) + (expScore * profile.getWeightExperience());
            double adjustedScore = baseScore * industryFactor;

            // Apply ATS score influence
            double finalScoreDouble = (adjustedScore * 0.8) + (atsScore * 0.2);
            int finalScore = Math.max(30, Math.min(96, (int) Math.round(finalScoreDouble)));

            // Reason generation
            StringBuilder reason = new StringBuilder();
            if (industryFactor == 1.0) {
                reason.append("Core alignment with ").append(profile.getName()).append("'s ").append(profile.getTargetIndustry()).append(" division. ");
            } else {
                reason.append("Cross-domain transferability. ");
            }

            if (matchedSkillsCount > 0) {
                reason.append("Matched skills: ").append(matchedSkillsCount).append(" key tools/stack requirements. ");
            } else {
                reason.append("Requires learning the company's core stack. ");
            }

            if (yearsOfExp < profile.getMinExperienceYears()) {
                reason.append("Requires ").append(profile.getMinExperienceYears()).append("+ years of experience (you have ").append(yearsOfExp).append(").");
            } else {
                reason.append("Meets or exceeds experience thresholds.");
            }

            matches.add(CompanyMatchDto.builder()
                    .name(profile.getName())
                    .score(finalScore)
                    .reason(reason.toString())
                    .build());
        }

        // Sort by score descending and return top 6
        matches.sort((a, b) -> b.getScore().compareTo(a.getScore()));
        return matches.subList(0, Math.min(6, matches.size()));
    }
}
