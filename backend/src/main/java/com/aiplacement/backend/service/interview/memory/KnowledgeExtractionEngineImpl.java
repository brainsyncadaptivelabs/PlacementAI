package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.CandidateClaim;
import com.aiplacement.backend.repository.memory.CandidateClaimRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeExtractionEngineImpl implements KnowledgeExtractionEngine {

    private final AIClient aiClient;
    private final CandidateClaimRepository candidateClaimRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public JsonNode extractFromTurn(User user, String question, String answer, JsonNode evaluation) {
        log.info("[MOCK_INTERVIEW] [MEMORY] Starting structured knowledge extraction for candidate: {}", user.getEmail());

        List<CandidateClaim> claims = candidateClaimRepository.findByUser(user);
        String claimsContext = claims.isEmpty() ? "No prior claims registered." :
                claims.stream()
                      .map(c -> String.format("- Claim: %s (Status: %s, Confidence: %.2f)", c.getClaimText(), c.getVerificationStatus(), c.getConfidence()))
                      .collect(Collectors.joining("\n"));

        String prompt = "You are an AI Memory Architect. Your task is to process an interview turn and extract structured candidate knowledge.\n" +
                "Turn Details:\n" +
                "- Question Asked: " + question + "\n" +
                "- Candidate Answer: " + answer + "\n" +
                "- Evaluated Turn Details: " + (evaluation != null ? evaluation.toString() : "None") + "\n\n" +
                "Historical Candidate Claims:\n" + claimsContext + "\n\n" +
                "Instructions:\n" +
                "1. Identify the core skills, technologies, and concepts verified or discussed.\n" +
                "2. Extract any project named and details mapping (architecture, security, deployment, scaling, database, caching, DevOps, confidence).\n" +
                "3. Check for any contradictions against the candidate's historical claims listed above. Assign severity (LOW, MEDIUM, HIGH) and suggested follow-up.\n" +
                "4. Suggest 3 prioritized follow-up questions (A, B, and C) to ask based on this answer.\n" +
                "5. Verify claims from their response and grade confidence %.\n\n" +
                "Return ONLY a JSON object matching this schema:\n" +
                "{\n" +
                "  \"skills\": [\"Redis\", \"Java\"],\n" +
                "  \"concepts\": [\"Caching\", \"Database replication\"],\n" +
                "  \"projects\": [\n" +
                "    {\n" +
                "      \"name\": \"Distributed Cache Layer\",\n" +
                "      \"architecture\": \"Master-Slave\",\n" +
                "      \"security\": \"TLS Encryption\",\n" +
                "      \"databaseTech\": \"PostgreSQL\",\n" +
                "      \"caching\": \"Redis Cluster\",\n" +
                "      \"deployment\": \"Kubernetes\",\n" +
                "      \"scaling\": \"horizontal pod autoscaling\",\n" +
                "      \"monitoring\": \"Prometheus\",\n" +
                "      \"testing\": \"JUnit\",\n" +
                "      \"devops\": \"GitHub Actions\",\n" +
                "      \"confidence\": 0.85\n" +
                "    }\n" +
                "  ],\n" +
                "  \"claims\": [\n" +
                "    { \"claim\": \"Built Redis distributed cache scaling to 50k rps\", \"status\": \"VERIFIED\", \"confidence\": 0.88, \"evidence\": \"Described sentinel and write-through caching\", \"risk\": \"LOW\" }\n" +
                "  ],\n" +
                "  \"contradictions\": [\n" +
                "    { \"text\": \"Contradiction text here\", \"severity\": \"MEDIUM\", \"suggestedFollowup\": \"Follow up question text\" }\n" +
                "  ],\n" +
                "  \"followups\": [\n" +
                "    { \"topic\": \"Redis cluster split brain\", \"questionText\": \"How did you prevent split-brain issues in sentinel?\", \"priority\": 3 },\n" +
                "    { \"topic\": \"PostgreSQL consistency\", \"questionText\": \"How did you guarantee consistency?\", \"priority\": 2 }\n" +
                "  ]\n" +
                "}";

        try {
            return aiClient.generateJson(
                    "You are an AI Memory Architect. Respond ONLY with valid JSON.",
                    prompt, 0.5, 4096, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.error("Failed to extract structured knowledge from AI", e);
            // Return safe empty JSON structure
            try {
                return objectMapper.readTree("{\"skills\":[], \"concepts\":[], \"projects\":[], \"claims\":[], \"contradictions\":[], \"followups\":[]}");
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
