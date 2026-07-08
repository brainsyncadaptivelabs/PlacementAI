package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class PreparationTool implements PlacementTool {

    @Override
    public String getName() {
        return "preparation";
    }

    @Override
    public String getDescription() {
        return "Extracts company-specific round patterns.";
    }

    @Override
    public String execute(String context) {
        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"preparation\",\n" +
               "      \"title\": \"Company Interview Preparation\",\n" +
               "      \"data\": {\n" +
               "        \"companyName\": \"TCS (Tata Consultancy Services)\",\n" +
               "        \"rounds\": [\"Aptitude Test\", \"Technical Interview\", \"Managerial Round\"]\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
