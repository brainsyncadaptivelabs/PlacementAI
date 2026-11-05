package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class CodingPracticeTool implements PlacementTool {

    @Override
    public String getName() {
        return "coding-practice";
    }

    @Override
    public String getDescription() {
        return "Fetches standard code editor practice problems.";
    }

    @Override
    public String execute(String context) {
        return "{\n" +
               "  \"version\": 1,\n" +
               "  \"schema\": \"placementai-widget-container\",\n" +
               "  \"layout\": \"stack\",\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"id\": \"coding-practice-widget\",\n" +
               "      \"type\": \"checklist\",\n" +
               "      \"priority\": 1,\n" +
               "      \"title\": \"DSA Coding Practice\",\n" +
               "      \"data\": {\n" +
               "        \"title\": \"DSA Practice: Two Sum (Array)\",\n" +
               "        \"items\": [\n" +
               "          { \"id\": \"1\", \"text\": \"Solve Two Sum (Array) - Easy (49.6%)\", \"completed\": false },\n" +
               "          { \"id\": \"2\", \"text\": \"Optimize using Hash Map (O(n) time)\", \"completed\": false },\n" +
               "          { \"id\": \"3\", \"text\": \"Analyze space complexity O(n)\", \"completed\": false }\n" +
               "        ]\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
