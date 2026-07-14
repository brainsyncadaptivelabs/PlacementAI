package com.aiplacement.backend.service.interview.orchestrator;

import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.InterviewStatus;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.engine.*;
import com.aiplacement.backend.service.interview.refactored.*;
import com.aiplacement.backend.service.interview.refactored.events.InterviewEvents;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewOrchestratorImpl implements InterviewOrchestrator {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final MockInterviewRepository mockInterviewRepository;

    private final ResumeIntelligenceService resumeIntelligenceService;
    private final JobDescriptionIntelligenceService jobDescriptionIntelligenceService;
    private final InterviewBlueprintService interviewBlueprintService;
    private final ConversationMemoryService conversationMemoryService;
    private final AdaptiveQuestionService adaptiveQuestionService;
    private final InterviewEvaluationService interviewEvaluationService;
    private final ReportGenerationService reportGenerationService;
    private final InterviewPersistenceService interviewPersistenceService;
    private final ContextBuilderService contextBuilderService;
    private final InterviewStateMachine stateMachine;
    private final DifficultyEngine difficultyEngine;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public AdaptiveStartResponseDto startAdaptiveInterview(MockInterviewRequestDto request) {
        log.info("[MOCK_INTERVIEW] [ORCHESTRATOR] Starting interview.");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resumeText = request.getResumeText();
        if (resumeText == null || resumeText.trim().isEmpty()) {
            var resumeOpt = resumeRepository.findFirstByUserOrderByCreatedAtDesc(user);
            if (resumeOpt.isPresent()) {
                resumeText = resumeOpt.get().getExtractedText();
            }
        }

        // 1. Initializing and running AI Resume & JD Intelligence
        stateMachine.validateTransition(InterviewState.INITIALIZING, InterviewState.RESUME_ANALYSIS);
        JsonNode resumeAnalysis = resumeIntelligenceService.analyzeResume(resumeText);
        eventPublisher.publishEvent(new InterviewEvents.ResumeAnalyzed(null, null, resumeAnalysis));

        stateMachine.validateTransition(InterviewState.RESUME_ANALYSIS, InterviewState.JD_ANALYSIS);
        JsonNode jdAnalysis = jobDescriptionIntelligenceService.analyzeJobDescription(request.getJobDescription());

        // 2. Blueprint & State transitions
        stateMachine.validateTransition(InterviewState.JD_ANALYSIS, InterviewState.INTERVIEW_BLUEPRINT);
        InterviewBlueprint blueprint = interviewBlueprintService.generateBlueprint(
                request.getRole(), request.getExperienceLevel(), request.getCompany(),
                request.getDifficulty(), request.getInterviewType(), resumeAnalysis, jdAnalysis);
        eventPublisher.publishEvent(new InterviewEvents.BlueprintGenerated(null, null, null));

        stateMachine.validateTransition(InterviewState.INTERVIEW_BLUEPRINT, InterviewState.INTRODUCTION);

        MockInterview interview = MockInterview.builder()
                .role(request.getRole())
                .experienceLevel(request.getExperienceLevel())
                .company(request.getCompany())
                .topic(request.getTopic())
                .conversationalStyle(request.getConversationalStyle() != null ? request.getConversationalStyle() : "Professional")
                .status(InterviewStatus.IN_PROGRESS)
                .currentQuestionIndex(0)
                .user(user)
                .questions(new ArrayList<>())
                .build();

        AdaptiveState state = AdaptiveState.builder()
                .role(request.getRole())
                .experienceLevel(request.getExperienceLevel())
                .company(request.getCompany() != null ? request.getCompany() : "General Tech Company")
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "Medium")
                .interviewType(request.getInterviewType() != null ? request.getInterviewType() : "Technical")
                .resumeText(resumeText)
                .jobDescription(request.getJobDescription())
                .topicsCovered(new ArrayList<>())
                .remainingObjectives(new ArrayList<>(blueprint.getSections()))
                .previousQuestions(new ArrayList<>())
                .previousAnswers(new ArrayList<>())
                .technicalScore(70)
                .communicationScore(70)
                .confidenceScore(70)
                .problemSolvingScore(70)
                .codingScore(70)
                .behavioralScore(70)
                .roleReadiness(70)
                .totalQuestionsLimit(blueprint.getQuestionBudget())
                .currentDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "Medium")
                .isCodingRound(blueprint.getSections().contains("CODING"))
                .conversationalStyle(interview.getConversationalStyle())
                .fsmState(InterviewState.INTRODUCTION)
                .blueprint(blueprint)
                .currentAgentName("HR Recruiter")
                .build();

        // 3. Generate first question using generation engine and router
        String historyContext = contextBuilderService.buildHistoryContext(user, state.getRole());
        String graphState = conversationMemoryService.getKnowledgeGraphState(interview);
        
        String firstQuestion = adaptiveQuestionService.generateQuestion(interview, state, 
                "Tone: " + state.getConversationalStyle(), "Company Style", historyContext, graphState);

        InterviewQuestion firstQuestionEntity = InterviewQuestion.builder()
                .questionText(firstQuestion)
                .mockInterview(interview)
                .score(0)
                .build();
        interview.getQuestions().add(firstQuestionEntity);
        interview.setTranscript("Interviewer: " + firstQuestion + "\n\n");

        interviewPersistenceService.saveInterviewState(interview, state);
        eventPublisher.publishEvent(new InterviewEvents.InterviewStarted(interview.getId(), interview, state));
        log.info("[MOCK_INTERVIEW] [QUESTION_SENT] Interview ID: {}, Question: {}", interview.getId(), firstQuestion);

        return AdaptiveStartResponseDto.builder()
                .interviewId(interview.getId())
                .firstQuestion(firstQuestion)
                .build();
    }

    @Override
    @Transactional
    public AdaptiveAnswerResponseDto processAdaptiveAnswer(AdaptiveAnswerRequestDto request) {
        log.info("[MOCK_INTERVIEW] [ORCHESTRATOR] Processing answer.");
        MockInterview interview = mockInterviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            return AdaptiveAnswerResponseDto.builder().isFinished(true).nextQuestion("Already completed.").build();
        }

        AdaptiveState state;
        try {
            state = objectMapper.readValue(interview.getCurrentStateJson(), AdaptiveState.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read state", e);
        }

        int currentIndex = interview.getCurrentQuestionIndex();
        InterviewQuestion currentQ = interview.getQuestions().get(currentIndex);
        currentQ.setAnswerText(request.getAnswer());
        
        interview.setTranscript(interview.getTranscript() + "Candidate: " + request.getAnswer() + "\n\n");
        int nextQuestionIndex = currentIndex + 1;
        interview.setCurrentQuestionIndex(nextQuestionIndex);

        // Transition check
        InterviewState nextState = decideNextFSMState(state, nextQuestionIndex);
        stateMachine.validateTransition(state.getFsmState(), nextState);
        state.setFsmState(nextState);

        // Evaluation
        JsonNode evalJson = interviewEvaluationService.evaluateAnswer(interview, state, 
                currentQ.getQuestionText(), request, "Tone: " + state.getConversationalStyle(), "Company Style");

        int evaluatedScore = evalJson.has("evaluatedScore") ? evalJson.get("evaluatedScore").asInt() : 70;
        currentQ.setScore(evaluatedScore);

        // Update layered memory
        conversationMemoryService.updateMemory(interview, state, currentQ.getQuestionText(), request.getAnswer(), evalJson);

        // Persist snapshot log
        interviewPersistenceService.saveSnapshot(interview, state, currentQ.getQuestionText(), 
                request.getAnswer(), evalJson, "v1", "gemini-1.5");

        // Adjust difficulty
        difficultyEngine.adjustDifficulty(state, evaluatedScore, 10.0, 0.05);

        if (nextState == InterviewState.FINAL_EVALUATION || nextState == InterviewState.REPORT_GENERATION || nextState == InterviewState.COMPLETED) {
            log.info("Transitioning FSM to compilation and completion stages.");
            stateMachine.validateTransition(state.getFsmState(), InterviewState.REPORT_GENERATION);
            state.setFsmState(InterviewState.REPORT_GENERATION);
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());

            interviewPersistenceService.saveInterviewState(interview, state);
            
            // Asynchronous Report compilation (Background processing)
            reportGenerationService.compileReportAsync(interview, state);
            
            stateMachine.validateTransition(InterviewState.REPORT_GENERATION, InterviewState.COMPLETED);
            state.setFsmState(InterviewState.COMPLETED);
            interviewPersistenceService.saveInterviewState(interview, state);

            return AdaptiveAnswerResponseDto.builder().isFinished(true).build();
        }

        // Generate next question
        String historyContext = contextBuilderService.buildHistoryContext(interview.getUser(), state.getRole());
        String graphState = conversationMemoryService.getKnowledgeGraphState(interview);
        String nextQuestion = adaptiveQuestionService.generateQuestion(interview, state, 
                "Tone: " + state.getConversationalStyle(), "Company Style", historyContext, graphState);

        InterviewQuestion nextQuestionEntity = InterviewQuestion.builder()
                .questionText(nextQuestion)
                .mockInterview(interview)
                .score(0)
                .build();
        interview.getQuestions().add(nextQuestionEntity);
        interview.setTranscript(interview.getTranscript() + "Interviewer: " + nextQuestion + "\n\n");

        interviewPersistenceService.saveInterviewState(interview, state);
        return AdaptiveAnswerResponseDto.builder().isFinished(false).nextQuestion(nextQuestion).build();
    }

    @Override
    @Transactional
    public void terminateAdaptiveInterview(Long id) {
        log.info("Terminating adaptive interview session: {}", id);
        MockInterview interview = mockInterviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus(InterviewStatus.COMPLETED);
        mockInterviewRepository.save(interview);
    }

    private InterviewState decideNextFSMState(AdaptiveState state, int nextQuestionIndex) {
        if (nextQuestionIndex >= state.getTotalQuestionsLimit()) {
            return InterviewState.FINAL_EVALUATION;
        }
        List<String> sections = state.getBlueprint().getSections();
        int questionsPerSection = Math.max(1, state.getTotalQuestionsLimit() / sections.size());
        int sectionIndex = nextQuestionIndex / questionsPerSection;

        if (sectionIndex >= sections.size()) {
            return InterviewState.FINAL_EVALUATION;
        }

        try {
            String stateStr = sections.get(sectionIndex).toUpperCase();
            if ("RESUME_REVIEW".equals(stateStr)) {
                return InterviewState.RESUME_DISCUSSION;
            }
            return InterviewState.valueOf(stateStr);
        } catch (Exception e) {
            return InterviewState.TECHNICAL;
        }
    }
}
