package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.entity.Resume;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ResumeRankingEngine {

    public List<RankedResume> rankResumes(List<Resume> resumes, List<String> keywords) {
        List<RankedResume> ranked = new ArrayList<>();

        for (Resume resume : resumes) {
            int score = resume.getAtsScore() != null ? resume.getAtsScore() : 60;
            String text = resume.getExtractedText() != null ? resume.getExtractedText().toLowerCase() : "";

            int matches = 0;
            for (String kw : keywords) {
                if (text.contains(kw.toLowerCase())) {
                    matches++;
                }
            }

            int finalScore = Math.min(100, score + (matches * 5));
            ranked.add(RankedResume.builder()
                    .resumeId(resume.getId())
                    .fileName(resume.getFileName())
                    .atsScore(score)
                    .matchScore(finalScore)
                    .build());
        }

        ranked.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return ranked;
    }

    @lombok.Value
    @lombok.Builder
    public static class RankedResume {
        Long resumeId;
        String fileName;
        int atsScore;
        int matchScore;
    }
}
