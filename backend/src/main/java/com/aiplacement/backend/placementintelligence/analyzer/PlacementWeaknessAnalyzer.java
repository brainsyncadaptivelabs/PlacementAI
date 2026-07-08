package com.aiplacement.backend.placementintelligence.analyzer;

import com.aiplacement.backend.placementintelligence.dto.WeaknessAnalysisDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PlacementWeaknessAnalyzer {

    public WeaknessAnalysisDto analyzeWeaknesses(
            int resumeScore, int codingScore, int interviewScore,
            int communicationScore, int aptitudeScore, int skillGapScore,
            List<String> userSkills, String targetRole) {

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> risks = new ArrayList<>();
        List<String> immediateActions = new ArrayList<>();
        List<String> recommendedLearning = new ArrayList<>();

        // Analyze Strengths
        if (resumeScore >= 80) strengths.add("Strong resume format with excellent ATS parsing compliance");
        if (codingScore >= 80) strengths.add("Solid coding speed, accuracy, and algorithmic problem solving");
        if (interviewScore >= 80) strengths.add("Exceptional interview confidence and technical explanation capacity");
        if (communicationScore >= 80) strengths.add("Fluent communication style, minimal filler words, and solid pacing");
        if (aptitudeScore >= 80) strengths.add("Excellent analytical reasoning and quantitative aptitude skills");

        if (strengths.isEmpty()) {
            strengths.add("Consistent platform activity and eagerness to learn");
        }

        // Analyze Weaknesses
        if (resumeScore < 75) weaknesses.add("Resume score falls below target; needs quantifiable impact details");
        if (codingScore < 70) weaknesses.add("Struggles with advanced Data Structures and Dynamic Programming");
        if (interviewScore < 70) weaknesses.add("Inconsistent performance under mock interview pressure");
        if (communicationScore < 70) weaknesses.add("Prone to filler words and pacing inconsistencies in responses");
        if (aptitudeScore < 70) weaknesses.add("Needs improvement in speed for logical and quantitative tests");
        if (skillGapScore > 40) weaknesses.add("Identified gaps in core domain skills requested by recruiters");

        if (weaknesses.isEmpty()) {
            weaknesses.add("Minor scope for polishing niche system design concepts");
        }

        // Analyze Risks
        if (codingScore < 60) {
            risks.add("High risk of elimination in initial round coding challenges");
        }
        if (communicationScore < 60) {
            risks.add("Moderate risk of failing HR screeners due to clarity issues");
        }
        if (resumeScore < 60) {
            risks.add("High risk of resume rejection by automated ATS screening software");
        }
        if (interviewScore < 60) {
            risks.add("Risk of failing live technical round due to structural gaps");
        }

        if (risks.isEmpty()) {
            risks.add("Minimal placement risk; keep practicing to avoid stagnation");
        }

        // Immediate Actions
        if (codingScore < 70) {
            immediateActions.add("Practice at least 2 DSA problems on Recursion and Arrays today");
        }
        if (resumeScore < 70) {
            immediateActions.add("Update your resume using the ATS resume builder template");
        }
        if (communicationScore < 75) {
            immediateActions.add("Record one communication response focusing on reducing filler words");
        }
        if (interviewScore < 75) {
            immediateActions.add("Complete an AI mock interview for " + (targetRole != null ? targetRole : "Software Engineer"));
        }

        if (immediateActions.isEmpty()) {
            immediateActions.add("Review latest company placement papers for premium companies");
        }

        // Recommended Learning
        if (codingScore < 80) {
            recommendedLearning.add("Algorithms & Data Structures Crash Course");
        }
        if (interviewScore < 80) {
            recommendedLearning.add("System Design Fundamentals");
        }
        if (communicationScore < 80) {
            recommendedLearning.add("Professional Communication & Articulation Skills");
        }
        if (aptitudeScore < 80) {
            recommendedLearning.add("Quantitative Aptitude & Logical Reasoning Practice");
        }

        if (recommendedLearning.isEmpty()) {
            recommendedLearning.add("Advanced Architecture & Microservices Design Pattern");
        }

        return WeaknessAnalysisDto.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .risks(risks)
                .immediateActions(immediateActions)
                .recommendedLearning(recommendedLearning)
                .build();
    }
}
