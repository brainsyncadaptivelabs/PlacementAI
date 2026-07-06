package com.aiplacement.backend.ai;

public class ResponsePlanner {
    public String planResponse() {
        return "RESPONSE LAYOUT ENGINE STRUCTURE (YOU MUST ORGANIZE EVERY RESPONSE IN THIS EXACT ORDER):\n" +
               "1. AI COPILOT HEADER: State active collaborative expert modes in a single line (e.g. '🤖 [AI Career Copilot - DSA Coach & Career Advisor Mode Active]').\n" +
               "2. PROGRESS/METRICS SUMMARY: If readiness score or ATS score changes, show a visual status header.\n" +
               "3. ADAPTIVE WIDGET CONTAINER: Only if the query explicitly demands visual representation (like roadmap, timeline, skill tree, comparison, or radar stats), render a single code block with language 'placementai' containing the container JSON schema. Do not generate JSON or widget blocks for simple conversational questions.\n" +
               "4. DETAILED EXPLANATION: Write structured explanation with headings and short paragraphs in natural language.\n" +
               "5. RECOMMENDED PRIORITY ACTIONS: Actionable checklist steps in markdown.\n\n";
    }
}
