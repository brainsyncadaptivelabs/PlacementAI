package com.aiplacement.backend.service.compare;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.compare.ResumeCompareRequestDto;
import com.aiplacement.backend.dto.compare.ResumeCompareResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeCompareServiceImpl implements ResumeCompareService {

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ResumeCompareResponseDto compareResumes(ResumeCompareRequestDto request) {
        String prompt = """
                Compare these two resumes.
                
                Return ONLY valid JSON.
                
                Format:
                {
                  "betterResume": "",
                  "comparisonSummary": "",
                  "resume1Strengths": [],
                  "resume2Strengths": [],
                  "recommendation": ""
                }
                
                Resume 1:
                """ + request.getResume1() +
                """
                
                Resume 2:
                """ + request.getResume2();

        String fallbackJson = "{\"betterResume\": \"Resume 1\", \"comparisonSummary\": \"Failed to compare due to AI downtime.\", \"resume1Strengths\": [], \"resume2Strengths\": [], \"recommendation\": \"Please try again later.\"}";

        try {
            log.info("Sending resume comparison request to OllamaClient");
            JsonNode aiJson = ollamaClient.getJsonResponse(prompt, 0.7, e -> fallbackJson);

            return ResumeCompareResponseDto.builder()
                    .betterResume(aiJson.has("betterResume") ? aiJson.get("betterResume").asText() : "Unknown")
                    .comparisonSummary(aiJson.has("comparisonSummary") ? aiJson.get("comparisonSummary").asText() : "Unknown")
                    .resume1Strengths(objectMapper.convertValue(
                            aiJson.get("resume1Strengths"),
                            new TypeReference<List<String>>() {}
                    ))
                    .resume2Strengths(objectMapper.convertValue(
                            aiJson.get("resume2Strengths"),
                            new TypeReference<List<String>>() {}
                    ))
                    .recommendation(aiJson.has("recommendation") ? aiJson.get("recommendation").asText() : "Unknown")
                    .build();

        } catch (Exception e) {
            log.error("Failed to compare resumes", e);
            throw new RuntimeException("Failed to compare resumes");
        }
    }
}