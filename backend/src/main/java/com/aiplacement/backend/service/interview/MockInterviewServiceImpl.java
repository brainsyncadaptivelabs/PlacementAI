package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewFeedback;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import com.aiplacement.backend.entity.interview.InterviewStatus;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockInterviewServiceImpl implements MockInterviewService {

    private final OllamaClient ollamaClient;
    private final MockInterviewRepository mockInterviewRepository;
    private final UserRepository userRepository;
    private final org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${elevenlabs.api.key:dummy}")
    private String elevenlabsApiKey;

    @Value("${elevenlabs.voice.id:21m00Tcm4TlvDq8ikWAM}")
    private String elevenlabsVoiceId;

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class AdaptiveState {
        private String role;
        private String experienceLevel;
        private String company;
        private String difficulty;
        private String interviewType;
        private String resumeText;
        private String jobDescription;
        @lombok.Builder.Default
        private List<String> topicsCovered = new java.util.ArrayList<>();
        @lombok.Builder.Default
        private List<String> remainingObjectives = new java.util.ArrayList<>();
        @lombok.Builder.Default
        private List<String> previousQuestions = new java.util.ArrayList<>();
        @lombok.Builder.Default
        private List<String> previousAnswers = new java.util.ArrayList<>();
        
        // Running Scores (0-100)
        @lombok.Builder.Default
        private int technicalScore = 70;
        @lombok.Builder.Default
        private int communicationScore = 70;
        @lombok.Builder.Default
        private int confidenceScore = 70;
        @lombok.Builder.Default
        private int problemSolvingScore = 70;
        @lombok.Builder.Default
        private int codingScore = 70;
        @lombok.Builder.Default
        private int behavioralScore = 70;
        @lombok.Builder.Default
        private int roleReadiness = 70;
        
        @lombok.Builder.Default
        private int totalQuestionsLimit = 10;
        @lombok.Builder.Default
        private String currentDifficulty = "Medium";
        @lombok.Builder.Default
        private boolean isCodingRound = false;
        @lombok.Builder.Default
        private String conversationalStyle = "Professional";
        @lombok.Builder.Default
        private List<InterviewFeedbackDto.CompetencyDto> competenciesChecked = new java.util.ArrayList<>();
    }


    @Override
    public MockInterviewResponseDto generateMockInterview(MockInterviewRequestDto request) {
        log.info("Generating mock interview questions.");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String type = request.getInterviewType() != null ? request.getInterviewType() : "Technical";
        String topics = request.getTopic() != null ? request.getTopic() : "";
        String role = request.getRole();
        String level = request.getExperienceLevel();
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "Medium";
        String targetCompany = request.getCompany() != null ? request.getCompany() : "General Tech Company";

        StringBuilder guidelines = new StringBuilder();
        if ("Technical Coding".equals(type) || "Data Structures & Algorithms".equals(type) || "DSA Coding".equals(type)) {
            guidelines.append("- Provide coding problems with clear problem statements\n")
                    .append("- Focus on ").append(topics).append(" concepts\n")
                    .append("- Include questions on time and space complexity analysis\n")
                    .append("- Cover arrays, strings, trees, graphs, dynamic programming, etc.\n")
                    .append("- Range from easy to hard based on the ").append(level).append(" level\n")
                    .append("- Ask candidates to explain their approach verbally (this is a voice interview)\n")
                    .append("- Example: \"How would you find the longest substring without repeating characters? Please explain your approach and discuss the time complexity.\"\n");
        } else if ("System Design".equals(type)) {
            guidelines.append("- Provide system design scenarios (e.g., design a URL shortener, design Twitter, design a parking lot)\n")
                    .append("- Focus on scalability, reliability, and trade-offs\n")
                    .append("- Include questions on databases, caching, load balancing, microservices\n")
                    .append("- Ask about handling high traffic and data consistency\n")
                    .append("- Appropriate for ").append(level).append(" level\n")
                    .append("- Example: \"Design a scalable notification system that can handle millions of users. Discuss your architecture choices.\"\n");
        } else if ("Technical HR".equals(type)) {
            guidelines.append("- Mix of behavioral and technical background questions\n")
                    .append("- Ask about past projects and technical challenges\n")
                    .append("- Questions about teamwork in technical settings\n")
                    .append("- Problem-solving approach and learning mindset\n")
                    .append("- Example: \"Tell me about a challenging bug you fixed. How did you approach debugging it?\"\n");
        } else if ("Case Study".equals(type) || "Case".equals(type)) {
            guidelines.append("- Provide a short business scenario, market sizing, or profitability framework question\n")
                    .append("- Appropriate for MBA/business candidates\n");
        } else if ("Technical Finance".equals(type)) {
            guidelines.append("- Provide rigorous questions on valuation (DCF, LBO, Multiples), accounting (3 statements), or M&A\n")
                    .append("- Appropriate for MBA Finance candidates\n");
        } else if ("Operations".equals(type)) {
            guidelines.append("- Focus on process optimization, bottleneck analysis, supply chain resilience, or Little's Law\n")
                    .append("- Appropriate for MBA Operations candidates\n");
        } else if ("Behavioral".equals(type) || "Behavioral / HR".equals(type) || "HR".equals(type)) {
            guidelines.append("- Provide STAR method based questions focusing on leadership and conflict resolution\n")
                    .append("- Appropriate for all candidates\n");
        } else if ("Embedded Systems".equals(type)) {
            guidelines.append("- Provide embedded systems questions focusing on microcontrollers, RTOS, hardware interfaces, and IoT systems\n")
                    .append("- Focus on ").append(topics).append(" concepts\n");
        } else if ("VLSI Design".equals(type)) {
            guidelines.append("- Provide VLSI design questions focusing on digital design, Verilog, FPGA, and integrated circuit concepts\n")
                    .append("- Focus on ").append(topics).append(" concepts\n");
        } else if ("Architecture".equals(type)) {
            guidelines.append("- Provide architecture questions focusing on architectural design, AutoCAD, BIM, and sustainable design principles\n")
                    .append("- Focus on ").append(topics).append(" concepts\n");
        } else {
            guidelines.append("- Create relevant questions based on the role and focus areas: ").append(topics).append("\n")
                    .append("- Ensure questions are appropriate for the ").append(level).append(" level\n");
        }

        String prompt = "Generate a mock interview questions response in JSON format. The response must match this schema:\n" +
                "{\n" +
                "  \"role\": \"" + role + "\",\n" +
                "  \"questions\": [\"Question 1\", \"Question 2\", \"Question 3\", \"Question 4\", \"Question 5\"],\n" +
                "  \"tips\": [\"Tip 1\", \"Tip 2\"]\n" +
                "}\n" +
                "\n" +
                "Target Parameters:\n" +
                "- Role: " + role + "\n" +
                "- Experience Level: " + level + "\n" +
                "- Difficulty Level: " + difficulty + "\n" +
                "- Target Company: " + targetCompany + "\n" +
                "- Interview Type/Module: " + type + "\n" +
                (topics.isEmpty() ? "" : "- Focus Areas / Tech Stack: " + topics + "\n") +
                (request.getResumeText() != null ? "- Match Resume Credentials: " + truncate(request.getResumeText(), 500) + "\n" : "") +
                (request.getJobDescription() != null ? "- Match Job Description Requirements: " + truncate(request.getJobDescription(), 500) + "\n" : "") +
                "\n" +
                "Guidelines based on interview type:\n" +
                guidelines.toString() + "\n" +
                "The questions are going to be read by a voice assistant so do not use \"/\" or \"*\" or any other special characters which might break the voice assistant.\n" +
                "Return the questions array as plain strings.";

        JsonNode aiJson = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                log.info("Sending mock interview generate request to Ollama, attempt: {}", attempt);
                aiJson = ollamaClient.getJsonResponse(prompt, 0.7, e -> {
                    throw new RuntimeException("Ollama generate failed", e);
                });
                if (aiJson != null && aiJson.has("questions")) {
                    break;
                }
            } catch (Exception e) {
                log.error("Ollama generate failed on attempt {}: {}", attempt, e.getMessage());
            }
        }

        // Custom Fallback questions generator (Phase 3 requirement)
        if (aiJson == null) {
            log.warn("Ollama unavailable or failed. Loading predefined fallback questions.");
            List<String> questions = getPredefinedQuestions(request);
            List<String> tips = Arrays.asList("Explain your thought process aloud.", "Structure technical answers using structural examples.");
            return MockInterviewResponseDto.builder()
                    .role(request.getRole())
                    .questions(questions)
                    .tips(tips)
                    .build();
        }

        try {
            List<String> questions = parseSafeStringList(aiJson, "questions");
            List<String> tips = parseSafeStringList(aiJson, "tips");
            if (questions.isEmpty()) {
                questions = getPredefinedQuestions(request);
            }

            return MockInterviewResponseDto.builder()
                    .role(aiJson.has("role") ? aiJson.get("role").asText() : request.getRole())
                    .questions(questions)
                    .tips(tips)
                    .build();
        } catch (Exception e) {
            log.error("Failed to map AI generated questions, using fallback", e);
            return MockInterviewResponseDto.builder()
                    .role(request.getRole())
                    .questions(getPredefinedQuestions(request))
                    .tips(Arrays.asList("Focus on fundamental concepts.", "State your solution clearly."))
                    .build();
        }
    }

    @Override
    @Transactional
    public AdaptiveStartResponseDto startAdaptiveInterview(MockInterviewRequestDto request) {
        log.info("Starting adaptive mock interview for role: {}", request.getRole());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String style = request.getConversationalStyle() != null ? request.getConversationalStyle() : "Professional";
        String styleInstructions = "";
        if ("Friendly".equalsIgnoreCase(style)) {
            styleInstructions = "Adopt a warm, encouraging, positive, and supportive tone. Acknowledge candidate's efforts and greet them enthusiastically.";
        } else if ("Strict".equalsIgnoreCase(style)) {
            styleInstructions = "Adopt a highly rigorous, challenging, and scrutinizing tone. Be polite but demanding, focusing on assessing gaps and probing limitations.";
        } else if ("Senior Engineer".equalsIgnoreCase(style)) {
            styleInstructions = "Adopt a deep technical pragmatist persona. Focus on architecture, trade-offs, scaling, performance details, and real-world system optimization.";
        } else {
            styleInstructions = "Adopt a balanced, formal, objective, and professional recruiter tone. Keep a steady and professional dialogue flow.";
        }

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
        
        List<String> topicsLeft = new ArrayList<>();
        if (request.getTopic() != null && !request.getTopic().isEmpty()) {
            topicsLeft.addAll(Arrays.asList(request.getTopic().split(",")));
        } else {
            topicsLeft.addAll(Arrays.asList("Introduction", "Technical Depth", "Problem Solving", "Cultural Fit"));
        }

        AdaptiveState state = AdaptiveState.builder()
                .role(request.getRole())
                .experienceLevel(request.getExperienceLevel())
                .company(request.getCompany() != null ? request.getCompany() : "General Tech Company")
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "Medium")
                .interviewType(request.getInterviewType() != null ? request.getInterviewType() : "Technical")
                .resumeText(request.getResumeText())
                .jobDescription(request.getJobDescription())
                .topicsCovered(new ArrayList<>())
                .remainingObjectives(topicsLeft)
                .previousQuestions(new ArrayList<>())
                .previousAnswers(new ArrayList<>())
                .technicalScore(70)
                .communicationScore(70)
                .confidenceScore(70)
                .problemSolvingScore(70)
                .codingScore(70)
                .behavioralScore(70)
                .roleReadiness(70)
                .totalQuestionsLimit(10)
                .currentDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "Medium")
                .isCodingRound("Technical Coding".equals(request.getInterviewType()) || "DSA Coding".equals(request.getInterviewType()) || "Data Structures & Algorithms".equals(request.getInterviewType()))
                .conversationalStyle(style)
                .build();

        String prompt = "You are an AI interviewer conducting an adaptive mock interview.\n" +
                "Role: " + state.getRole() + "\n" +
                "Experience Level: " + state.getExperienceLevel() + "\n" +
                "Target Company: " + state.getCompany() + "\n" +
                "Interview Type: " + state.getInterviewType() + "\n" +
                "Interviewer Tone / Persona Style: " + style + ". Guidelines: " + styleInstructions + "\n" +
                "Company Specific Persona: " + getCompanyStyleInstructions(state.getCompany()) + "\n" +
                (state.getResumeText() != null ? "Resume Summary: " + truncate(state.getResumeText(), 2000) + "\n" : "") +
                (state.getJobDescription() != null ? "Job Description: " + truncate(state.getJobDescription(), 2000) + "\n" : "") +
                "\n" +
                "Generate the very first tailored introductory question for this candidate. " +
                "Adopt the specified Interviewer Style and Company Specific Persona. Avoid a generic 'Tell me about yourself'. Instead, check their resume or the job description requirements " +
                "and ask a tailored question about a project, a technology, or their background in relation to the role.\n" +
                "Return ONLY a JSON object: {\"nextQuestion\": \"...\"}";

        String firstQuestion = "Tell me about yourself and your background with " + request.getRole() + ".";
        try {
            JsonNode response = ollamaClient.getJsonResponse(prompt, 0.7, e -> { throw new RuntimeException(e); });
            if (response != null && response.has("nextQuestion")) {
                firstQuestion = response.get("nextQuestion").asText();
            }
        } catch (Exception e) {
            log.error("Failed to generate first adaptive question, using fallback.", e);
        }

        InterviewQuestion firstQuestionEntity = InterviewQuestion.builder()
                .questionText(firstQuestion)
                .mockInterview(interview)
                .score(0)
                .build();
        interview.getQuestions().add(firstQuestionEntity);
        interview.setTranscript("Interviewer: " + firstQuestion + "\n\n");

        try {
            interview.setCurrentStateJson(objectMapper.writeValueAsString(state));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize initial state", e);
            interview.setCurrentStateJson("{}");
        }

        mockInterviewRepository.save(interview);

        return AdaptiveStartResponseDto.builder()
                .interviewId(interview.getId())
                .firstQuestion(firstQuestion)
                .build();
    }

    @Override
    @Transactional
    public AdaptiveAnswerResponseDto processAdaptiveAnswer(AdaptiveAnswerRequestDto request) {
        log.info("Processing adaptive answer for interview id: {}", request.getInterviewId());
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
            state = new AdaptiveState();
            state.setRole(interview.getRole());
            state.setExperienceLevel(interview.getExperienceLevel());
            state.setCompany(interview.getCompany());
            state.setDifficulty("Medium");
            state.setInterviewType(interview.getTopic());
        }

        // Find the current question being answered
        int currentIndex = interview.getCurrentQuestionIndex();
        InterviewQuestion currentQ = null;
        if (interview.getQuestions() != null && currentIndex < interview.getQuestions().size()) {
            currentQ = interview.getQuestions().get(currentIndex);
        }

        if (currentQ != null) {
            currentQ.setAnswerText(request.getAnswer());
            if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                currentQ.setCodeText(request.getCode());
                currentQ.setLanguage(request.getLanguage());
                currentQ.setCompilerOutput(request.getTerminalOutput());
            }
        }

        // Update transcript
        String transcript = interview.getTranscript() != null ? interview.getTranscript() : "";
        transcript += "Candidate: " + request.getAnswer() + "\n";
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            transcript += "[Code submitted: Language=" + request.getLanguage() + "]\n" + request.getCode() + "\n";
            if (request.getTerminalOutput() != null && !request.getTerminalOutput().trim().isEmpty()) {
                transcript += "[Execution Output]\n" + request.getTerminalOutput() + "\n";
            }
        }
        transcript += "\n";
        interview.setTranscript(transcript);

        if (currentQ != null) {
            state.getPreviousQuestions().add(currentQ.getQuestionText());
            state.getPreviousAnswers().add(request.getAnswer());
        }

        int nextQuestionIndex = currentIndex + 1;
        interview.setCurrentQuestionIndex(nextQuestionIndex);

        // Call AI to evaluate current answer and generate next question
        StringBuilder historyBuilder = new StringBuilder();
        for (int i = 0; i < state.getPreviousQuestions().size(); i++) {
            historyBuilder.append("Q: ").append(state.getPreviousQuestions().get(i)).append("\n");
            historyBuilder.append("A: ").append(state.getPreviousAnswers().get(i)).append("\n\n");
        }

        String style = state.getConversationalStyle() != null ? state.getConversationalStyle() : "Professional";
        String styleInstructions = "";
        if ("Friendly".equalsIgnoreCase(style)) {
            styleInstructions = "Adopt a warm, encouraging, positive, and supportive tone. Acknowledge the candidate's answer with enthusiasm and encouragement (e.g., 'Take your time', 'That's a really great explanation!'). Avoid harsh criticisms.";
        } else if ("Strict".equalsIgnoreCase(style)) {
            styleInstructions = "Adopt a highly rigorous, challenging, and scrutinizing tone. Acknowledge answer briefly but politely challenge weak answers or assumptions (e.g., 'I don't completely agree. Can you defend your approach?', 'Can you justify that decision?'). Focus on identifying gaps.";
        } else if ("Senior Engineer".equalsIgnoreCase(style)) {
            styleInstructions = "Adopt a deep technical pragmatist/manager persona. Focus heavily on architecture, engineering trade-offs, scaling, and real-world system optimization. Challenge shallow answers and probe design decisions (e.g., 'Let's dig deeper', 'I'm curious about how that would scale').";
        } else {
            styleInstructions = "Adopt a balanced, formal, objective, and professional recruiter tone. Use polite recruiter validations and transitions (e.g., 'Interesting', 'That's a good point', 'Let's move to another topic').";
        }

        StringBuilder competenciesBuilder = new StringBuilder();
        if (state.getCompetenciesChecked() != null && !state.getCompetenciesChecked().isEmpty()) {
            competenciesBuilder.append("Current Competency Assessment Status:\n");
            for (InterviewFeedbackDto.CompetencyDto comp : state.getCompetenciesChecked()) {
                competenciesBuilder.append("- Category: ").append(comp.getCategory())
                                   .append(", Competency: ").append(comp.getCompetency())
                                   .append(", Covered: ").append(comp.isStatus() ? "Yes" : "No").append("\n");
            }
        } else {
            competenciesBuilder.append("No competencies have been evaluated yet. Please establish the initial key competencies list matching the role/JD requirements.\n");
        }

        String prompt = "You are an AI interviewer conducting an adaptive mock interview.\n" +
                "Role: " + state.getRole() + "\n" +
                "Experience Level: " + state.getExperienceLevel() + "\n" +
                "Target Company: " + state.getCompany() + "\n" +
                "Interview Type: " + state.getInterviewType() + "\n" +
                "Current Difficulty: " + state.getCurrentDifficulty() + "\n" +
                "Interviewer Tone / Persona Style: " + style + ". Guidelines: " + styleInstructions + "\n" +
                "Company Specific Persona: " + getCompanyStyleInstructions(state.getCompany()) + "\n\n" +
                (state.getResumeText() != null ? "Candidate Resume:\n" + truncate(state.getResumeText(), 2000) + "\n\n" : "") +
                (state.getJobDescription() != null ? "Target Job Description:\n" + truncate(state.getJobDescription(), 2000) + "\n\n" : "") +
                competenciesBuilder.toString() + "\n" +
                "Conversation History:\n" + historyBuilder.toString() +
                "Latest Turn details:\n" +
                "- Question: " + (currentQ != null ? currentQ.getQuestionText() : "") + "\n" +
                "- Candidate Answer: " + request.getAnswer() + "\n" +
                (request.getCode() != null && !request.getCode().trim().isEmpty() ? 
                    "- Coding Lang: " + request.getLanguage() + "\n- Candidate Code:\n" + request.getCode() + "\n- Compiler Output: " + request.getTerminalOutput() + "\n" : "") +
                "\n" +
                "Evaluate the latest answer. Calculate the updated running scores on a scale of 0 to 100 based on their performance.\n" +
                "If they did well, increase difficulty (e.g. from Easy to Medium, Medium to Hard, Hard to Expert). If they struggled, decrease difficulty.\n" +
                "Check if they introduced any interesting topics in their answer (e.g. they mentioned using Redis, or a specific design pattern) and branch into that topic to explore. Else, target a key requirement from the Resume/Job Description.\n\n" +
                "CRITICAL 1 (Competency-Based Engine): Review the competencies evaluated so far. You must identify what core competencies are still missing/failed (status: No) and choose the next question specifically to probe one of those missing competencies. Only set `isFinished` to true once you have evaluated all critical competencies (minimum 5 questions, max 10).\n\n" +
                "CRITICAL 2: Adopt the specified Interviewer Style. Your nextQuestion MUST begin with a natural conversational transition (e.g., 'Interesting.', 'That's a good point.', 'Can you explain that further?', 'Let's dig deeper.', 'I'm curious about something you mentioned.', 'Can you justify that decision?', 'I don't completely agree. Can you defend your approach?', 'Take your time.', 'Let's move to another topic.'). Acknowledge good answers, challenge weak assumptions or gaps, ask clarification questions, and keep the dialog organic and human-like. Avoid robotic, repetitive, or chatbot-like templates (e.g., do not say 'Moving on to next question...').\n\n" +
                "CRITICAL 3 (Technical Answer Verification): You must verify the technical correctness of the candidate's answers. Scan for incorrect statements (e.g. asserting HashMap is thread safe), software engineering hallucinations, erroneous code explanations, and incorrect complexity analysis. If you detect any false claim, weak assumption, or factually incorrect assertion, you MUST immediately challenge it in your generated `nextQuestion` (e.g. ask: 'Can you explain why you say HashMap is thread-safe? How does it differ from ConcurrentHashMap?'). Do not let technical inaccuracies pass unchallenged.\n" +
                "Ensure you never ask duplicate or very similar questions.\n\n" +
                "Return ONLY a JSON object with this exact schema:\n" +
                "{\n" +
                "  \"technicalScore\": 80,\n" +
                "  \"communicationScore\": 75,\n" +
                "  \"confidenceScore\": 80,\n" +
                "  \"problemSolvingScore\": 80,\n" +
                "  \"codingScore\": 80,\n" +
                "  \"behavioralScore\": 80,\n" +
                "  \"roleReadiness\": 80,\n" +
                "  \"evaluatedScore\": 85,\n" +
                "  \"topicCovered\": \"Java Collections\",\n" +
                "  \"difficultyProgression\": \"Hard\",\n" +
                "  \"isFinished\": false,\n" +
                "  \"nextQuestion\": \"Your next question here\",\n" +
                "  \"competencies\": [\n" +
                "    { \"category\": \"Java\", \"competency\": \"OOP\", \"status\": true },\n" +
                "    { \"category\": \"Java\", \"competency\": \"Collections\", \"status\": true },\n" +
                "    { \"category\": \"Java\", \"competency\": \"JVM\", \"status\": false }\n" +
                "  ]\n" +
                "}";

        JsonNode aiJson = null;
        try {
            aiJson = ollamaClient.getJsonResponse(prompt, 0.6, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.error("Failed to generate next question/evaluation from Ollama", e);
        }

        boolean isFinished = nextQuestionIndex >= state.getTotalQuestionsLimit();
        String nextQuestion = "Could you tell me more about your technical experience?";

        if (aiJson != null) {
            try {
                state.setTechnicalScore(parseSafeInt(aiJson, "technicalScore", state.getTechnicalScore()));
                state.setCommunicationScore(parseSafeInt(aiJson, "communicationScore", state.getCommunicationScore()));
                state.setConfidenceScore(parseSafeInt(aiJson, "confidenceScore", state.getConfidenceScore()));
                state.setProblemSolvingScore(parseSafeInt(aiJson, "problemSolvingScore", state.getProblemSolvingScore()));
                state.setCodingScore(parseSafeInt(aiJson, "codingScore", state.getCodingScore()));
                state.setBehavioralScore(parseSafeInt(aiJson, "behavioralScore", state.getBehavioralScore()));
                state.setRoleReadiness(parseSafeInt(aiJson, "roleReadiness", state.getRoleReadiness()));
                state.setCurrentDifficulty(parseSafeString(aiJson, "difficultyProgression", state.getCurrentDifficulty()));

                int evaluatedScore = parseSafeInt(aiJson, "evaluatedScore", 70);
                if (currentQ != null) {
                    currentQ.setScore(evaluatedScore);
                }

                String topicCovered = parseSafeString(aiJson, "topicCovered", "");
                if (!topicCovered.isEmpty()) {
                    state.getTopicsCovered().add(topicCovered);
                }

                if (aiJson.has("competencies") && aiJson.get("competencies").isArray()) {
                    List<InterviewFeedbackDto.CompetencyDto> list = new ArrayList<>();
                    for (JsonNode cNode : aiJson.get("competencies")) {
                        String category = parseSafeString(cNode, "category", "General");
                        String competencyName = parseSafeString(cNode, "competency", "Core");
                        boolean status = cNode.has("status") && cNode.get("status").asBoolean();
                        list.add(InterviewFeedbackDto.CompetencyDto.builder()
                                .category(category)
                                .competency(competencyName)
                                .status(status)
                                .build());
                    }
                    state.setCompetenciesChecked(list);
                }

                isFinished = aiJson.has("isFinished") ? aiJson.get("isFinished").asBoolean() : isFinished;
                if (nextQuestionIndex < 5) {
                    isFinished = false; // Force at least 5 questions
                }
                if (aiJson.has("nextQuestion") && !aiJson.get("nextQuestion").isNull()) {
                    nextQuestion = aiJson.get("nextQuestion").asText();
                }
            } catch (Exception e) {
                log.error("Error parsing AI evaluation JSON", e);
            }
        } else {
            // Heuristic fallback turn
            if (currentQ != null) {
                currentQ.setScore(70);
            }
            List<String> fallbacks = getPredefinedQuestions(MockInterviewRequestDto.builder()
                    .role(state.getRole())
                    .experienceLevel(state.getExperienceLevel())
                    .company(state.getCompany())
                    .difficulty(state.getCurrentDifficulty())
                    .interviewType(state.getInterviewType())
                    .jobDescription(state.getJobDescription())
                    .resumeText(state.getResumeText())
                    .conversationalStyle(state.getConversationalStyle())
                    .build());
            if (nextQuestionIndex < fallbacks.size()) {
                nextQuestion = fallbacks.get(nextQuestionIndex);
            }
        }

        if (isFinished) {
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());
            try {
                interview.setCurrentStateJson(objectMapper.writeValueAsString(state));
            } catch (Exception e) {
                log.error("Failed to serialize state", e);
            }
            mockInterviewRepository.save(interview);
            return AdaptiveAnswerResponseDto.builder()
                    .isFinished(true)
                    .nextQuestion(null)
                    .build();
        }

        // Add next question to database
        InterviewQuestion nextQ = InterviewQuestion.builder()
                .questionText(nextQuestion)
                .mockInterview(interview)
                .score(0)
                .build();
        interview.getQuestions().add(nextQ);

        transcript += "Interviewer: " + nextQuestion + "\n\n";
        interview.setTranscript(transcript);

        try {
            interview.setCurrentStateJson(objectMapper.writeValueAsString(state));
        } catch (Exception e) {
            log.error("Failed to serialize state", e);
        }

        mockInterviewRepository.save(interview);

        return AdaptiveAnswerResponseDto.builder()
                .isFinished(false)
                .nextQuestion(nextQuestion)
                .build();
    }

    @Override
    @Transactional
    public MockInterviewDto saveInterviewResults(MockInterviewDto interviewDto) {
        log.info("Saving mock interview session results. ID: {}", interviewDto.getId());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MockInterview interview;
        if (interviewDto.getId() != null) {
            interview = mockInterviewRepository.findById(interviewDto.getId())
                    .orElseThrow(() -> new RuntimeException("Interview not found"));
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());
            if (interviewDto.getTranscript() != null) {
                interview.setTranscript(interviewDto.getTranscript());
            }
        } else {
            interview = MockInterview.builder()
                    .role(interviewDto.getRole())
                    .experienceLevel(interviewDto.getExperienceLevel())
                    .company(interviewDto.getCompany())
                    .topic(interviewDto.getTopic())
                    .conversationalStyle(interviewDto.getConversationalStyle())
                    .transcript(interviewDto.getTranscript())
                    .user(user)
                    .status(InterviewStatus.COMPLETED)
                    .completedAt(LocalDateTime.now())
                    .build();
        }

        if (interviewDto.getQuestions() != null) {
            if (interview.getQuestions() == null) {
                interview.setQuestions(new ArrayList<>());
            }
            for (int i = 0; i < interviewDto.getQuestions().size(); i++) {
                InterviewQuestionDto qDto = interviewDto.getQuestions().get(i);
                if (i < interview.getQuestions().size()) {
                    InterviewQuestion existingQ = interview.getQuestions().get(i);
                    existingQ.setAnswerText(qDto.getAnswerText());
                    if (qDto.getScore() != null && qDto.getScore() > 0) {
                        existingQ.setScore(qDto.getScore());
                    }
                    if (qDto.getCodeText() != null) {
                        existingQ.setCodeText(qDto.getCodeText());
                        existingQ.setLanguage(qDto.getLanguage());
                        existingQ.setCompilerOutput(qDto.getCompilerOutput());
                    }
                } else {
                    InterviewQuestion newQ = InterviewQuestion.builder()
                            .questionText(qDto.getQuestionText())
                            .answerText(qDto.getAnswerText())
                            .score(qDto.getScore() != null ? qDto.getScore() : 0)
                            .codeText(qDto.getCodeText())
                            .language(qDto.getLanguage())
                            .compilerOutput(qDto.getCompilerOutput())
                            .mockInterview(interview)
                            .build();
                    interview.getQuestions().add(newQ);
                }
            }
        }

        AdaptiveState state = null;
        if (interview.getCurrentStateJson() != null && !interview.getCurrentStateJson().isEmpty()) {
            try {
                state = objectMapper.readValue(interview.getCurrentStateJson(), AdaptiveState.class);
            } catch (Exception e) {
                log.error("Failed to parse adaptive state in saveResults", e);
            }
        }

        // Generate Feedback using AI
        String feedbackPrompt = "You are an AI interviewer analyzing a mock interview transcript. Your task is to evaluate the candidate thoroughly. Be detailed and constructive. Do not be overly lenient; point out mistakes or areas for improvement.\n\n" +
                "Evaluate the transcript and return ONLY a JSON feedback report matching this schema:\n" +
                "{\n" +
                "  \"totalScore\": 80,\n" +
                "  \"technicalScore\": 85,\n" +
                "  \"communicationScore\": 75,\n" +
                "  \"confidenceScore\": 80,\n" +
                "  \"problemSolvingScore\": 80,\n" +
                "  \"codingScore\": 85,\n" +
                "  \"behavioralScore\": 80,\n" +
                "  \"roleReadiness\": 80,\n" +
                "  \"finalAssessment\": \"Detailed breakdown assessment covering Communication Skills, Domain Knowledge, Analytical Thinking, Cultural & Role Fit, and Confidence and Clarity. Discuss each area clearly.\",\n" +
                "  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n" +
                "  \"areasForImprovement\": [\"Area 1\", \"Area 2\"],\n" +
                "  \"bodyLanguageTips\": [\"Tip 1\"],\n" +
                "  \"missedTopics\": [\"Topic 1\"],\n" +
                "  \"recommendedResources\": [\"Resource 1\"],\n" +
                "  \"improvementPlan\": [\"Step 1\"],\n" +
                "  \"companyReadiness\": 75,\n" +
                "  \"hiringProbability\": 70,\n" +
                "  \"expectedSalary\": \"7.5 - 10.0 LPA\",\n" +
                "  \"recruiterVerdict\": \"Strong Candidate\",\n" +
                "  \"finalRecommendation\": \"Recommendation text\",\n" +
                "  \"candidateSummary\": \"A summary of the candidate's background and performance.\",\n" +
                "  \"technicalAbilityComment\": \"Detailed comment on technical ability.\",\n" +
                "  \"communicationComment\": \"Detailed comment on communication.\",\n" +
                "  \"leadershipComment\": \"Detailed comment on leadership alignment.\",\n" +
                "  \"problemSolvingComment\": \"Detailed comment on problem solving.\",\n" +
                "  \"cultureFitComment\": \"Detailed comment on culture fit.\",\n" +
                "  \"teamFitComment\": \"Detailed comment on team fit.\",\n" +
                "  \"riskAssessment\": \"Detailed comment on hiring risks.\",\n" +
                "  \"recruiterNotes\": \"Additional recruiter notes/observations.\",\n" +
                "  \"interviewConfidence\": 85,\n" +
                "  \"questionComments\": [\"Feedback comment for Question 1\", \"Feedback comment for Question 2\"]\n" +
                "}\n\n" +
                "Interview Role: " + interview.getRole() + "\n" +
                "Experience Level: " + interview.getExperienceLevel() + "\n" +
                "Company: " + interview.getCompany() + "\n" +
                "Topic/Type: " + interview.getTopic() + "\n" +
                (state != null ? "Baseline Scores from session: " +
                        "Technical: " + state.getTechnicalScore() + ", " +
                        "Communication: " + state.getCommunicationScore() + ", " +
                        "Confidence: " + state.getConfidenceScore() + ", " +
                        "Problem Solving: " + state.getProblemSolvingScore() + ", " +
                        "Coding: " + state.getCodingScore() + ", " +
                        "Behavioral: " + state.getBehavioralScore() + ", " +
                        "Role Readiness: " + state.getRoleReadiness() + ".\n" : "") +
                "Transcript:\n" + truncate(interview.getTranscript(), 2500);

        JsonNode feedbackJson = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                log.info("Sending mock interview feedback request to Ollama, attempt: {}", attempt);
                feedbackJson = ollamaClient.getJsonResponse(feedbackPrompt, 0.5, e -> {
                    throw new RuntimeException("Ollama feedback failed", e);
                });
                if (feedbackJson != null && feedbackJson.has("totalScore")) {
                    break;
                }
            } catch (Exception e) {
                log.error("Ollama feedback analysis failed on attempt {}: {}", attempt, e.getMessage());
            }
        }

        if (feedbackJson == null) {
            log.warn("Ollama feedback unavailable. Loading heuristic fallback feedback.");
            feedbackJson = getFallbackEvaluation(interview);
        }

        try {
            int totalScore = parseSafeInt(feedbackJson, "totalScore", 70);
            int technicalScore = parseSafeInt(feedbackJson, "technicalScore", totalScore);
            int communicationScore = parseSafeInt(feedbackJson, "communicationScore", totalScore);
            int confidenceScore = parseSafeInt(feedbackJson, "confidenceScore", totalScore);
            int problemSolvingScore = parseSafeInt(feedbackJson, "problemSolvingScore", totalScore);
            int codingScore = parseSafeInt(feedbackJson, "codingScore", totalScore);
            int behavioralScore = parseSafeInt(feedbackJson, "behavioralScore", totalScore);
            int roleReadiness = parseSafeInt(feedbackJson, "roleReadiness", totalScore);
            
            String finalAssessment = parseSafeString(feedbackJson, "finalAssessment", "Evaluation completed successfully via local estimator.");
            List<String> strengths = parseSafeStringList(feedbackJson, "strengths");
            List<String> areas = parseSafeStringList(feedbackJson, "areasForImprovement");
            List<String> bodyTips = parseSafeStringList(feedbackJson, "bodyLanguageTips");
            List<String> missed = parseSafeStringList(feedbackJson, "missedTopics");
            List<String> resources = parseSafeStringList(feedbackJson, "recommendedResources");
            List<String> plan = parseSafeStringList(feedbackJson, "improvementPlan");
            
            int companyReadiness = parseSafeInt(feedbackJson, "companyReadiness", totalScore - 5);
            int hiringProbability = parseSafeInt(feedbackJson, "hiringProbability", totalScore - 8);
            String expectedSalary = parseSafeString(feedbackJson, "expectedSalary", "6.0 - 8.5 LPA");
            String recruiterVerdict = parseSafeString(feedbackJson, "recruiterVerdict", totalScore >= 75 ? "Strong Candidate" : "Needs Improvement");
            String finalRecommendation = parseSafeString(feedbackJson, "finalRecommendation", "Focus on core computer science fundamentals.");

            String candidateSummary = parseSafeString(feedbackJson, "candidateSummary", "No summary provided.");
            String technicalAbilityComment = parseSafeString(feedbackJson, "technicalAbilityComment", "Evaluated technically stable.");
            String communicationComment = parseSafeString(feedbackJson, "communicationComment", "Articulate and fluent response delivery.");
            String leadershipComment = parseSafeString(feedbackJson, "leadershipComment", "Demonstrated basic collaboration and ownership values.");
            String problemSolvingComment = parseSafeString(feedbackJson, "problemSolvingComment", "Methodical solution architecture explanation.");
            String cultureFitComment = parseSafeString(feedbackJson, "cultureFitComment", "Aligned with core software engineering values.");
            String teamFitComment = parseSafeString(feedbackJson, "teamFitComment", "Demonstrates positive collaboration compatibility.");
            String riskAssessment = parseSafeString(feedbackJson, "riskAssessment", "Low hiring risk associated with core technical fluency.");
            String recruiterNotes = parseSafeString(feedbackJson, "recruiterNotes", "Candidate presented well; strong basic engineering background.");
            int interviewConfidence = parseSafeInt(feedbackJson, "interviewConfidence", totalScore + 3);
            List<String> questionComments = parseSafeStringList(feedbackJson, "questionComments");

            String competenciesJsonStr = null;
            if (state != null && state.getCompetenciesChecked() != null && !state.getCompetenciesChecked().isEmpty()) {
                try {
                    competenciesJsonStr = objectMapper.writeValueAsString(state.getCompetenciesChecked());
                } catch (Exception e) {
                    log.error("Failed to serialize competencies checked", e);
                }
            }

            if (competenciesJsonStr == null) {
                List<InterviewFeedbackDto.CompetencyDto> defaultList = new ArrayList<>();
                defaultList.add(new InterviewFeedbackDto.CompetencyDto("Domain Knowledge", "Core Concepts", technicalScore >= 70));
                defaultList.add(new InterviewFeedbackDto.CompetencyDto("Communication", "Clarity & Confidence", communicationScore >= 70));
                defaultList.add(new InterviewFeedbackDto.CompetencyDto("Problem Solving", "Analytical Thinking", problemSolvingScore >= 70));
                if (interview.getTopic() != null && interview.getTopic().toLowerCase().contains("coding")) {
                    defaultList.add(new InterviewFeedbackDto.CompetencyDto("Coding Ability", "Syntactic Correctness", codingScore >= 70));
                }
                try {
                    competenciesJsonStr = objectMapper.writeValueAsString(defaultList);
                } catch (Exception e) {
                    log.error("Failed to serialize fallback competencies list", e);
                }
            }

            InterviewFeedback feedback = InterviewFeedback.builder()
                    .totalScore(totalScore)
                    .technicalScore(technicalScore)
                    .communicationScore(communicationScore)
                    .confidenceScore(confidenceScore)
                    .problemSolvingScore(problemSolvingScore)
                    .codingScore(codingScore)
                    .behavioralScore(behavioralScore)
                    .roleReadiness(roleReadiness)
                    .finalAssessment(finalAssessment)
                    .strengths(strengths)
                    .areasForImprovement(areas)
                    .bodyLanguageTips(bodyTips)
                    .missedTopics(missed)
                    .recommendedResources(resources)
                    .improvementPlan(plan)
                    .companyReadiness(companyReadiness)
                    .hiringProbability(hiringProbability)
                    .expectedSalary(expectedSalary)
                    .recruiterVerdict(recruiterVerdict)
                    .finalRecommendation(finalRecommendation)
                    .mockInterview(interview)
                    .competenciesJson(competenciesJsonStr)
                    .candidateSummary(candidateSummary)
                    .technicalAbilityComment(technicalAbilityComment)
                    .communicationComment(communicationComment)
                    .leadershipComment(leadershipComment)
                    .problemSolvingComment(problemSolvingComment)
                    .cultureFitComment(cultureFitComment)
                    .teamFitComment(teamFitComment)
                    .riskAssessment(riskAssessment)
                    .recruiterNotes(recruiterNotes)
                    .interviewConfidence(interviewConfidence)
                    .build();
            interview.setFeedback(feedback);

            List<InterviewQuestion> questionsList = interview.getQuestions();
            if (questionsList != null) {
                for (int i = 0; i < questionsList.size(); i++) {
                    InterviewQuestion q = questionsList.get(i);
                    String comment = null;
                    if (questionComments != null && i < questionComments.size()) {
                        comment = questionComments.get(i);
                    }
                    if (comment == null || comment.trim().isEmpty()) {
                        int qScore = q.getScore() != null ? q.getScore() : 70;
                        if (qScore >= 80) {
                            comment = "Clear response, correctly addressing core elements of the question.";
                        } else if (qScore >= 60) {
                            comment = "Solid answer, but could be refined with more structural detail.";
                        } else {
                            comment = "Struggled to articulate core concepts cleanly; review foundational topics.";
                        }
                    }
                    q.setAiFeedback(comment);
                }
            }
        } catch (Exception e) {
            log.error("Failed to map evaluation feedback", e);
            interview.setFeedback(InterviewFeedback.builder()
                    .totalScore(70)
                    .technicalScore(70)
                    .communicationScore(70)
                    .confidenceScore(70)
                    .problemSolvingScore(70)
                    .codingScore(70)
                    .behavioralScore(70)
                    .roleReadiness(70)
                    .finalAssessment("Feedback generated successfully.")
                    .strengths(Arrays.asList("Active response", "Cooperative tone"))
                    .areasForImprovement(Arrays.asList("Technical elaboration"))
                    .mockInterview(interview)
                    .build());
        }

        MockInterview savedInterview = mockInterviewRepository.save(interview);
        log.info("Mock interview results persisted. ID: {}", savedInterview.getId());
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

    @Override
    @Transactional
    public void deleteInterview(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MockInterview interview = mockInterviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this interview record");
        }

        mockInterviewRepository.delete(interview);
        log.info("Mock interview with ID {} successfully deleted.", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getInterviewAnalytics() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

    private List<String> getPredefinedQuestions(MockInterviewRequestDto request) {
        String role = request.getRole() != null ? request.getRole().toLowerCase() : "";
        List<String> questions = new ArrayList<>();
        if (role.contains("java")) {
            questions.add("Explain the difference between HashMap and ConcurrentHashMap.");
            questions.add("What is the difference between fail-fast and fail-safe iterators?");
            questions.add("How does garbage collection work in Java, and what are GC generation zones?");
            questions.add("What is the difference between a functional interface and a normal interface in Java 8?");
            questions.add("Write a Java method to check if a binary tree is balanced.");
        } else if (role.contains("frontend") || role.contains("react")) {
            questions.add("Explain the virtual DOM and React reconciliation algorithm.");
            questions.add("What is the difference between useEffect, useLayoutEffect, and useMemo?");
            questions.add("How does state management work in React, and when would you use Context API vs Redux?");
            questions.add("What are CSS variables, and how do they differ from preprocessor variables like SASS?");
            questions.add("Write a React hook to fetch data with loading and error states.");
        } else if (role.contains("dsa") || role.contains("algorithm")) {
            questions.add("Write a function to find the longest substring without repeating characters in O(N) time.");
            questions.add("Explain the difference between Dynamic Programming and Divide-and-Conquer approach.");
            questions.add("How do you detect a cycle in a directed graph using DFS?");
            questions.add("Write code to merge K sorted linked lists.");
            questions.add("Explain QuickSort and its worst-case complexity mitigation strategies.");
        } else if (role.contains("sql") || role.contains("database")) {
            questions.add("Explain SQL window functions (ROW_NUMBER vs DENSE_RANK).");
            questions.add("What is the difference between database normalization (1NF, 2NF, 3NF) and denormalization?");
            questions.add("How do database indexes (B-Tree vs Hash index) speed up queries, and what is index selectivity?");
            questions.add("Write a SQL query to find the second highest salary in an Employee table.");
            questions.add("What are ACID properties, and how does database concurrency isolation levels prevent dirty reads?");
        } else {
            questions.add("Can you describe a challenging project you worked on and how you resolved the obstacles?");
            questions.add("What are your primary technical strengths, and what technologies do you want to master next?");
            questions.add("How do you handle disagreement with a technical decision made by your team members?");
            questions.add("Describe a scenario where you had to learn a completely new library or framework under a tight deadline.");
            questions.add("Why are you interested in this position, and what values can you bring to our engineering team?");
        }
        return questions;
    }

    private JsonNode getFallbackEvaluation(MockInterview interview) {
        String transcript = interview.getTranscript() != null ? interview.getTranscript().toLowerCase() : "";
        int wordCount = transcript.split("\\s+").length;
        
        int technicalScore = Math.min(Math.max(50 + (wordCount / 10), 40), 92);
        int communicationScore = Math.min(Math.max(60 + (transcript.contains("explain") ? 10 : 0) + (transcript.contains("example") ? 8 : 0), 50), 95);
        int confidenceScore = Math.min(Math.max(65 + (transcript.contains("confident") || transcript.contains("sure") ? 5 : 10), 55), 90);
        int totalScore = (int) (technicalScore * 0.5 + communicationScore * 0.3 + confidenceScore * 0.2);
        
        ObjectMapper mapper = new ObjectMapper();
        com.fasterxml.jackson.databind.node.ObjectNode fallback = mapper.createObjectNode();
        fallback.put("totalScore", totalScore);
        fallback.put("technicalScore", technicalScore);
        fallback.put("communicationScore", communicationScore);
        fallback.put("confidenceScore", confidenceScore);
        fallback.put("problemSolvingScore", totalScore);
        fallback.put("codingScore", totalScore);
        fallback.put("behavioralScore", totalScore);
        fallback.put("roleReadiness", totalScore);
        fallback.put("finalAssessment", "Evaluation completed successfully via local performance estimator. The candidate answered questions for " + interview.getRole() + " demonstrating solid fundamentals.");
        
        com.fasterxml.jackson.databind.node.ArrayNode strengths = mapper.createArrayNode();
        strengths.add("Active participation in the mock session");
        strengths.add("Clear communication pace");
        fallback.set("strengths", strengths);
        
        com.fasterxml.jackson.databind.node.ArrayNode areas = mapper.createArrayNode();
        areas.add("Elaborate further on core technical topics");
        areas.add("Provide structured real-world code snippets in responses");
        fallback.set("areasForImprovement", areas);
        
        com.fasterxml.jackson.databind.node.ArrayNode bodyTips = mapper.createArrayNode();
        bodyTips.add("Speak clearly with positive posture");
        bodyTips.add("Minimize usage of hesitation pause filler words");
        fallback.set("bodyLanguageTips", bodyTips);
        
        com.fasterxml.jackson.databind.node.ArrayNode missed = mapper.createArrayNode();
        missed.add("Detailed architectural design pattern explanation");
        fallback.set("missedTopics", missed);
        
        com.fasterxml.jackson.databind.node.ArrayNode resources = mapper.createArrayNode();
        resources.add("Review System Design Primer tutorials");
        fallback.set("recommendedResources", resources);
        
        com.fasterxml.jackson.databind.node.ArrayNode plans = mapper.createArrayNode();
        plans.add("Spend 15 mins daily on standard practice questionnaires");
        fallback.set("improvementPlan", plans);
        
        fallback.put("companyReadiness", totalScore - 5);
        fallback.put("hiringProbability", totalScore - 8);
        fallback.put("expectedSalary", "6.5 LPA - 9.2 LPA");
        fallback.put("recruiterVerdict", totalScore >= 75 ? "Highly Recommended" : "Needs Practice");
        fallback.put("finalRecommendation", "Focus on technical depth and expand explanations with design patterns.");
        
        return fallback;
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
                .questions(interview.getQuestions() != null ? interview.getQuestions().stream()
                        .map(q -> InterviewQuestionDto.builder()
                                .questionText(q.getQuestionText())
                                .answerText(q.getAnswerText())
                                .score(q.getScore())
                                .codeText(q.getCodeText())
                                .language(q.getLanguage())
                                .compilerOutput(q.getCompilerOutput())
                                .aiFeedback(q.getAiFeedback())
                                .build())
                        .collect(Collectors.toList()) : null)
                .feedback(interview.getFeedback() != null ? InterviewFeedbackDto.builder()
                        .totalScore(interview.getFeedback().getTotalScore())
                        .technicalScore(interview.getFeedback().getTechnicalScore())
                        .communicationScore(interview.getFeedback().getCommunicationScore())
                        .confidenceScore(interview.getFeedback().getConfidenceScore())
                        .problemSolvingScore(interview.getFeedback().getProblemSolvingScore())
                        .codingScore(interview.getFeedback().getCodingScore())
                        .behavioralScore(interview.getFeedback().getBehavioralScore())
                        .roleReadiness(interview.getFeedback().getRoleReadiness())
                        .finalAssessment(interview.getFeedback().getFinalAssessment())
                        .strengths(interview.getFeedback().getStrengths() != null ? new ArrayList<>(interview.getFeedback().getStrengths()) : null)
                        .areasForImprovement(interview.getFeedback().getAreasForImprovement() != null ? new ArrayList<>(interview.getFeedback().getAreasForImprovement()) : null)
                        .bodyLanguageTips(interview.getFeedback().getBodyLanguageTips() != null ? new ArrayList<>(interview.getFeedback().getBodyLanguageTips()) : null)
                        .missedTopics(interview.getFeedback().getMissedTopics() != null ? new ArrayList<>(interview.getFeedback().getMissedTopics()) : null)
                        .recommendedResources(interview.getFeedback().getRecommendedResources() != null ? new ArrayList<>(interview.getFeedback().getRecommendedResources()) : null)
                        .improvementPlan(interview.getFeedback().getImprovementPlan() != null ? new ArrayList<>(interview.getFeedback().getImprovementPlan()) : null)
                        .companyReadiness(interview.getFeedback().getCompanyReadiness())
                        .hiringProbability(interview.getFeedback().getHiringProbability())
                        .expectedSalary(interview.getFeedback().getExpectedSalary())
                        .recruiterVerdict(interview.getFeedback().getRecruiterVerdict())
                        .finalRecommendation(interview.getFeedback().getFinalRecommendation())
                        .competencies(parseCompetenciesJson(interview.getFeedback().getCompetenciesJson()))
                        .candidateSummary(interview.getFeedback().getCandidateSummary())
                        .technicalAbilityComment(interview.getFeedback().getTechnicalAbilityComment())
                        .communicationComment(interview.getFeedback().getCommunicationComment())
                        .leadershipComment(interview.getFeedback().getLeadershipComment())
                        .problemSolvingComment(interview.getFeedback().getProblemSolvingComment())
                        .cultureFitComment(interview.getFeedback().getCultureFitComment())
                        .teamFitComment(interview.getFeedback().getTeamFitComment())
                        .riskAssessment(interview.getFeedback().getRiskAssessment())
                        .recruiterNotes(interview.getFeedback().getRecruiterNotes())
                        .interviewConfidence(interview.getFeedback().getInterviewConfidence())
                        .benchmark(calculateBenchmark(interview))
                        .build() : null)
                .build();
    }

    private List<InterviewFeedbackDto.CompetencyDto> parseCompetenciesJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<InterviewFeedbackDto.CompetencyDto>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize competencies json", e);
            return new ArrayList<>();
        }
    }

    private String getCompanyStyleInstructions(String company) {
        if (company == null || company.trim().isEmpty()) {
            return "General Tech: Adopt a standard, comprehensive tech industry interview style assessing balanced competencies.";
        }
        String c = company.trim().toLowerCase();
        if (c.contains("google")) {
            return "Google Style: Emphasize rigorous algorithms, mathematical reasoning, deep problem solving, complexity bounds (Big O), and structural design. Adopt a highly analytical, inquisitive, and intellectually demanding tone. The rubric focuses on deep analytical reasoning and algorithmic edge cases.";
        } else if (c.contains("amazon")) {
            return "Amazon Style: Emphasize Amazon Leadership Principles (Ownership, Customer Obsession, Bias for Action, Dive Deep). Interweave questions assessing how they handle customer feedback, project ownership, or trade-offs. Adopt a direct, pragmatic, STAR-method oriented tone. The evaluation rubric focuses on leadership behavior and action.";
        } else if (c.contains("microsoft")) {
            return "Microsoft Style: Emphasize collaboration, system design thinking, accessibility, inclusive user-experience, and iterative software engineering. Adopt a highly collaborative, constructive, and product-design-oriented tone. The rubric focuses on clean design patterns and teamwork compatibility.";
        } else if (c.contains("oracle")) {
            return "Oracle Style: Emphasize Java programming language internals, JVM memory model (Heap/Stack), Garbage Collection, low-level concurrency, and memory safety. Adopt a highly precise, detail-oriented, and rigid tone. The rubric focuses on strict execution accuracy and internal language specs.";
        } else if (c.contains("nvidia")) {
            return "NVIDIA Style: Emphasize parallel computing foundations, CUDA programming, high-performance computing (HPC), GPU hardware architecture, threading models, and memory bandwidth optimization. Adopt an extreme performance-focused, hardware-centric tone. The rubric focuses on maximum hardware utilization and code efficiency.";
        } else if (c.contains("infosys")) {
            return "Infosys Style: Emphasize core IT engineering fundamentals, basic syntax, database queries (SQL), OOP definitions, and foundational code logic. Adopt a patient, standard textbook-based recruiter tone. The rubric focuses on correct textbook syntax and basics.";
        } else if (c.contains("tcs")) {
            return "TCS Style: Emphasize baseline communication clarity, fundamental conceptual definitions, and readiness to adapt/learn. Adopt a friendly, supportive, and conversational tone. The rubric focuses on articulate explanations and core computer basics.";
        } else {
            return company + " Style: Adopt a tailored questioning style matching " + company + "'s core business domains and standard tech interview rubrics.";
        }
    }

    @Override
    public byte[] generateSpeech(String text) {
        if (text == null || text.trim().isEmpty() || "dummy".equalsIgnoreCase(elevenlabsApiKey)) {
            log.warn("ElevenLabs TTS key unconfigured or text empty.");
            return new byte[0];
        }
        try {
            String url = "https://api.elevenlabs.io/v1/text-to-speech/" + elevenlabsVoiceId;
            Map<String, Object> body = new HashMap<>();
            body.put("text", text);
            body.put("model_id", "eleven_monolingual_v1");
            
            Map<String, Object> settings = new HashMap<>();
            settings.put("stability", 0.5);
            settings.put("similarity_boost", 0.75);
            body.put("voice_settings", settings);

            return webClientBuilder.build()
                    .post()
                    .uri(url)
                    .header("xi-api-key", elevenlabsApiKey)
                    .header("Content-Type", "application/json")
                    .header("accept", "audio/mpeg")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
        } catch (Exception e) {
            log.error("Failed to generate speech from ElevenLabs", e);
            return new byte[0];
        }
    }

    private int parseSafeInt(JsonNode node, String fieldName, int defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        if (field.isNumber()) return field.asInt();
        String txt = field.asText().trim();
        if (txt.isEmpty() || "N/A".equalsIgnoreCase(txt)) return defaultValue;
        try {
            return Integer.parseInt(txt);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private String parseSafeString(JsonNode node, String fieldName, String defaultValue) {
        if (node == null || !node.has(fieldName)) return defaultValue;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) return defaultValue;
        String val = field.asText();
        return val.trim().isEmpty() ? defaultValue : val;
    }

    private List<String> parseSafeStringList(JsonNode node, String fieldName) {
        List<String> list = new ArrayList<>();
        if (node == null || !node.has(fieldName)) return list;
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull() || !field.isArray()) return list;
        for (JsonNode item : field) {
            if (item != null && !item.isNull()) {
                list.add(item.asText());
            }
        }
        return list;
    }


    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }

    private InterviewFeedbackDto.BenchmarkDto calculateBenchmark(MockInterview interview) {
        if (interview.getFeedback() == null || interview.getFeedback().getTotalScore() == null) {
            return null;
        }
        int candidateScore = interview.getFeedback().getTotalScore();

        List<MockInterview> allInterviews = mockInterviewRepository.findAll().stream()
                .filter(m -> m.getFeedback() != null && m.getFeedback().getTotalScore() != null)
                .collect(Collectors.toList());

        if (allInterviews.isEmpty()) {
            return InterviewFeedbackDto.BenchmarkDto.builder()
                    .percentileCategory("Average")
                    .percentile(50.0)
                    .roleAverage(70.0)
                    .collegeAverage(70.0)
                    .companyAverage(70.0)
                    .globalAverage(70.0)
                    .totalCompared(1)
                    .build();
        }

        List<Integer> globalScores = allInterviews.stream()
                .map(m -> m.getFeedback().getTotalScore())
                .sorted()
                .collect(Collectors.toList());

        double globalAvg = globalScores.stream().mapToInt(Integer::intValue).average().orElse(70.0);

        long scoresBelow = globalScores.stream().filter(s -> s < candidateScore).count();
        long scoresEqual = globalScores.stream().filter(s -> s == candidateScore).count();
        double percentile = allInterviews.size() <= 1 ? 50.0 : 
                ((double) scoresBelow + (0.5 * scoresEqual)) / allInterviews.size() * 100.0;

        String category;
        if (percentile >= 90.0) {
            category = "Top 10%";
        } else if (percentile >= 75.0) {
            category = "Top 25%";
        } else if (percentile >= 50.0) {
            category = "Above Average";
        } else if (percentile >= 35.0) {
            category = "Average";
        } else {
            category = "Needs Improvement";
        }

        double roleAvg = allInterviews.stream()
                .filter(m -> interview.getRole() != null && interview.getRole().equalsIgnoreCase(m.getRole()))
                .mapToInt(m -> m.getFeedback().getTotalScore())
                .average().orElse(globalAvg);

        double collegeAvg = allInterviews.stream()
                .filter(m -> m.getUser() != null && interview.getUser() != null &&
                        interview.getUser().getCollegeName() != null &&
                        interview.getUser().getCollegeName().equalsIgnoreCase(m.getUser().getCollegeName()))
                .mapToInt(m -> m.getFeedback().getTotalScore())
                .average().orElse(globalAvg);

        double companyAvg = allInterviews.stream()
                .filter(m -> interview.getCompany() != null && interview.getCompany().equalsIgnoreCase(m.getCompany()))
                .mapToInt(m -> m.getFeedback().getTotalScore())
                .average().orElse(globalAvg);

        return InterviewFeedbackDto.BenchmarkDto.builder()
                .percentile(Math.round(percentile * 10.0) / 10.0)
                .percentileCategory(category)
                .roleAverage(Math.round(roleAvg * 10.0) / 10.0)
                .collegeAverage(Math.round(collegeAvg * 10.0) / 10.0)
                .companyAverage(Math.round(companyAvg * 10.0) / 10.0)
                .globalAverage(Math.round(globalAvg * 10.0) / 10.0)
                .totalCompared(allInterviews.size())
                .build();
    }
}