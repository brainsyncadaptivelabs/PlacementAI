package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class ATSAnalysisTool implements PlacementTool {

    @Override
    public String getName() {
        return "ats-analysis";
    }

    @Override
    public String getDescription() {
        return "Executes Resume compliance calculations";
    }

    @Override
    public String execute(String context) {
        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"progress\",\n" +
               "      \"title\": \"Resume ATS Performance Metric\",\n" +
               "      \"data\": {\n" +
               "        \"score\": 82,\n" +
               "        \"label\": \"Ready for Software Engineer Role\",\n" +
               "        \"status\": \"success\"\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
