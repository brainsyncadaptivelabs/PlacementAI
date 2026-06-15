package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewFeedback;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.InterviewRecordRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockInterviewServiceImpl implements MockInterviewService {

    private final OllamaClient ollamaClient;
    private final MockInterviewRepository mockInterviewRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public MockInterviewResponseDto generateMockInterview(MockInterviewRequestDto request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String prompt = """
                Generate mock interview questions.

                IMPORTANT:
                Return ONLY valid JSON.
                Do NOT return objects inside arrays.
                Arrays must contain ONLY plain strings.

                Format:
                {
                  "role": "Backend Developer",
                  "questions": [
                    "Question 1",
                    "Question 2"
                  ],
                  "tips": [
                    "Tip 1",
                    "Tip 2"
                  ]
                }

                Role:
                """ + request.getRole() +
                """

                Experience Level:
                """ + request.getExperienceLevel();

        String fallbackJson = "{\"role\": \"" + request.getRole() + "\", \"questions\": [\"Describe your experience with " + request.getRole() + ".\", \"What are some challenges you faced in your previous projects?\"], \"tips\": [\"Be concise.\", \"Use STAR method.\"]}";

        try {
            log.info("Sending mock interview request to OllamaClient");
            JsonNode aiJson = ollamaClient.getJsonResponse(prompt, 0.7, e -> fallbackJson);

            return MockInterviewResponseDto.builder()
                    .role(aiJson.has("role") ? aiJson.get("role").asText() : request.getRole())
                    .questions(objectMapper.convertValue(
                            aiJson.get("questions"),
                            new TypeReference<List<String>>() {}
                    ))
                    .tips(objectMapper.convertValue(
                            aiJson.get("tips"),
                            new TypeReference<List<String>>() {}
                    ))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate interview", e);
            throw new RuntimeException("Failed to generate interview");
        }
    }

    @Override
    @Transactional
    public MockInterviewDto saveInterviewResults(MockInterviewDto interviewDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MockInterview interview = MockInterview.builder()
                .role(interviewDto.getRole())
                .experienceLevel(interviewDto.getExperienceLevel())
                .company(interviewDto.getCompany())
                .topic(interviewDto.getTopic())
                .transcript(interviewDto.getTranscript())
                .user(user)
                .completedAt(LocalDateTime.now())
                .build();

        if (interviewDto.getQuestions() != null) {
            List<InterviewQuestion> questions = interviewDto.getQuestions().stream()
                    .map(q -> InterviewQuestion.builder()
                            .questionText(q.getQuestionText())
                            .answerText(q.getAnswerText())
                            .score(q.getScore())
                            .mockInterview(interview)
                            .build())
                    .collect(Collectors.toList());
            interview.setQuestions(questions);
        }

        // Generate Feedback using AI
        String feedbackPrompt = "Analyze this interview transcript and provide feedback in JSON format.\n" +
                "Transcript: " + interviewDto.getTranscript() + "\n" +
                "Format: {\"totalScore\": 85, \"finalAssessment\": \"Good performance...\", \"strengths\": [\"Communication\"], \"areasForImprovement\": [\"Technical depth\"]}";

        String fallbackFeedback = "{\"totalScore\": 0, \"finalAssessment\": \"Feedback generation failed.\", \"strengths\": [], \"areasForImprovement\": []}";

        try {
            JsonNode feedbackJson = ollamaClient.getJsonResponse(feedbackPrompt, 0.5, e -> fallbackFeedback);
            InterviewFeedback feedback = InterviewFeedback.builder()
                    .totalScore(feedbackJson.get("totalScore").asInt())
                    .finalAssessment(feedbackJson.get("finalAssessment").asText())
                    .strengths(objectMapper.convertValue(feedbackJson.get("strengths"), new TypeReference<List<String>>() {}))
                    .areasForImprovement(objectMapper.convertValue(feedbackJson.get("areasForImprovement"), new TypeReference<List<String>>() {}))
                    .mockInterview(interview)
                    .build();
            interview.setFeedback(feedback);
        } catch (Exception e) {
            log.error("Failed to generate feedback", e);
        }

        MockInterview savedInterview = mockInterviewRepository.save(interview);
        return mapToDto(savedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MockInterviewDto> getInterviewHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mockInterviewRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MockInterviewDto getInterviewById(Long id) {
        MockInterview interview = mockInterviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        return mapToDto(interview);
    }

    private MockInterviewDto mapToDto(MockInterview interview) {
        return MockInterviewDto.builder()
                .id(interview.getId())
                .role(interview.getRole())
                .experienceLevel(interview.getExperienceLevel())
                .company(interview.getCompany())
                .topic(interview.getTopic())
                .transcript(interview.getTranscript())
                .questions(interview.getQuestions() != null ? interview.getQuestions().stream()
                        .map(q -> InterviewQuestionDto.builder()
                                .questionText(q.getQuestionText())
                                .answerText(q.getAnswerText())
                                .score(q.getScore())
                                .build())
                        .collect(Collectors.toList()) : null)
                .feedback(interview.getFeedback() != null ? InterviewFeedbackDto.builder()
                        .totalScore(interview.getFeedback().getTotalScore())
                        .finalAssessment(interview.getFeedback().getFinalAssessment())
                        .strengths(interview.getFeedback().getStrengths() != null ? new java.util.ArrayList<>(interview.getFeedback().getStrengths()) : null)
                        .areasForImprovement(interview.getFeedback().getAreasForImprovement() != null ? new java.util.ArrayList<>(interview.getFeedback().getAreasForImprovement()) : null)
                        .build() : null)
                .build();
    }
}