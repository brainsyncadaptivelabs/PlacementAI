package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.ai.PromptContext;

public class CareerIntelligenceEngine {
    private final PlacementPredictor placementPredictor = new PlacementPredictor();
    private final SkillGapEngine skillGapEngine = new SkillGapEngine();
    private final CompanyFitEngine companyFitEngine = new CompanyFitEngine();
    private final LearningPlanner learningPlanner = new LearningPlanner();

    public String generateCareerIntelligencePrompt(PromptContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n=========================================\n");
        sb.append("AUTONOMOUS CAREER COACHING INTELLIGENCE & EVALUATION:\n");
        sb.append(placementPredictor.predictCompanyReadiness(context));
        sb.append(skillGapEngine.analyzeSkillGaps(context));
        sb.append(companyFitEngine.evaluateCompanyFit(context));
        sb.append(learningPlanner.planSchedules(context));
        sb.append("=========================================\n\n");
        return sb.toString();
    }
}
