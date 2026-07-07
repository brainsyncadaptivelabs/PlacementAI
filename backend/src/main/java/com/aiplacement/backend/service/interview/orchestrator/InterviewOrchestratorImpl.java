package com.aiplacement.backend.service.interview.orchestrator;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.dto.interview.InterviewFeedbackDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.InterviewStatus;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.coding.CodingInterviewOrchestrationService;
import com.aiplacement.backend.service.interview.engine.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.aiplacement.backend.service.interview.memory.KnowledgePersistenceService;
import com.aiplacement.backend.service.interview.memory.MemoryRetrievalService;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewOrchestratorImpl implements InterviewOrchestrator {

    private final AIClient aiClient;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final MockInterviewRepository mockInterviewRepository;
    
    // Engine Services
    private final QuestionGenerationEngine questionGenerationEngine;
    private final AnswerEvaluationEngine answerEvaluationEngine;
    private final InterviewMemoryService interviewMemoryService;
    private final AdaptiveDifficultyEngine adaptiveDifficultyEngine;
    private final PersonaRouter personaRouter;
    private final InterviewPersistenceService interviewPersistenceService;
    private final InterviewReportService interviewReportService;
    private final KnowledgePersistenceService knowledgePersistenceService;
    private final MemoryRetrievalService memoryRetrievalService;
    // Phase 5: Coding Intelligence
    private final CodingInterviewOrchestrationService codingInterviewOrchestrationService;
    // Phase 6: System Design Intelligence
    private final com.aiplacement.backend.service.systemdesign.SystemDesignOrchestrationService systemDesignOrchestrationService;
    private final com.aiplacement.backend.repository.interview.SystemDesignDiagramRepository diagramRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public AdaptiveStartResponseDto startAdaptiveInterview(MockInterviewRequestDto request) {
        log.info("[MOCK_INTERVIEW] [ORCHESTRATOR] Initializing FSM state CREATED for role: {}", request.getRole());
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

        String style = request.getConversationalStyle() != null ? request.getConversationalStyle() : "Professional";

        // 1. FSM state transition: CREATED -> PREPARING
        log.info("[MOCK_INTERVIEW] [STATE_TRANSITION] Transitioning FSM: CREATED -> PREPARING");
        InterviewBlueprint blueprint = generateBlueprint(request, resumeText);
        log.info("[MOCK_INTERVIEW] [ORCHESTRATOR] Generated Interview Blueprint for role '{}'. Total sections: {}, Budget: {}", 
                blueprint.getRole(), blueprint.getSections(), blueprint.getQuestionBudget());

        MockInterview interview = MockInterview.builder()
                .role(request.getRole())
                .experienceLevel(request.getExperienceLevel())
                .company(request.getCompany())
                .topic(request.getTopic())
                .conversationalStyle(style)
                .status(InterviewStatus.IN_PROGRESS)
                .currentQuestionIndex(0)
                .user(user)
                .questions(new ArrayList<>())
                .build();

        // 2. FSM state transition: PREPARING -> INTRODUCTION (or first section in blueprint)
        InterviewState nextState = InterviewState.INTRODUCTION;
        if (blueprint.getSections() != null && !blueprint.getSections().isEmpty()) {
            try {
                nextState = InterviewState.valueOf(blueprint.getSections().get(0));
            } catch (Exception e) {
                log.warn("Invalid first blueprint section state: {}. Defaulting to INTRODUCTION.", blueprint.getSections().get(0));
            }
        }
        log.info("[MOCK_INTERVIEW] [STATE_TRANSITION] Transitioning FSM: PREPARING -> {}", nextState);

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
                .conversationalStyle(style)
                .fsmState(nextState)
                .blueprint(blueprint)
                .currentAgentName("HR Recruiter")
                .build();

        // 3. Generate first question using generation engine and router
        String styleInstructions = getStyleInstructions(style);
        String companyStyle = getCompanyStyleInstructions(state.getCompany());
        String retrievedMemory = memoryRetrievalService.retrieveRelevantContext(user, state.getRole());
        String historyContext = interviewMemoryService.getPreviousHistoryContext(user) + "\n" + retrievedMemory;
        
        String firstQuestion = questionGenerationEngine.generateQuestion(state, styleInstructions, companyStyle, historyContext);

        InterviewQuestion firstQuestionEntity = InterviewQuestion.builder()
                .questionText(firstQuestion)
                .mockInterview(interview)
                .score(0)
                .build();
        interview.getQuestions().add(firstQuestionEntity);
        interview.setTranscript("Interviewer: " + firstQuestion + "\n\n");

        if (state.getFsmState() == InterviewState.SYSTEM_DESIGN) {
            try {
                systemDesignOrchestrationService.getOrGenerateScenarioText(
                        state, interview.getId(), firstQuestionEntity, historyContext);
            } catch (Exception e) {
                log.error("Failed to pre-generate system design scenario for first question (non-fatal)", e);
            }
        }

        interviewPersistenceService.saveInterviewState(interview, state);
        log.info("[MOCK_INTERVIEW] [QUESTION_SENT] Interview ID: {}, Question: {}", interview.getId(), firstQuestion);

        return AdaptiveStartResponseDto.builder()
                .interviewId(interview.getId())
                .firstQuestion(firstQuestion)
                .build();
    }

    @Override
    @Transactional
    public AdaptiveAnswerResponseDto processAdaptiveAnswer(AdaptiveAnswerRequestDto request) {
        log.info("[MOCK_INTERVIEW] [ORCHESTRATOR] Resuming session and processing answer for interview ID: {}", request.getInterviewId());
        MockInterview interview = mockInterviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            return AdaptiveAnswerResponseDto.builder()
                    .isFinished(true)
                    .nextQuestion("Interview is already completed.")
                    .build();
        }

        AdaptiveState state;
        try {
            state = objectMapper.readValue(interview.getCurrentStateJson(), AdaptiveState.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read serialized interview state", e);
        }

        // 1. Log [ANSWER_RECEIVED]
        int currentIndex = interview.getCurrentQuestionIndex();
        log.info("[MOCK_INTERVIEW] [ANSWER_RECEIVED] Interview ID: {}, State: {}, Index: {}, Answer: {}", 
                interview.getId(), state.getFsmState(), currentIndex, request.getAnswer());

        // 2. Persist answer to current question
        InterviewQuestion currentQ = null;
        if (interview.getQuestions() != null && currentIndex < interview.getQuestions().size()) {
            currentQ = interview.getQuestions().get(currentIndex);
        }

        if (currentQ != null) {
            currentQ.setAnswerText(request.getAnswer());
            currentQ.setThinkingTimeSeconds(request.getThinkingTimeSeconds() != null ? request.getThinkingTimeSeconds() : 0.0);
            currentQ.setTimeTakenSeconds(request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 0.0);
            if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                currentQ.setCodeText(request.getCode());
                currentQ.setLanguage(request.getLanguage());
                currentQ.setCompilerOutput(request.getTerminalOutput());
            }
            state.getPreviousQuestions().add(currentQ.getQuestionText());
            state.getPreviousAnswers().add(request.getAnswer());
        }

        String transcript = interview.getTranscript() != null ? interview.getTranscript() : "";
        transcript += "Candidate: " + request.getAnswer() + "\n\n";
        interview.setTranscript(transcript);

        int nextQuestionIndex = currentIndex + 1;
        interview.setCurrentQuestionIndex(nextQuestionIndex);

        // 3. FSM State Transition checks:
        InterviewState currentState = state.getFsmState();
        InterviewState nextState = decideNextFSMState(state, nextQuestionIndex);

        if (nextState != currentState) {
            log.info("[MOCK_INTERVIEW] [STATE_TRANSITION] FSM Transition: {} -> {}", currentState, nextState);
            state.setFsmState(nextState);
        }

        // 4. Delegate to Evaluation Engine
        String styleInstructions = getStyleInstructions(state.getConversationalStyle());
        String companyStyle = getCompanyStyleInstructions(state.getCompany());
        
        JsonNode evalJson = answerEvaluationEngine.evaluateAnswer(state, 
                currentQ != null ? currentQ.getQuestionText() : "", request, styleInstructions, companyStyle);

        int evaluatedScore = 70;
        if (evalJson != null) {
            try {
                state.setTechnicalScore(parseSafeInt(evalJson, "technicalScore", state.getTechnicalScore()));
                state.setCommunicationScore(parseSafeInt(evalJson, "communicationScore", state.getCommunicationScore()));
                state.setConfidenceScore(parseSafeInt(evalJson, "confidenceScore", state.getConfidenceScore()));
                state.setProblemSolvingScore(parseSafeInt(evalJson, "problemSolvingScore", state.getProblemSolvingScore()));
                state.setCodingScore(parseSafeInt(evalJson, "codingScore", state.getCodingScore()));
                state.setBehavioralScore(parseSafeInt(evalJson, "behavioralScore", state.getBehavioralScore()));
                state.setRoleReadiness(parseSafeInt(evalJson, "roleReadiness", state.getRoleReadiness()));

                evaluatedScore = parseSafeInt(evalJson, "evaluatedScore", 70);
                if (currentQ != null) {
                    currentQ.setScore(evaluatedScore);
                    if (evalJson.has("emotionAnalysis")) {
                        currentQ.setEmotionAnalysisJson(evalJson.get("emotionAnalysis").toString());
                    }
                }

                if (evalJson.has("resumeValidation") && evalJson.get("resumeValidation").isObject()) {
                    Iterator<Map.Entry<String, JsonNode>> fields = evalJson.get("resumeValidation").fields();
                    while (fields.hasNext()) {
                        var entry = fields.next();
                        state.getResumeClaimsConfidence().put(entry.getKey(), entry.getValue().asText());
                    }
                }

                if (evalJson.has("competencies") && evalJson.get("competencies").isArray()) {
                    List<InterviewFeedbackDto.CompetencyDto> list = new ArrayList<>();
                    for (JsonNode cNode : evalJson.get("competencies")) {
                        list.add(InterviewFeedbackDto.CompetencyDto.builder()
                                .category(parseSafeString(cNode, "category", "General"))
                                .competency(parseSafeString(cNode, "competency", "Core"))
                                .status(cNode.has("status") && cNode.get("status").asBoolean())
                                .build());
                    }
                    state.setCompetenciesChecked(list);
                }
            } catch (Exception e) {
                log.error("Failed to parse evaluation details in orchestrator", e);
            }
        } else {
            if (currentQ != null) currentQ.setScore(70);
        }
        log.info("[MOCK_INTERVIEW] [ANSWER_EVALUATED] Evaluated score: {} for turn {}", evaluatedScore, currentIndex);

        // 4.5 Trigger structured turn memory persistence
        knowledgePersistenceService.persistTurnMemory(interview.getUser(), interview.getId(), 
                currentQ != null ? currentQ.getQuestionText() : "", request.getAnswer(), evalJson);

        // 4.6 If CODING state and code was submitted, invoke coding orchestration pipeline
        if (state.getFsmState() == InterviewState.CODING
                && request.getCode() != null && !request.getCode().trim().isEmpty()) {
            try {
                codingInterviewOrchestrationService.processSubmission(
                        state, interview.getId(), currentQ,
                        request.getCode(), request.getLanguage(), request.getTerminalOutput());
                log.info("[MOCK_INTERVIEW] [CODING] Coding pipeline completed for interview: {}", interview.getId());
            } catch (Exception e) {
                log.error("[MOCK_INTERVIEW] [CODING] Coding pipeline failed (non-fatal): {}", e.getMessage());
            }
        }

        // 4.7 If SYSTEM_DESIGN state, invoke system design orchestration pipeline to evaluate the final diagram
        if (state.getFsmState() == InterviewState.SYSTEM_DESIGN) {
            try {
                var diagramOpt = diagramRepository.findByInterviewQuestion(currentQ);
                if (diagramOpt.isPresent()) {
                    var diagram = diagramOpt.get();
                    systemDesignOrchestrationService.submitDesign(
                            state, interview.getId(), currentQ,
                            diagram.getComponentsJson(), diagram.getConnectionsJson(), request.getAnswer());
                    log.info("[MOCK_INTERVIEW] [SYSTEM_DESIGN] System design evaluation completed for interview: {}", interview.getId());
                } else {
                    log.warn("[MOCK_INTERVIEW] [SYSTEM_DESIGN] No system design diagram found to evaluate for question ID: {}", currentQ != null ? currentQ.getId() : "null");
                }
            } catch (Exception e) {
                log.error("[MOCK_INTERVIEW] [SYSTEM_DESIGN] System design pipeline failed (non-fatal): {}", e.getMessage());
            }
        }

        // 5. Delegate to Adaptive Difficulty Engine
        adaptiveDifficultyEngine.adjustDifficulty(state, evaluatedScore);

        // 6. Check if FSM State is FINAL_REVIEW, REPORT_GENERATION or budget completed
        boolean shouldFinish = nextState == InterviewState.REPORT_GENERATION || 
                nextState == InterviewState.COMPLETED || 
                nextQuestionIndex >= state.getTotalQuestionsLimit();

        if (shouldFinish) {
            log.info("[MOCK_INTERVIEW] [STATE_TRANSITION] Transitioning FSM: {} -> REPORT_GENERATION", state.getFsmState());
            state.setFsmState(InterviewState.REPORT_GENERATION);
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());
            
            interviewPersistenceService.saveInterviewState(interview, state);
            interviewReportService.compileAndSaveReport(interview, state);
            
            log.info("[MOCK_INTERVIEW] [STATE_TRANSITION] Transitioning FSM: REPORT_GENERATION -> COMPLETED");
            state.setFsmState(InterviewState.COMPLETED);
            interviewPersistenceService.saveInterviewState(interview, state);

            return AdaptiveAnswerResponseDto.builder()
                    .isFinished(true)
                    .nextQuestion(null)
                    .build();
        }

        // 7. Route and prefix active persona name
        String nextPersona = personaRouter.routeToPersona(state.getFsmState(), state.getConversationalStyle());
        state.setCurrentAgentName(nextPersona.split(" ")[0].replace("[", "").replace("]", ""));

        // 8. Generate next question via Question Generation Engine
        String retrievedMemory = memoryRetrievalService.retrieveRelevantContext(interview.getUser(), state.getRole());
        String historyContext = interviewMemoryService.getPreviousHistoryContext(interview.getUser()) + "\n" + retrievedMemory;
        String nextQuestion = questionGenerationEngine.generateQuestion(state, styleInstructions, companyStyle, historyContext);

        // Add next question to persistence list
        InterviewQuestion nextQuestionEntity = InterviewQuestion.builder()
                .questionText(nextQuestion)
                .mockInterview(interview)
                .score(0)
                .build();
        interview.getQuestions().add(nextQuestionEntity);

        if (state.getFsmState() == InterviewState.SYSTEM_DESIGN) {
            try {
                systemDesignOrchestrationService.getOrGenerateScenarioText(
                        state, interview.getId(), nextQuestionEntity, historyContext);
            } catch (Exception e) {
                log.error("Failed to pre-generate system design scenario for next question (non-fatal)", e);
            }
        }

        transcript += "Interviewer: " + nextQuestion + "\n\n";
        interview.setTranscript(transcript);

        interviewPersistenceService.saveInterviewState(interview, state);
        log.info("[MOCK_INTERVIEW] [NEXT_QUESTION_CREATED] State: {}, Persona: {}, Question: {}", 
                state.getFsmState(), state.getCurrentAgentName(), nextQuestion);
        log.info("[MOCK_INTERVIEW] [QUESTION_SENT] Question: {}", nextQuestion);

        return AdaptiveAnswerResponseDto.builder()
                .isFinished(false)
                .nextQuestion(nextQuestion)
                .build();
    }

    private InterviewState decideNextFSMState(AdaptiveState state, int nextQuestionIndex) {
        if (state.getBlueprint() == null || state.getBlueprint().getSections() == null) {
            return state.getFsmState();
        }
        
        List<String> sections = state.getBlueprint().getSections();
        int totalQuestions = state.getTotalQuestionsLimit();
        if (nextQuestionIndex >= totalQuestions) {
            return InterviewState.REPORT_GENERATION;
        }

        // Divide target questions budget proportionally across FSM blueprint sections
        int questionsPerSection = Math.max(1, totalQuestions / sections.size());
        int sectionIndex = nextQuestionIndex / questionsPerSection;

        if (sectionIndex >= sections.size()) {
            return InterviewState.REPORT_GENERATION;
        }

        try {
            return InterviewState.valueOf(sections.get(sectionIndex).toUpperCase());
        } catch (Exception e) {
            log.warn("Failed to lookup blueprint section state on index {}, defaulting to CURRENT", sectionIndex);
            return state.getFsmState();
        }
    }

    private InterviewBlueprint generateBlueprint(MockInterviewRequestDto request, String resumeText) {
        String prompt = "You are an AI Interview Architect. Your task is to generate an Interview Blueprint.\n" +
                "Role: " + request.getRole() + "\n" +
                "Experience Level: " + request.getExperienceLevel() + "\n" +
                "Target Company: " + request.getCompany() + "\n" +
                "Interview Type: " + request.getInterviewType() + "\n" +
                "Topic Stack: " + request.getTopic() + "\n" +
                "Resume Text: " + resumeText + "\n\n" +
                "Define the target sections, target competencies to assess, question budget (between 5 and 10), and evaluation criteria.\n" +
                "Return ONLY a JSON blueprint matching this schema:\n" +
                "{\n" +
                "  \"role\": \"Software Engineer\",\n" +
                "  \"company\": \"Google\",\n" +
                "  \"durationMinutes\": 45,\n" +
                "  \"sections\": [\"INTRODUCTION\", \"TECHNICAL\", \"CODING\", \"BEHAVIORAL\"],\n" +
                "  \"targetCompetencies\": [\"Coding correctness\", \"Complexity analysis\", \"STAR Behavioral\"],\n" +
                "  \"questionBudget\": 7,\n" +
                "  \"evaluationRubric\": {\n" +
                "    \"Coding correctness\": \"Uses optimal syntax and runs successfully\",\n" +
                "    \"Complexity analysis\": \"Provides correct Big O complexity\"\n" +
                "  }\n" +
                "}";

        try {
            JsonNode response = aiClient.generateJson(
                    "You are an AI Interview Architect. Respond ONLY with valid JSON.",
                    prompt, 0.5, 2048, e -> { throw new RuntimeException(e); });
            if (response != null && response.has("sections")) {
                List<String> sections = new ArrayList<>();
                for (JsonNode s : response.get("sections")) {
                    sections.add(s.asText().toUpperCase());
                }
                List<String> comps = new ArrayList<>();
                for (JsonNode c : response.get("targetCompetencies")) {
                    comps.add(c.asText());
                }
                Map<String, String> rubric = new HashMap<>();
                if (response.has("evaluationRubric") && response.get("evaluationRubric").isObject()) {
                    var fields = response.get("evaluationRubric").fields();
                    while (fields.hasNext()) {
                        var next = fields.next();
                        rubric.put(next.getKey(), next.getValue().asText());
                    }
                }
                return InterviewBlueprint.builder()
                        .role(response.get("role").asText(request.getRole()))
                        .company(response.get("company").asText(request.getCompany() != null ? request.getCompany() : "General"))
                        .durationMinutes(response.get("durationMinutes").asInt(45))
                        .sections(sections)
                        .targetCompetencies(comps)
                        .questionBudget(response.get("questionBudget").asInt(7))
                        .evaluationRubric(rubric)
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to generate AI blueprint, loading fallback.", e);
        }

        List<String> defaultSections = Arrays.asList("INTRODUCTION", "TECHNICAL", "CODING", "BEHAVIORAL");
        if ("System Design".equalsIgnoreCase(request.getInterviewType())) {
            defaultSections = Arrays.asList("INTRODUCTION", "SYSTEM_DESIGN", "TECHNICAL");
        } else if ("Behavioral / HR".equalsIgnoreCase(request.getInterviewType())) {
            defaultSections = Arrays.asList("INTRODUCTION", "BEHAVIORAL", "HR");
        }

        return InterviewBlueprint.builder()
                .role(request.getRole())
                .company(request.getCompany() != null ? request.getCompany() : "General Tech Company")
                .durationMinutes(45)
                .sections(defaultSections)
                .targetCompetencies(Arrays.asList("Domain Knowledge", "Problem Solving", "Communication"))
                .questionBudget(5)
                .evaluationRubric(Map.of("Domain Knowledge", "Depth in primary domain", "Problem Solving", "Logical structuring"))
                .build();
    }

    private String getStyleInstructions(String style) {
        if ("Friendly".equalsIgnoreCase(style)) {
            return "Adopt a warm, encouraging, positive, and supportive tone.";
        } else if ("Strict".equalsIgnoreCase(style)) {
            return "Adopt a highly rigorous, challenging, and scrutinizing tone.";
        } else if ("Senior Engineer".equalsIgnoreCase(style)) {
            return "Adopt a deep technical pragmatist persona.";
        } else {
            return "Adopt a balanced, formal, objective, and professional recruiter tone.";
        }
    }

    private String getCompanyStyleInstructions(String company) {
        if (company == null) return "General Tech Company persona style.";
        if (company.equalsIgnoreCase("Google")) {
            return "Google style: Focus heavily on core computer science algorithms, memory constraints, optimization, scaling, and analytical accuracy.";
        } else if (company.equalsIgnoreCase("NVIDIA")) {
            return "NVIDIA style: Focus heavily on hardware design, parallel algorithms, execution speed, graphics pipelines, and C++ memory constraints.";
        } else if (company.equalsIgnoreCase("Microsoft")) {
            return "Microsoft style: Focus heavily on problem-solving, structural design, and robust coding principles.";
        }
        return "General Tech Company style: Focus on practical programming and design fundamentals.";
    }

    private int parseSafeInt(JsonNode node, String field, int fallback) {
        if (node == null || !node.has(field)) return fallback;
        return node.get(field).asInt(fallback);
    }

    private String parseSafeString(JsonNode node, String field, String fallback) {
        if (node == null || !node.has(field)) return fallback;
        return node.get(field).asText(fallback);
    }
}
