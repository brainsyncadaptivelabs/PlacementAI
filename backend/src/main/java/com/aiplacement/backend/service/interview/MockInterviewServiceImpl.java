package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.entity.interview.InterviewFeedback;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.repository.memory.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import com.aiplacement.backend.entity.interview.InterviewStatus;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockInterviewServiceImpl implements MockInterviewService {

    private final AIClient aiClient;
    private final MockInterviewRepository mockInterviewRepository;
    private final UserRepository userRepository;
    private final org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder;
    private final com.aiplacement.backend.monitoring.PlacementMetrics placementMetrics;
    private final InterviewOrchestrator interviewOrchestrator;

    private final CandidateSkillConfidenceRepository skillConfidenceRepository;
    private final CandidateProjectKnowledgeRepository projectKnowledgeRepository;
    private final CandidateContradictionRepository contradictionRepository;
    private final CandidateLearningProgressRepository learningProgressRepository;
    private final CandidateVerifiedResumeRepository verifiedResumeRepository;
    private final KnowledgeGraphNodeRepository nodeRepository;
    private final KnowledgeGraphEdgeRepository edgeRepository;
    private final CandidateFollowupRepository followupRepository;
    private final org.springframework.cache.CacheManager cacheManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${elevenlabs.api.key:dummy}")
    private String elevenlabsApiKey;

    @Value("${elevenlabs.voice.id:21m00Tcm4TlvDq8ikWAM}")
    private String elevenlabsVoiceId;


    @Override
    public MockInterviewResponseDto generateMockInterview(MockInterviewRequestDto request) {
        log.info("Generating mock interview questions.");
        placementMetrics.incrementMockInterviews();
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
                log.info("Sending mock interview generate request to AI provider, attempt: {}", attempt);
                aiJson = aiClient.generateJson(
                        "You are an expert technical interviewer. Generate interview questions. Respond ONLY with valid JSON.",
                        prompt, 0.7, 4096, e -> {
                    throw new RuntimeException("AI generate failed", e);
                });
                if (aiJson != null && aiJson.has("questions")) {
                    break;
                }
            } catch (Exception e) {
                log.error("AI generate failed on attempt {}: {}", attempt, e.getMessage());
            }
        }

        // Custom Fallback questions generator (Phase 3 requirement)
        if (aiJson == null) {
            log.warn("AI unavailable or failed. Loading predefined fallback questions.");
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
                log.info("Sending mock interview feedback request to AI provider, attempt: {}", attempt);
                feedbackJson = aiClient.generateJson(
                        "You are an expert interviewer generating comprehensive interview feedback. Respond ONLY with valid JSON.",
                        feedbackPrompt, 0.5, 4096, e -> {
                    throw new RuntimeException("AI feedback failed", e);
                });
                if (feedbackJson != null && feedbackJson.has("totalScore")) {
                    break;
                }
            } catch (Exception e) {
                log.error("AI feedback analysis failed on attempt {}: {}", attempt, e.getMessage());
            }
        }

        if (feedbackJson == null) {
            log.warn("AI feedback unavailable. Loading heuristic fallback feedback.");
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

        // Evict user intelligence cache on interview completion
        try {
            if (cacheManager.getCache("placement_context") != null) {
                cacheManager.getCache("placement_context").evict(email);
            }
            if (cacheManager.getCache("placement_readiness") != null) {
                cacheManager.getCache("placement_readiness").evict(email);
            }
            log.info("Evicted placement caches for: {}", email);
        } catch (Exception ex) {
            log.warn("Failed to evict placement caches: {}", ex.getMessage());
        }

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

        // Evict user intelligence cache on interview deletion
        try {
            if (cacheManager.getCache("placement_context") != null) {
                cacheManager.getCache("placement_context").evict(email);
            }
            if (cacheManager.getCache("placement_readiness") != null) {
                cacheManager.getCache("placement_readiness").evict(email);
            }
            log.info("Evicted placement caches on deletion for: {}", email);
        } catch (Exception ex) {
            log.warn("Failed to evict placement caches: {}", ex.getMessage());
        }
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
                                .thinkingTimeSeconds(q.getThinkingTimeSeconds())
                                .timeTakenSeconds(q.getTimeTakenSeconds())
                                .emotionAnalysisJson(q.getEmotionAnalysisJson())
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
                .memorySummary(buildMemorySummary(interview.getUser()))
                .build();
    }

    private CandidateMemorySummaryDto buildMemorySummary(User user) {
        if (user == null) return null;

        var claims = verifiedResumeRepository.findByUser(user);
        var projects = projectKnowledgeRepository.findByUser(user);
        var skills = skillConfidenceRepository.findByUser(user);
        var contradictions = contradictionRepository.findByUser(user);
        var progressList = learningProgressRepository.findByUserOrderByInterviewDateAsc(user);
        var nodes = nodeRepository.findByUser(user);
        var edges = edgeRepository.findByUser(user);
        var followups = followupRepository.findByUserAndStatusOrderByPriorityDesc(user, "PENDING");

        // Compute trust dynamically
        double resumeTrustScore = 100.0;
        int riskCount = 0;
        for (var claim : claims) {
            if ("CONTRADICTED".equalsIgnoreCase(claim.getStatus())) {
                resumeTrustScore -= 15.0;
                riskCount += 2;
            } else if ("CLAIMED".equalsIgnoreCase(claim.getStatus())) {
                resumeTrustScore -= 5.0;
            }
        }
        for (var contradiction : contradictions) {
            if ("HIGH".equalsIgnoreCase(contradiction.getSeverity())) {
                resumeTrustScore -= 20.0;
                riskCount += 3;
            } else {
                resumeTrustScore -= 10.0;
                riskCount += 1;
            }
        }
        resumeTrustScore = Math.max(10.0, Math.min(100.0, resumeTrustScore));
        String resumeRiskScore = riskCount >= 5 ? "HIGH" : (riskCount >= 2 ? "MEDIUM" : "LOW");

        double hiringConfidence = 70.0;
        if (!skills.isEmpty()) {
            double avgConfidence = skills.stream().mapToDouble(s -> s.getConfidence() != null ? s.getConfidence() : 0.0).average().orElse(70.0);
            hiringConfidence = (avgConfidence * 0.7) + (resumeTrustScore * 0.3);
        }

        List<Map<String, Object>> nodesList = nodes.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("name", n.getName());
            map.put("type", n.getType());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> edgesList = edges.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("source", e.getSourceNodeId());
            map.put("target", e.getTargetNodeId());
            map.put("relationship", e.getRelationship());
            map.put("weight", e.getWeight());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> skillsList = skills.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("skill", s.getSkill());
            map.put("claimed", s.getClaimed());
            map.put("verified", s.getVerified());
            map.put("confidence", s.getConfidence());
            map.put("averageScore", s.getAverageScore());
            map.put("trend", s.getTrend());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> progressMapped = progressList.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", p.getInterviewDate().toString());
            map.put("skill", p.getSkill());
            map.put("previousConfidence", p.getPreviousConfidence());
            map.put("newConfidence", p.getNewConfidence());
            map.put("improvement", p.getImprovement());
            map.put("trend", p.getTrend());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> contradictionsList = contradictions.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("text", c.getContradictionText());
            map.put("severity", c.getSeverity());
            map.put("suggestedFollowup", c.getSuggestedFollowup());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> claimsList = claims.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("claim", c.getClaim());
            map.put("status", c.getStatus());
            map.put("confidence", c.getConfidence());
            map.put("risk", c.getRisk());
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> projectsList = projects.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("projectName", p.getProjectName());
            map.put("architecture", p.getArchitecture());
            map.put("security", p.getSecurity());
            map.put("databaseTech", p.getDatabaseTech());
            map.put("caching", p.getCaching());
            map.put("deployment", p.getDeployment());
            map.put("scaling", p.getScaling());
            map.put("monitoring", p.getMonitoring());
            map.put("testing", p.getTesting());
            map.put("devops", p.getDevops());
            map.put("confidence", p.getConfidence());
            return map;
        }).collect(Collectors.toList());

        List<String> weakSkills = skills.stream()
                .filter(s -> s.getConfidence() != null && s.getConfidence() < 60.0)
                .map(s -> s.getSkill())
                .collect(Collectors.toList());

        List<String> followupsList = followups.stream()
                .map(f -> f.getQuestionText())
                .collect(Collectors.toList());

        return CandidateMemorySummaryDto.builder()
                .resumeTrustScore(resumeTrustScore)
                .resumeRiskScore(resumeRiskScore)
                .hiringConfidence(hiringConfidence)
                .knowledgeGraphNodes(nodesList)
                .knowledgeGraphEdges(edgesList)
                .skillConfidenceMatrix(skillsList)
                .learningProgress(progressMapped)
                .contradictions(contradictionsList)
                .verifiedClaims(claimsList)
                .projectConfidence(projectsList)
                .weakSkills(weakSkills)
                .followUpRecommendations(followupsList)
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
 
        long totalCompared = mockInterviewRepository.countWithFeedback();
        if (totalCompared == 0) {
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
 
        Double globalAvgVal = mockInterviewRepository.getGlobalAverageScore();
        double globalAvg = globalAvgVal != null ? globalAvgVal : 70.0;
 
        long scoresBelow = mockInterviewRepository.countWithScoreBelow(candidateScore);
        long scoresEqual = mockInterviewRepository.countWithScoreEqual(candidateScore);
        double percentile = totalCompared <= 1 ? 50.0 : 
                ((double) scoresBelow + (0.5 * scoresEqual)) / totalCompared * 100.0;
 
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
 
        Double roleAvgVal = interview.getRole() != null ? mockInterviewRepository.getAverageScoreByRole(interview.getRole()) : null;
        double roleAvg = roleAvgVal != null ? roleAvgVal : globalAvg;
 
        Double collegeAvgVal = (interview.getUser() != null && interview.getUser().getCollegeName() != null) ?
                mockInterviewRepository.getAverageScoreByCollege(interview.getUser().getCollegeName()) : null;
        double collegeAvg = collegeAvgVal != null ? collegeAvgVal : globalAvg;
 
        Double companyAvgVal = interview.getCompany() != null ? mockInterviewRepository.getAverageScoreByCompany(interview.getCompany()) : null;
        double companyAvg = companyAvgVal != null ? companyAvgVal : globalAvg;
 
        return InterviewFeedbackDto.BenchmarkDto.builder()
                .percentile(Math.round(percentile * 10.0) / 10.0)
                .percentileCategory(category)
                .roleAverage(Math.round(roleAvg * 10.0) / 10.0)
                .collegeAverage(Math.round(collegeAvg * 10.0) / 10.0)
                .companyAverage(Math.round(companyAvg * 10.0) / 10.0)
                .globalAverage(Math.round(globalAvg * 10.0) / 10.0)
                .totalCompared((int) totalCompared)
                .build();
    }

}