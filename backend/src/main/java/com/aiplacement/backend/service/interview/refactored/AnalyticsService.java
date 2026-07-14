package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.InterviewFeedback;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final MockInterviewRepository mockInterviewRepository;

    public Map<String, Object> calculateUserAnalytics(com.aiplacement.backend.entity.User user) {
        log.info("Calculating deterministic interview analytics for user: {}", user.getEmail());
        List<MockInterview> interviews = mockInterviewRepository.findByUserOrderByCreatedAtDesc(user);
        Map<String, Object> analytics = new HashMap<>();

        analytics.put("totalInterviews", interviews.size());
        
        double avgScore = 0;
        double avgTech = 0;
        double avgComm = 0;
        double avgConf = 0;
        List<String> weakTopics = new ArrayList<>();
        List<Map<String, Object>> scoreTrend = new ArrayList<>();

        if (!interviews.isEmpty()) {
            double totalOverall = 0;
            double totalTech = 0;
            double totalComm = 0;
            double totalConf = 0;

            for (int i = interviews.size() - 1; i >= 0; i--) {
                MockInterview inter = interviews.get(i);
                if (inter.getFeedback() != null) {
                    InterviewFeedback feedback = inter.getFeedback();
                    totalOverall += feedback.getTotalScore();
                    totalTech += feedback.getTechnicalScore() != null ? feedback.getTechnicalScore() : feedback.getTotalScore();
                    totalComm += feedback.getCommunicationScore() != null ? feedback.getCommunicationScore() : feedback.getTotalScore();
                    totalConf += feedback.getConfidenceScore() != null ? feedback.getConfidenceScore() : feedback.getTotalScore();
                    
                    if (feedback.getAreasForImprovement() != null) {
                        for (String area : feedback.getAreasForImprovement()) {
                            if (!weakTopics.contains(area) && weakTopics.size() < 6) {
                                weakTopics.add(area);
                            }
                        }
                    }

                    Map<String, Object> trendItem = new HashMap<>();
                    trendItem.put("date", inter.getCompletedAt() != null ? inter.getCompletedAt().toLocalDate().toString() : inter.getCreatedAt().toLocalDate().toString());
                    trendItem.put("score", feedback.getTotalScore());
                    trendItem.put("role", inter.getRole());
                    scoreTrend.add(trendItem);
                }
            }

            int count = interviews.size();
            avgScore = totalOverall / count;
            avgTech = totalTech / count;
            avgComm = totalComm / count;
            avgConf = totalConf / count;
        }

        analytics.put("averageScore", Math.round(avgScore));
        analytics.put("averageTechnical", Math.round(avgTech));
        analytics.put("averageCommunication", Math.round(avgComm));
        analytics.put("averageConfidence", Math.round(avgConf));
        analytics.put("weakTopics", weakTopics);
        analytics.put("scoreTrend", scoreTrend);

        return analytics;
    }
}
