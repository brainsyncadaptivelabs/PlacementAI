package com.aiplacement.backend.ai;

public class FollowUpPlanner {
    public String planFollowUp() {
        return "FOLLOW-UP ACTION PLANNING RULES:\n" +
               "Always conclude the response with a context-aware next step:\n" +
               "- Suggest continuing the active roadmap if they asked about learning path.\n" +
               "- Suggest correcting weak skills or practicing LeetCode problems.\n" +
               "- Suggest scheduling a mock interview or resume optimization.\n" +
               "Provide clear estimated readiness impact metrics (e.g. 'Estimated +15 improvement' or 'Estimated +10 confidence') for recommended actions.\n\n";
    }
}
