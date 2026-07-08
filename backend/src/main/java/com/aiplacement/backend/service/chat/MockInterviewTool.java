package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class MockInterviewTool implements PlacementTool {

    @Override
    public String getName() {
        return "mock-interview";
    }

    @Override
    public String getDescription() {
        return "Configures a mock interview session for the candidate.";
    }

    @Override
    public String execute(String context) {
        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"interview\",\n" +
               "      \"title\": \"Mock Interview Session\",\n" +
               "      \"data\": {\n" +
               "        \"role\": \"Backend Engineer (Java)\",\n" +
               "        \"difficulty\": \"Medium\",\n" +
               "        \"duration\": \"45 mins\",\n" +
               "        \"questionsCount\": 5\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
