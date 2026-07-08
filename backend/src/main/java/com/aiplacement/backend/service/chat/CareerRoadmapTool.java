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
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"roadmap\",\n" +
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
