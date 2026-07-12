package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.dto.AtsResponseDto.AtsSectionScoreDto;
import java.util.*;
import java.util.regex.*;

public class AtsSectionScoringEngine {

    public static List<AtsSectionScoreDto> calculate(
            String text,
            List<String> matchedSkills,
            String candidateType,
            int yearsOfExp,
            int projectCount,
            boolean hasMetrics,
            boolean hasLiveLink,
            boolean hasDegree,
            double cgpaVal,
            boolean hasCertification,
            boolean hasEmail,
            boolean hasPhone,
            boolean hasLinkedin,
            boolean hasGithub
    ) {
        String cleanText = text == null ? "" : text.trim();
        String lowerText = cleanText.toLowerCase();
        List<AtsSectionScoreDto> sections = new ArrayList<>();

        sections.add(calculateSummary(lowerText));
        sections.add(calculateEducation(lowerText, hasDegree, cgpaVal));
        sections.add(calculateSkills(lowerText, matchedSkills));
        sections.add(calculateProjects(lowerText, projectCount, hasLiveLink, hasMetrics));
        sections.add(calculateExperience(lowerText, candidateType, yearsOfExp, hasMetrics));
        sections.add(calculateCertifications(lowerText, hasCertification, candidateType));
        sections.add(calculateContact(lowerText, hasEmail, hasPhone, hasLinkedin, hasGithub));

        return sections;
    }

    private static AtsSectionScoreDto calculateSummary(String lowerText) {
        boolean hasSummary = lowerText.contains("summary") || lowerText.contains("objective") || 
                             lowerText.contains("profile") || lowerText.contains("professional summary");
        
        int score = 0;
        String status = "FAIL";
        String explanation = "Professional Summary section was not detected in the resume.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasSummary) {
            score = 75;
            status = "GOOD";
            explanation = "Professional Summary section is present and clear.";
            strengths.add("Summary section is explicitly defined.");
            
            // Check for specific keywords
            boolean hasKeywords = lowerText.contains("engineer") || lowerText.contains("developer") || 
                                  lowerText.contains("analyst") || lowerText.contains("intern") || lowerText.contains("specialist");
            if (hasKeywords) {
                score += 15;
                strengths.add("Target job titles/roles are clearly indicated.");
            } else {
                improvements.add("Include your target role title (e.g. Full Stack Developer) in the summary.");
            }

            // Check for excessive length
            int summaryIndex = lowerText.indexOf("summary");
            if (summaryIndex == -1) summaryIndex = lowerText.indexOf("objective");
            if (summaryIndex != -1 && lowerText.length() - summaryIndex > 400) {
                score = Math.max(70, score - 10);
                improvements.add("Keep the summary concise (around 3 to 4 lines maximum).");
            } else {
                score += 10;
                strengths.add("Concise and readable length.");
            }
        } else {
            improvements.add("Add a brief 3-4 line summary highlighting your target role, core tech stack, and key achievements.");
        }

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Summary")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    private static AtsSectionScoreDto calculateEducation(String lowerText, boolean hasDegree, double cgpaVal) {
        boolean hasEdu = lowerText.contains("education") || lowerText.contains("academics") || lowerText.contains("academic background");
        
        int score = 0;
        String explanation = "Education section is missing or poorly structured.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasEdu) {
            score = 60;
            explanation = "Education section detected with standard academic history.";
            strengths.add("Education section is explicitly defined.");

            if (hasDegree) {
                score += 20;
                strengths.add("Degree (B.Tech/BE/MCA/etc.) is clearly specified.");
            } else {
                improvements.add("Specify your complete degree name next to your graduation details.");
            }

            if (cgpaVal > 0.0 || lowerText.contains("cgpa") || lowerText.contains("gpa") || lowerText.contains("%") || lowerText.contains("pointer")) {
                score += 10;
                strengths.add("Academic scores (CGPA or percentage) are listed.");
            } else {
                improvements.add("Mention your CGPA or marks. Recruiters filter heavily on academic criteria.");
            }

