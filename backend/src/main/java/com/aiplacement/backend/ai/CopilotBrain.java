package com.aiplacement.backend.ai;

import com.aiplacement.backend.ai.intelligence.CareerIntelligenceEngine;
import com.aiplacement.backend.ai.multimodal.AnalysisResult;
import java.util.List;

public class CopilotBrain {
    private final IntentAnalyzer intentAnalyzer = new IntentAnalyzer();
    private final ContextAnalyzer contextAnalyzer = new ContextAnalyzer();
    private final ExpertSelector expertSelector = new ExpertSelector();
    private final ComplexityAnalyzer complexityAnalyzer = new ComplexityAnalyzer();
    private final VisualizationPlanner visualizationPlanner = new VisualizationPlanner();
    private final ResponsePlanner responsePlanner = new ResponsePlanner();
    private final ResourcePlanner resourcePlanner = new ResourcePlanner();
    private final FollowUpPlanner followUpPlanner = new FollowUpPlanner();
    private final PromptComposer promptComposer = new PromptComposer();
    private final CareerIntelligenceEngine careerIntelligenceEngine = new CareerIntelligenceEngine();

    public String planResponsePrompt(PromptContext context) {
        List<String> intents = intentAnalyzer.analyzeIntents(context);
        String studentContext = contextAnalyzer.analyzeContext(context);
        String experts = expertSelector.selectExperts(intents);
        String complexity = complexityAnalyzer.analyzeComplexity(intents);
        String visualizations = visualizationPlanner.planVisualizations(intents);
        String responseRules = responsePlanner.planResponse();
        String resourceRules = resourcePlanner.planResources();
        String followUpRules = followUpPlanner.planFollowUp();

        String identity = promptComposer.composeIdentity();
        String formatting = promptComposer.composeFormatting();
        String staticIntel = promptComposer.composeCareerIntelligence();
        String autonomousIntel = careerIntelligenceEngine.generateCareerIntelligencePrompt(context);
        String memory = promptComposer.composeMemory(context.getHistory());

        List<AnalysisResult> analysis = context.getAnalysisResults();
        StringBuilder filePrompt = new StringBuilder();
        if (analysis != null && !analysis.isEmpty()) {
            filePrompt.append("\n=========================================\n");
            filePrompt.append("MULTIMODAL UPLOAD ANALYSIS (USE AND EXPLAIN THIS DATA CONTEXT IN YOUR RESPONSE):\n");
            for (AnalysisResult res : analysis) {
                filePrompt.append("- Document Summary: ").append(res.getSummary()).append("\n");
                filePrompt.append("- Important Points:\n");
                for (String p : res.getKeyFindings()) {
                    filePrompt.append("  * ").append(p).append("\n");
                }
                filePrompt.append("- Suggested Action Recommendations:\n");
                for (String r : res.getRecommendations()) {
                    filePrompt.append("  * ").append(r).append("\n");
                }
                filePrompt.append("- Suggested Interactive Widgets: ").append(String.join(", ", res.getSuggestedWidgets())).append("\n");
                filePrompt.append("- Suggested Next Actions / Follow-ups:\n");
                for (String f : res.getFollowUps()) {
                    filePrompt.append("  * ").append(f).append("\n");
                }
                if (res.getTags() != null && !res.getTags().isEmpty()) {
                    filePrompt.append("- Automatic Widget Mapping Instructions: ");
                    if (res.getTags().contains("Resume")) {
                        filePrompt.append("Combine 'heatmap', 'radar', 'recommendations', and 'checklist' widgets in a stack layout.\n");
                    } else if (res.getTags().contains("Code")) {
                        filePrompt.append("Combine 'insight', 'recommendations', and 'expandable' widgets.\n");
                    } else if (res.getTags().contains("PDF")) {
                        filePrompt.append("Combine 'roadmap', 'timeline', and 'checklist' widgets.\n");
                    } else if (res.getTags().contains("Diagram")) {
                        filePrompt.append("Combine 'flow' and 'mindmap' widgets or output raw Mermaid block diagrams.\n");
                    }
                }
                filePrompt.append("\n");
            }
            filePrompt.append("=========================================\n\n");
        }

        return promptComposer.composeFinalPrompt(
            identity,
            studentContext,
            experts + complexity,
            responseRules + visualizations,
            followUpRules,
            formatting,
            resourceRules,
            staticIntel + autonomousIntel + filePrompt.toString(),
            memory,
            context.getQuestion()
        );
    }
}
