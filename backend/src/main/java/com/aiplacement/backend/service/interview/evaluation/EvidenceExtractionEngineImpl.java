package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenceExtractionEngineImpl implements EvidenceExtractionEngine {

    private final AIClient aiClient;

    @Override
    public String extractEvidence(InterviewQuestion question, String answer, String competencies) {
        String prompt = """
                You are an AI evidence extractor. Extract factual, specific evidence from this interview answer.
                
                QUESTION: %s
                CANDIDATE ANSWER: %s
                TARGET COMPETENCIES: %s
                
                For each relevant competency, extract DIRECT quotes or specific behaviors from the answer as evidence.
                Only include evidence that is clearly supported by the candidate's actual words.
                
                Respond with ONLY valid JSON array in this exact format:
                [
                  {
                    "competency": "<competency name>",
                    "evidenceText": "<direct quote or specific behavior from answer>",
                    "sourceQuestion": "<the question that prompted this>",
                    "sourceAnswer": "<the relevant portion of the answer>"
                  }
                ]
                """.formatted(question.getQuestionText(), answer, competencies);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are an AI evidence extractor. Respond ONLY with a valid JSON array.",
                    prompt, 0.2, 2048, err -> "[]");
            String result = node != null ? node.toString() : "[]";
            log.info("[EVAL] [EVIDENCE] Extracted evidence for question ID: {}", question.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [EVIDENCE] Extraction failed. Reason: {}", e.getMessage());
            return "[]";
        }
    }
}