            // Check for graduation year
            boolean hasYear = Pattern.compile("\\b(202[0-9]|2030)\\b").matcher(lowerText).find();
            if (hasYear) {
                score += 10;
                strengths.add("Graduation year is clearly stated.");
            } else {
                improvements.add("Include your expected graduation/passing year.");
            }
        } else {
            improvements.add("Add an Education section outlining your degrees, college name, and passing year.");
        }

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Education")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    private static AtsSectionScoreDto calculateSkills(String lowerText, List<String> matchedSkills) {
        boolean hasSkills = lowerText.contains("skills") || lowerText.contains("technical skills") || lowerText.contains("technologies");
        
        int score = 0;
        String explanation = "Skills section is missing or lacks clear structure.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasSkills) {
            score = 50;
            explanation = "Technical Skills section detected.";
            strengths.add("Skills section is present.");

            int matchedCount = matchedSkills == null ? 0 : matchedSkills.size();
            if (matchedCount > 10) {
                score += 40;
                strengths.add("Robust set of technical skills listed.");
            } else if (matchedCount > 5) {
                score += 25;
                strengths.add("Core technical skills are listed.");
            } else {
                improvements.add("List more relevant core skills matching your target roles.");
            }

            // Keyword Stuffing check: split and count
            String[] words = lowerText.split("\\s+");
            if (words.length > 500 && matchedCount > 35) {
                // excessive technology terms without context
                score = Math.max(40, score - 25);
                improvements.add("Avoid keyword stuffing. Group technical skills logically and back them in experience.");
            } else {
                score += 10;
                strengths.add("Technical skills list is within clean thresholds.");
            }
        } else {
            improvements.add("Create a dedicated Technical Skills section to highlight your tech stack.");
        }

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Skills")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    private static AtsSectionScoreDto calculateProjects(String lowerText, int projectCount, boolean hasLiveLink, boolean hasMetrics) {
        boolean hasProj = lowerText.contains("projects") || lowerText.contains("academic projects") || lowerText.contains("personal projects");
        
        int score = 0;
        String explanation = "Projects section is missing or lacks detail.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasProj) {
            score = 50;
            explanation = "Projects section detected with project descriptions.";
            strengths.add("Projects section is present.");

            if (projectCount >= 2) {
                score += 15;
                strengths.add("Multiple technical projects are listed.");
            } else {
                improvements.add("Add at least 2 detailed technical projects to show depth.");
            }

            if (hasLiveLink) {
                score += 15;
                strengths.add("Active GitHub or deployment links are provided.");
            } else {
                improvements.add("Add live URLs or GitHub repository links for your projects.");
            }

            if (hasMetrics) {
                score += 15;
                strengths.add("Projects include measurable results or performance improvements.");
            } else {
                improvements.add("Include metrics (e.g. latency reduced by 30%, 100+ active users).");
            }

            boolean hasTechDetail = lowerText.contains("api") || lowerText.contains("database") || lowerText.contains("docker") || 
                                   lowerText.contains("aws") || lowerText.contains("framework") || lowerText.contains("query");
            if (hasTechDetail) {
                score += 5;
                strengths.add("Details project tech architecture (APIs, DBs, etc.).");
            }
        } else {
            improvements.add("Add a Projects section. Essential for engineering graduates.");
        }

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Projects")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    private static AtsSectionScoreDto calculateExperience(String lowerText, String candidateType, int yearsOfExp, boolean hasMetrics) {
        boolean hasExp = lowerText.contains("experience") || lowerText.contains("work experience") || 
                         lowerText.contains("professional experience") || lowerText.contains("employment") || 
                         lowerText.contains("internships") || lowerText.contains("intern");
        
        int score = 0;
        String explanation = "Experience section details.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if ("STUDENT".equals(candidateType) || "FRESHER".equals(candidateType)) {
            // Student fairness rule
            score = 65;
            explanation = "Experience section evaluated under student/fresher criteria.";
            if (hasExp) {
                score += 20;
                strengths.add("Internships or technical roles are listed.");
            }
            if (hasMetrics) {
                score += 15;
                strengths.add("Quantifiable outcomes/achievements are included.");
            } else {
                improvements.add("Describe task outcomes with metrics (e.g. speed-up, bugs resolved).");
            }
        } else {
            // Experienced candidates
            if (hasExp) {
                score = 50;
                explanation = "Professional work experience section detected.";
                strengths.add("Experience section is present.");

                if (yearsOfExp >= 3) {
                    score += 20;
                    strengths.add("Substantial professional history (" + yearsOfExp + "+ years).");
                } else {
                    score += 10;
                }

                if (hasMetrics) {
                    score += 20;
                    strengths.add("Strong quantification of work impact.");
                } else {
                    improvements.add("Add measurable business metrics to your professional bullet points.");
                }

                // Check for action verbs
                boolean hasVerbs = lowerText.contains("built") || lowerText.contains("designed") || lowerText.contains("optimized");
                if (hasVerbs) {
                    score += 10;
                    strengths.add("Strong action verbs are used.");
                } else {
                    improvements.add("Start experience bullet points with strong action verbs.");
                }
            } else {
                score = 20;
                improvements.add("Add your professional experience or engineering jobs history.");
            }
        }

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Experience")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    private static AtsSectionScoreDto calculateCertifications(String lowerText, boolean hasCertification, String candidateType) {
        boolean hasCertSec = lowerText.contains("certification") || lowerText.contains("certifications") || 
                             lowerText.contains("licenses") || lowerText.contains("courses");
        
        int score = 0;
        String explanation = "Certifications details.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasCertification || hasCertSec) {
            score = 90;
            explanation = "Certifications are listed in the resume.";
            strengths.add("Technical certifications are documented.");
        } else {
            if ("STUDENT".equals(candidateType) || "FRESHER".equals(candidateType)) {
                // Student Optional Fairness
                score = 65;
                explanation = "Certifications are optional but recommended for students.";
                improvements.add("Earn and list technical certifications (AWS, Java, React) to boost profile.");
            } else {
                score = 50;
                explanation = "No professional certifications listed.";
                improvements.add("Add professional industry credentials matching your target career domain.");
            }
        }

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Certifications")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }

    private static AtsSectionScoreDto calculateContact(String lowerText, boolean hasEmail, boolean hasPhone, boolean hasLinkedin, boolean hasGithub) {
        int score = 0;
        String explanation = "Contact profile links presence analysis.";
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasEmail) {
            score += 25;
            strengths.add("Professional Email address is present.");
        } else {
            improvements.add("Add a valid professional email address.");
        }

        if (hasPhone) {
            score += 25;
            strengths.add("Phone number is present.");
        } else {
            improvements.add("Add your phone contact details.");
        }

        if (hasLinkedin) {
            score += 25;
            strengths.add("LinkedIn profile link detected.");
        } else {
            improvements.add("Include your professional LinkedIn URL.");
        }

        if (hasGithub) {
            score += 25;
            strengths.add("GitHub developer profile link detected.");
        } else {
            improvements.add("Include your GitHub profile link to showcase repository code.");
        }

        explanation = "Contact and professional profile completeness is evaluated.";

        score = Math.max(0, Math.min(100, score));
        return AtsSectionScoreDto.builder()
                .section("Contact & Profile")
                .score(score)
                .status(score >= 85 ? "STRONG" : (score >= 60 ? "GOOD" : "DEVELOPING"))
                .explanation(explanation)
                .strengths(strengths)
                .improvements(improvements)
                .build();
    }
}
