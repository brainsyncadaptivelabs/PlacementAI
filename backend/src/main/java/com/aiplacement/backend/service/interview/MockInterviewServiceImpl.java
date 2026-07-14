package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;
import com.aiplacement.backend.service.interview.refactored.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockInterviewServiceImpl implements MockInterviewService {

    private final MockInterviewRepository mockInterviewRepository;
    private final UserRepository userRepository;
    private final InterviewOrchestrator interviewOrchestrator;
    private final AnalyticsService analyticsService;
    private final ReportGenerationService reportGenerationService;
    private final AIOrchestrationService aiOrchestrationService;

    @Value("${elevenlabs.api.key:dummy}")
    private String elevenlabsApiKey;

    @Value("${elevenlabs.voice.id:21m00Tcm4TlvDq8ikWAM}")
    private String elevenlabsVoiceId;

    @Override
    public MockInterviewResponseDto generateMockInterview(MockInterviewRequestDto request) {
        log.info("Generating mock interview questions.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("role", request.getRole() != null ? request.getRole() : "Software Engineer");
        variables.put("experienceLevel", request.getExperienceLevel() != null ? request.getExperienceLevel() : "Mid");
        variables.put("company", request.getCompany() != null ? request.getCompany() : "Tech Company");
        variables.put("difficulty", request.getDifficulty() != null ? request.getDifficulty() : "Medium");
        variables.put("interviewType", request.getInterviewType() != null ? request.getInterviewType() : "Technical");
        variables.put("resumeText", request.getResumeText() != null ? request.getResumeText() : "None");
        variables.put("jobDescription", request.getJobDescription() != null ? request.getJobDescription() : "None");

        com.fasterxml.jackson.databind.JsonNode aiJson = aiOrchestrationService.executeJsonTask("QUESTION_GENERATION", variables, null);
        
        List<String> questions = new ArrayList<>();
        if (aiJson.has("nextQuestion")) {
            questions.add(aiJson.get("nextQuestion").asText());
        }
        
        return MockInterviewResponseDto.builder()
                .role(request.getRole())
                .questions(questions)
                .tips(Arrays.asList("Explain your thought process aloud.", "Minimize hesitation gaps."))
                .build();
    }

    @Override
    @Transactional
    public AdaptiveStartResponseDto startAdaptiveInterview(MockInterviewRequestDto request) {
        return interviewOrchestrator.startAdaptiveInterview(request);
    }

    @Override
    @Transactional
    public AdaptiveAnswerResponseDto processAdaptiveAnswer(AdaptiveAnswerRequestDto request) {
        return interviewOrchestrator.processAdaptiveAnswer(request);
    }

    @Override
    @Transactional
    public void terminateAdaptiveInterview(Long id) {
        interviewOrchestrator.terminateAdaptiveInterview(id);
    }

    @Override
    @Transactional
    public MockInterviewDto saveInterviewResults(MockInterviewDto interviewDto) {
        log.info("Saving results for interview session.");
        MockInterview interview = mockInterviewRepository.findById(interviewDto.getId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        reportGenerationService.compileAndSaveReport(interview, null);
        return getInterviewById(interview.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MockInterviewDto> getInterviewHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MockInterview> history = mockInterviewRepository.findByUserOrderByCreatedAtDesc(user);
        List<MockInterviewDto> dtos = new ArrayList<>();
        for (MockInterview item : history) {
            dtos.add(mapToDto(item));
        }
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public MockInterviewDto getInterviewById(Long id) {
        MockInterview interview = mockInterviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser != null && currentUser.getRole() == com.aiplacement.backend.entity.Role.STUDENT) {
            if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
                throw new org.springframework.security.access.AccessDeniedException("Access Denied: You do not own this interview.");
            }
        }
        
        return mapToDto(interview);
    }

    @Override
    @Transactional
    public void deleteInterview(Long id) {
        MockInterview interview = mockInterviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser != null && currentUser.getRole() == com.aiplacement.backend.entity.Role.STUDENT) {
            if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
                throw new org.springframework.security.access.AccessDeniedException("Access Denied: You do not own this interview.");
            }
        }
        
        mockInterviewRepository.delete(interview);
        log.info("Deleted interview with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getInterviewAnalytics() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return analyticsService.calculateUserAnalytics(user);
    }

    @Override
    public byte[] generateSpeech(String text) {
        log.info("Mock speech output generated (ElevenLabs wrapper).");
        return new byte[0]; // Wrapper placeholder
    }

    private MockInterviewDto mapToDto(MockInterview interview) {
        return MockInterviewDto.builder()
                .id(interview.getId())
                .role(interview.getRole())
                .experienceLevel(interview.getExperienceLevel())
                .company(interview.getCompany())
                .topic(interview.getTopic())
                .conversationalStyle(interview.getConversationalStyle())
                .transcript(interview.getTranscript())
                .build();
    }
}