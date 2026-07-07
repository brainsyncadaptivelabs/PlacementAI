package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlagiarismDetectionEngineImpl implements PlagiarismDetectionEngine {

    private final AIClient aiClient;
    private final CodingSubmissionRepository submissionRepository;

    private static final double FLAG_THRESHOLD = 75.0;

    @Override
    @Transactional
    public CodingSubmission analyze(CodingSubmission submission, String problemStatement) {
        log.info("[CODING] [PLAGIARISM] Checking submission ID: {}", submission.getId());

        String code = submission.getCode() != null
                ? submission.getCode().substring(0, Math.min(submission.getCode().length(), 2500))
                : "";

        String prompt = """
                You are a plagiarism detection specialist reviewing a coding submission for authenticity.
                
                PROBLEM: %s
                LANGUAGE: %s
                CODE:
                %s
                
                Analyze for:
                1. Known open-source solution templates (LeetCode solutions, GeeksForGeeks, GitHub)
                2. AI-generated code indicators (ChatGPT, Copilot patterns)
                3. Copy-paste suspicious patterns (unnatural variable names, copied comments)
                4. Identical structure to well-known textbook solutions
                
                Return ONLY valid JSON:
                {
                  "similarityScore": <0-100 plagiarism probability>,
                  "isSuspicious": <true/false>,
                  "indicators": ["indicator1", "indicator2"],
                  "sourceType": "ORIGINAL / KNOWN_TEMPLATE / AI_GENERATED / SUSPICIOUS",
                  "reasoning": "<Brief explanation>"
                }
                """.formatted(
                problemStatement != null ? problemStatement.substring(0, Math.min(problemStatement.length(), 800)) : "N/A",
                submission.getLanguage(),
                code
        );

        JsonNode response = null;
        try {
            response = aiClient.generateJson(
                    "You are a plagiarism detection expert. Respond ONLY with valid JSON.",
                    prompt, 0.1, 1024, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.warn("[CODING] [PLAGIARISM] Detection failed: {}", e.getMessage());
        }

        if (response != null) {
            double score = response.path("similarityScore").asDouble(0);
            boolean flagged = score >= FLAG_THRESHOLD || response.path("isSuspicious").asBoolean(false);

            submission.setPlagiarismScore(score);
            submission.setPlagiarismFlagged(flagged);

            if (flagged) {
                log.warn("[CODING] [PLAGIARISM] FLAGGED: submission ID: {}, score: {}, type: {}",
                        submission.getId(), score, response.path("sourceType").asText("UNKNOWN"));
                submission.setStatus("PLAGIARISM_FLAGGED");
            }
        } else {
            submission.setPlagiarismScore(0.0);
            submission.setPlagiarismFlagged(false);
        }

        return submissionRepository.save(submission);
    }
}
