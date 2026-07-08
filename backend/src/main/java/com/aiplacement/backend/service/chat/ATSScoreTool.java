package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class ATSScoreTool implements PlacementTool {

    @Override
    public String getName() {
        return "ats-score";
    }

    @Override
    public String getDescription() {
        return "Calculates keywords matching ratio against standard templates.";
    }

    @Override
    public String execute(String context) {
        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"progress\",\n" +
               "      \"title\": \"ATS Match Rating\",\n" +
               "      \"data\": {\n" +
               "        \"score\": 78,\n" +
               "        \"label\": \"Strong Match for Software Engineer\",\n" +
               "        \"status\": \"success\"\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
