package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerResponseDto;
import com.aiplacement.backend.dto.voice.BargeInResult;
import com.aiplacement.backend.dto.voice.SttResult;
import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BargeInOrchestrationServiceImpl implements BargeInOrchestrationService {

    private final VoiceSessionService voiceSessionService;
    private final AIClient aiClient;
    private final InterviewOrchestrator interviewOrchestrator;

    private final MockInterviewRepository mockInterviewRepository;
    private final InterviewInterruptionLogRepository interruptionLogRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;




    @Override
    @Transactional
    public BargeInResult processBargeIn(Long interviewId, byte[] audioBytes, String mimeType, boolean aiWasSpeaking) {
        log.info("[BARGE_IN] Processing potential interruption for interview: {}, AI speaking status: {}", interviewId, aiWasSpeaking);

        // 1. Transcribe audio
        SttResult stt = voiceSessionService.processAudioInput(audioBytes, "interruption.wav", mimeType);
        String text = stt != null ? stt.getTranscript() : "";

        if (text == null || text.isBlank() || text.trim().split("\\s+").length <= 1) {
            log.info("[BARGE_IN] Ignored: Transcription empty or too short (potential noise).");
            return BargeInResult.builder()
                    .interrupted(false)
                    .transcription(text)
                    .classification("NOISE")
                    .action("IGNORE")
                    .build();
        }

        // 2. Intent Classification via AI
        String classification = classifyIntent(text);
        log.info("[BARGE_IN] Classified user intent as: {}", classification);

        if ("NOISE".equalsIgnoreCase(classification)) {
            return BargeInResult.builder()
                    .interrupted(false)
                    .transcription(text)
                    .classification("NOISE")
                    .action("IGNORE")
                    .build();
        }

        // 3. Retrieve state context
        MockInterview interview = mockInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

        int idx = interview.getCurrentQuestionIndex();
        List<InterviewQuestion> questions = interview.getQuestions();
        InterviewQuestion currentQ = (questions != null && idx < questions.size()) ? questions.get(idx) : null;

        String action = "REMAIN";
        String aiResponseText = "";
        byte[] responseAudio = null;

        // 4. Branching policy decisions
        switch (classification.toUpperCase()) {
            case "CLARIFICATION_REQUEST", "FOLLOW_UP_QUESTION" -> {
                action = "REMAIN";
                aiResponseText = generateClarificationAnswer(currentQ != null ? currentQ.getQuestionText() : "", text);
                responseAudio = voiceSessionService.processTextOutput(aiResponseText, "English-US-Male-1", 1.0);
            }
            case "INTERVIEW_CONTROL" -> {
                action = "REMAIN";
                if (text.toLowerCase().contains("repeat")) {
                    aiResponseText = currentQ != null ? currentQ.getQuestionText() : "No active question to repeat.";
                } else {
                    aiResponseText = "Understood. Let's continue when you are ready. The question is: " + (currentQ != null ? currentQ.getQuestionText() : "");
                }
                responseAudio = voiceSessionService.processTextOutput(aiResponseText, "English-US-Male-1", 1.0);
            }
            case "OFF_TOPIC", "SMALL_TALK" -> {
                action = "REMAIN";
                aiResponseText = "That is an interesting topic, but let's stay focused on the interview objectives. The current question is: " + (currentQ != null ? currentQ.getQuestionText() : "");
                responseAudio = voiceSessionService.processTextOutput(aiResponseText, "English-US-Male-1", 1.0);
            }
            case "CANDIDATE_ANSWER" -> {
                action = "ADVANCE";
                // Delegate turn completion to core FSM
                AdaptiveAnswerRequestDto answerReq = AdaptiveAnswerRequestDto.builder()
                        .interviewId(interviewId)
                        .answer(text)
                        .build();
                AdaptiveAnswerResponseDto transitionResp = interviewOrchestrator.processAdaptiveAnswer(answerReq);
                aiResponseText = transitionResp.getNextQuestion();
                if (aiResponseText == null) aiResponseText = "Interview completed.";
                responseAudio = voiceSessionService.processTextOutput(aiResponseText, "English-US-Male-1", 1.0);
            }
            default -> {
                action = "IGNORE";
            }
        }

        // 5. Save Interruption Log entry
        if (!"IGNORE".equals(action)) {
            InterviewInterruptionLog logRecord = InterviewInterruptionLog.builder()
                    .mockInterview(interview)
                    .interviewQuestion(currentQ)
                    .transcription(text)
                    .classification(classification)
                    .actionTaken(action)
                    .aiResponseText(aiResponseText)
                    .build();
            interruptionLogRepository.save(logRecord);
            log.info("[BARGE_IN] Logged interruption event, type: {}, action: {}", classification, action);
        }

        return BargeInResult.builder()
                .interrupted(true)
                .transcription(text)
                .classification(classification)
                .responseText(aiResponseText)
                .action(action)
                .audioBytes(responseAudio)
                .build();
    }

    private String classifyIntent(String text) {
        String prompt = """
                You are a conversational classifier categorizing a candidate's spoken input during a technical interview.
                
                INPUT TEXT: "%s"
                
                Classify the input text into exactly one of these categories:
                - CLARIFICATION_REQUEST (User is asking a question about the scenario, constraints, databases, tools, or requirements)
                - INTERVIEW_CONTROL (User is requesting to repeat the question, speak slower, pause, or resume)
                - CANDIDATE_ANSWER (User is explaining their design, answering the problem, or building on their solution)
                - OFF_TOPIC (User is talking about unrelated subjects or personal details)
                - SMALL_TALK (User says hello, greets, or makes casual friendly talk)
                - NOISE (Input is garbage, background noise, or completely unintelligible)
                
                Respond with ONLY valid JSON in this format:
                {"intent": "<category>"}
                """.formatted(text);
        try {
            JsonNode res = aiClient.generateJson(
                    "You are a fast intent classifier. Respond ONLY with valid JSON.",
                    prompt, 0.1, 256, e -> fallbackClassification(text));
            return res.path("intent").asText("CANDIDATE_ANSWER");
        } catch (Exception e) {
            return fallbackClassification(text);
        }
    }

    private String fallbackClassification(String text) {
        String t = text.toLowerCase();
        if (t.contains("repeat") || t.contains("pause") || t.contains("slower") || t.contains("again")) {
            return "INTERVIEW_CONTROL";
        }
        if (t.contains("what") || t.contains("how") || t.contains("why") || t.contains("could you") || t.contains("can I")) {
            return "CLARIFICATION_REQUEST";
        }
        if (t.contains("weather") || t.contains("lunch") || t.contains("football") || t.contains("cricket")) {
            return "OFF_TOPIC";
        }
        if (t.contains("hello") || t.contains("hi ") || t.contains("hey")) {
            return "SMALL_TALK";
        }
        return "CANDIDATE_ANSWER";
    }

    private String generateClarificationAnswer(String questionText, String userQuery) {
        String prompt = """
                You are a helpful technical interviewer. The candidate has asked a clarifying question during their interview turn.
                
                ACTIVE QUESTION: %s
                CANDIDATE QUERY: %s
                
                Provide a short, direct, and encouraging response (1-2 sentences) answering their query clearly.
                """.formatted(questionText, userQuery);
        try {
            JsonNode res = aiClient.generateJson(
                    "You are a helpful technical interviewer. Respond with a direct answer in JSON format.",
                    "{\"response\": \"<your response>\"}", 0.4, 512, e -> null);
            if (res != null && res.has("response")) {
                return res.path("response").asText();
            }
        } catch (Exception ignored) {}
        // Direct fallback responses
        return "That is a good question. You should design it assuming standard internet-scale conditions, and focus on high availability.";
    }
}
