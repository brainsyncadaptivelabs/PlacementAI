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
               "  \"version\": 1,\n" +
               "  \"schema\": \"placementai-widget-container\",\n" +
               "  \"layout\": \"stack\",\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"id\": \"tcs-prep-widget\",\n" +
               "      \"type\": \"pipeline\",\n" +
               "      \"priority\": 1,\n" +
               "      \"title\": \"TCS Interview Process Funnel\",\n" +
               "      \"data\": {\n" +
               "        \"title\": \"TCS (Tata Consultancy Services) Hiring Stages\",\n" +
               "        \"stages\": [\n" +
               "          { \"name\": \"Aptitude Test\", \"status\": \"active\" },\n" +
               "          { \"name\": \"Technical Interview\", \"status\": \"pending\" },\n" +
               "          { \"name\": \"Managerial Round\", \"status\": \"pending\" }\n" +
               "        ]\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
