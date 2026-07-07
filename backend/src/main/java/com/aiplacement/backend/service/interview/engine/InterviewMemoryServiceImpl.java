package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewStatus;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewMemoryServiceImpl implements InterviewMemoryService {

    private final MockInterviewRepository mockInterviewRepository;

    @Override
    public String getPreviousHistoryContext(User user) {
        List<MockInterview> past = mockInterviewRepository.findByUserOrderByCreatedAtDesc(user);
        if (past == null || past.isEmpty()) {
            return "Candidate's Past Mock Interview History: None.\n";
        }
        StringBuilder sb = new StringBuilder("Candidate's Past Mock Interview History (use this to build on past questions, avoid duplicate topics, and target weak areas):\n");
        int count = 0;
        for (MockInterview mi : past) {
            if (mi.getStatus() == InterviewStatus.COMPLETED && mi.getFeedback() != null) {
                count++;
                sb.append(String.format("- Past Interview %d: Role: %s, Score: %d/100, Verdict: %s\n", 
                        count, mi.getRole(), mi.getFeedback().getTotalScore(), mi.getFeedback().getRecruiterVerdict()));
                if (mi.getFeedback().getStrengths() != null && !mi.getFeedback().getStrengths().isEmpty()) {
                    sb.append("  Strengths: ").append(String.join(", ", mi.getFeedback().getStrengths())).append("\n");
                }
                if (mi.getFeedback().getAreasForImprovement() != null && !mi.getFeedback().getAreasForImprovement().isEmpty()) {
                    sb.append("  Weaknesses/Improvements: ").append(String.join(", ", mi.getFeedback().getAreasForImprovement())).append("\n");
                }
                if (mi.getQuestions() != null && !mi.getQuestions().isEmpty()) {
                    List<String> qTexts = mi.getQuestions().stream()
                            .map(q -> q.getQuestionText())
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                    sb.append("  Previously Asked Questions: ").append(String.join(" | ", qTexts)).append("\n");
                }
                if (count >= 3) break;
            }
        }
        if (count == 0) {
            return "Candidate's Past Mock Interview History: None.\n";
        }
        return sb.toString();
    }
}
