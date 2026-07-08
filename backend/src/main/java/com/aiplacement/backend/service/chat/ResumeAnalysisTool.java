package com.aiplacement.backend.service.chat;

import org.springframework.stereotype.Component;

@Component
public class ResumeAnalysisTool implements PlacementTool {

    @Override
    public String getName() {
        return "resume-analysis";
    }

    @Override
    public String getDescription() {
        return "Extracts resume strengths and weaknesses for ATS optimization.";
    }

    @Override
    public String execute(String context) {
        return "{\n" +
               "  \"widgets\": [\n" +
               "    {\n" +
               "      \"type\": \"comparison\",\n" +
               "      \"title\": \"ATS Resume Improvements\",\n" +
               "      \"data\": {\n" +
               "        \"score\": 85,\n" +
               "        \"strengths\": [\"Clear layout and formatting\", \"Relevant technical skills section included\"],\n" +
               "        \"weaknesses\": [\"Metrics are not quantified\", \"GitHub links are missing\"],\n" +
               "        \"recommendations\": [\"Quantify bullet points with action verbs\", \"Include your active GitHub link\"]\n" +
               "      }\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
