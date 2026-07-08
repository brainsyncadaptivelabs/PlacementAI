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
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"coding\",\n" +
               "      \"title\": \"DSA Coding Practice\",\n" +
               "      \"data\": {\n" +
               "        \"problemName\": \"Two Sum (Array)\",\n" +
               "        \"difficulty\": \"Easy\",\n" +
               "        \"acceptance\": \"49.6%\"\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
