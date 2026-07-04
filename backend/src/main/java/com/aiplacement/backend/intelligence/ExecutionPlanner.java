package com.aiplacement.backend.intelligence;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Simple execution planner that converts a detected {@link IntentEngine.IntentType}
 * and the aggregated {@link PlacementContext} into an ordered list of task identifiers.
 *
 * In a full implementation this would produce a richer Task object with dependencies.
 * For now we return a list of descriptive strings that downstream services can parse.
 */
@Service
public class ExecutionPlanner {

    /**
     * Plan execution steps for the given intent and context.
     *
     * @param intent  detected intent type
     * @param context unified placement context (currently unused but kept for future extensions)
     * @return ordered list of task names
     */
    public List<String> plan(IntentEngine.IntentType intent, PlacementContext context) {
        List<String> tasks = new ArrayList<>();
        switch (intent) {
            case RESUME_REVIEW:
                tasks.add("fetchUserProfile");
                tasks.add("gatherResumeData");
                tasks.add("runResumeScoringModel");
                tasks.add("generateResumeFeedback");
                break;
            case CAREER_ADVICE:
                tasks.add("fetchUserProfile");
                tasks.add("analyzeSkillGaps");
                tasks.add("suggestCareerPaths");
                break;
            case ROADMAP:
                tasks.add("fetchUserProfile");
                tasks.add("determineReadinessLevel");
                tasks.add("buildRoadmap");
                break;
            case COMPANY_COMPARISON:
                tasks.add("retrieveCompanyData");
                tasks.add("compareCompanies");
                break;
            case PLACEMENT_PREDICTION:
                tasks.add("gatherHistoricalPlacementData");
                tasks.add("runPlacementPredictionModel");
                break;
            case SIMPLE_QA:
                tasks.add("directAnswer");
                break;
            default:
                tasks.add("fallbackAnswer");
                break;
        }
        // Future: use fields from context to adjust/append tasks.
        return tasks;
    }
}
