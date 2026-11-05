package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class CareerRoadmapTool implements PlacementTool {

    @Override
    public String getName() {
        return "career-roadmap";
    }

    @Override
    public String getDescription() {
        return "Provides dynamic target goals roadmap for student readiness";
    }

    @Override
    public String execute(String context) {
        // Return structured roadmap nodes
        return "{\n" +
               "  \"version\": 1,\n" +
               "  \"schema\": \"placementai-widget-container\",\n" +
               "  \"layout\": \"stack\",\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"id\": \"career-roadmap-widget\",\n" +
               "      \"type\": \"roadmap\",\n" +
               "      \"priority\": 1,\n" +
               "      \"title\": \"AI Recommended Preparation Blueprint\",\n" +
               "      \"data\": {\n" +
               "        \"nodes\": [\n" +
               "          { \"id\": \"1\", \"title\": \"Java Fundamentals & OOP\", \"duration\": \"1 Week\", \"status\": \"completed\" },\n" +
               "          { \"id\": \"2\", \"title\": \"Data Structures & Algorithms\", \"duration\": \"2 Weeks\", \"status\": \"in_progress\" },\n" +
               "          { \"id\": \"3\", \"title\": \"Spring Boot Rest APIs\", \"duration\": \"2 Weeks\", \"status\": \"locked\" }\n" +
               "        ]\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
