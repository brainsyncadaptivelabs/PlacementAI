package com.aiplacement.backend.service.interview.refactored;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@Lazy
public class MockAIProvider implements AIProvider {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model) {
        if (userPrompt.contains("nextQuestion")) {
            return "This is a mock question text.";
        }
        return "Mock plain text response.";
    }

    @Override
    public JsonNode generateJson(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model) {
        String json = "{}";
        try {
            if (userPrompt.contains("resumeText") && userPrompt.contains("technologyGraph")) {
                // Resume analysis
                json = "{\n" +
                        "  \"candidateExperience\": \"Senior (5 years)\",\n" +
                        "  \"primaryRole\": \"Software Architect\",\n" +
                        "  \"secondaryRole\": \"Java Engineer\",\n" +
                        "  \"strengths\": [\"System Design\", \"Concurrency\"],\n" +
                        "  \"weaknesses\": [\"CSS styling\"],\n" +
                        "  \"projects\": [\n" +
                        "    { \"name\": \"DataSync\", \"description\": \"Scalable pipeline\", \"technologiesUsed\": [\"Java\", \"Kafka\"] }\n" +
                        "  ],\n" +
                        "  \"technologyGraph\": {\n" +
                        "    \"languages\": [\"Java\", \"SQL\"],\n" +
                        "    \"frameworks\": [\"Spring Boot\"],\n" +
                        "    \"databases\": [\"PostgreSQL\"],\n" +
                        "    \"tools\": [\"Docker\", \"Kafka\"]\n" +
                        "  },\n" +
                        "  \"missingSkills\": [\"GraphQL\"],\n" +
                        "  \"learningGaps\": [\"High scalability microservices\"],\n" +
                        "  \"inferredConfidenceLevel\": 85,\n" +
                        "  \"inferredCommunicationLevel\": 80,\n" +
                        "  \"expectedInterviewLevel\": \"Senior\",\n" +
                        "  \"targetIndustry\": \"Fintech\",\n" +
                        "  \"careerTrajectory\": \"Architect\"\n" +
                        "}";
            } else if (userPrompt.contains("requiredSkills") && userPrompt.contains("hiddenExpectations")) {
                // JD analysis
                json = "{\n" +
                        "  \"requiredSkills\": [\"Java\", \"Spring Boot\"],\n" +
                        "  \"hiddenExpectations\": \"Autonomous task handling\",\n" +
                        "  \"companyCulture\": \"High speed execution\",\n" +
                        "  \"difficulty\": \"Medium\",\n" +
                        "  \"behavioralExpectations\": [\"Ownership\"],\n" +
                        "  \"leadershipExpectations\": [\"Mentoring juniors\"],\n" +
                        "  \"communicationExpectations\": \"Fluent technical explanation\",\n" +
                        "  \"technologyImportance\": {\n" +
                        "    \"languages\": [\"Java\"],\n" +
                        "    \"frameworks\": [\"Spring Boot\"],\n" +
                        "    \"databases\": [\"PostgreSQL\"]\n" +
                        "  },\n" +
                        "  \"mustHaveSkills\": [\"Java\"],\n" +
                        "  \"goodToHaveSkills\": [\"Docker\"],\n" +
                        "  \"hiringPriorities\": [\"Technical skills\", \"Communication\"]\n" +
                        "}";
            } else if (userPrompt.contains("interviewDurationMinutes") || userPrompt.contains("Blueprint")) {
                // Blueprint
                json = "{\n" +
                        "  \"role\": \"Senior Software Architect\",\n" +
                        "  \"interviewDurationMinutes\": 45,\n" +
                        "  \"questionBudget\": 5,\n" +
                        "  \"sections\": [\"INTRODUCTION\", \"TECHNICAL\", \"CODING\", \"BEHAVIORAL\"],\n" +
                        "  \"difficultyProgression\": \"Progressive\",\n" +
                        "  \"targetCompetencies\": [\"Concurrency\", \"Algorithms\"],\n" +
                        "  \"evaluationRubric\": \"Standard architectural rubric\",\n" +
                        "  \"codingRoundsCount\": 1,\n" +
                        "  \"systemDesignRoundsCount\": 0,\n" +
                        "  \"behavioralRoundsCount\": 1\n" +
                        "}";
            } else if (userPrompt.contains("nextQuestion")) {
                // Question generation
                json = "{\n" +
                        "  \"nextQuestion\": \"Explain the difference between HashMap and ConcurrentHashMap.\",\n" +
                        "  \"activeInterviewer\": \"Technical Interviewer\",\n" +
                        "  \"expectedResponseFocus\": \"thread-safety, locking segmentations\",\n" +
                        "  \"clarificationTriggered\": false,\n" +
                        "  \"confidenceScore\": 95\n" +
                        "}";
            } else if (userPrompt.contains("evaluatedScore") || userPrompt.contains("technicalScore")) {
                // Answer evaluation
                json = "{\n" +
                        "  \"evaluatedScore\": 85,\n" +
                        "  \"technicalScore\": 85,\n" +
                        "  \"communicationScore\": 80,\n" +
                        "  \"confidenceScore\": 85,\n" +
                        "  \"problemSolvingScore\": 85,\n" +
                        "  \"codingScore\": 80,\n" +
                        "  \"behavioralScore\": 80,\n" +
                        "  \"roleReadiness\": 85,\n" +
                        "  \"clarityLow\": false,\n" +
                        "  \"needsClarification\": false,\n" +
                        "  \"emotionAnalysis\": {\n" +
                        "    \"sentiment\": \"Positive\",\n" +
                        "    \"tone\": \"Confident\",\n" +
                        "    \"hesitationIndex\": 0.05\n" +
                        "  },\n" +
                        "  \"knowledgeUpdates\": [],\n" +
                        "  \"reasoningQuality\": \"High\",\n" +
                        "  \"confidenceScoreLLM\": 90,\n" +
                        "  \"comments\": \"Solid answer matching core concurrency specifications.\"\n" +
                        "}";
            } else if (userPrompt.contains("starFormatScore") || userPrompt.contains("Behavioral Recruiter")) {
                // Behavioral analysis
                json = "{\n" +
                        "  \"starFormatScore\": 85,\n" +
                        "  \"leadershipIndex\": 80,\n" +
                        "  \"ownershipIndex\": 85,\n" +
                        "  \"communicationIndex\": 80,\n" +
                        "  \"hesitationScore\": 10,\n" +
                        "  \"decisionMakingMaturity\": \"Mature\",\n" +
                        "  \"starBreakdown\": { \"situation\": \"Explained context\", \"task\": \"Described goal\", \"action\": \"Active contribution\", \"result\": \"Quantitative success\" },\n" +
                        "  \"leadershipEvidence\": \"Led deployment migration\",\n" +
                        "  \"ownershipEvidence\": \"Took blame for sync fail\",\n" +
                        "  \"comments\": \"Strong performance matching behavioral expectations.\",\n" +
                        "  \"confidenceScore\": 90,\n" +
                        "  \"reasoningQuality\": \"High\"\n" +
                        "}";
            } else if (userPrompt.contains("correctnessScore") || userPrompt.contains("Complexity Engine")) {
                // Coding evaluation
                json = "{\n" +
                        "  \"correctnessScore\": 90,\n" +
                        "  \"edgeCaseScore\": 85,\n" +
                        "  \"complexityScore\": 80,\n" +
                        "  \"readabilityScore\": 90,\n" +
                        "  \"namingConventionScore\": 90,\n" +
                        "  \"productionReadinessScore\": 85,\n" +
                        "  \"securityScore\": 95,\n" +
                        "  \"optimizationScore\": 80,\n" +
                        "  \"timeComplexity\": \"O(N)\",\n" +
                        "  \"spaceComplexity\": \"O(1)\",\n" +
                        "  \"edgeCasesMissed\": [],\n" +
                        "  \"securityVulnerabilities\": [],\n" +
                        "  \"optimizationsSuggested\": [],\n" +
                        "  \"alternativeApproachSummary\": \"Using sliding window\",\n" +
                        "  \"comments\": \"Optimal logic with neat structure.\",\n" +
                        "  \"confidenceScore\": 95,\n" +
                        "  \"reasoningQuality\": \"High\"\n" +
                        "}";
            } else if (userPrompt.contains("systemDesignRounds") || userPrompt.contains("System Design Expert")) {
                // System design evaluation
                json = "{\n" +
                        "  \"scalabilityScore\": 85,\n" +
                        "  \"databaseChoiceScore\": 80,\n" +
                        "  \"capUnderstandingScore\": 90,\n" +
                        "  \"cachingConsistencyScore\": 85,\n" +
                        "  \"availabilityScore\": 85,\n" +
                        "  \"loadBalancingScore\": 80,\n" +
                        "  \"failureRecoveryScore\": 75,\n" +
                        "  \"tradeoffsSpelledOut\": \"Consistency preferred over performance\",\n" +
                        "  \"architecturalFlaws\": [],\n" +
                        "  \"comments\": \"Robust distributed architecture.\",\n" +
                        "  \"confidenceScore\": 90,\n" +
                        "  \"reasoningQuality\": \"High\"\n" +
                        "}";
            } else if (userPrompt.contains("estimatedWeeks") || userPrompt.contains("weekly learning roadmap")) {
                // Learning roadmap
                json = "{\n" +
                        "  \"estimatedWeeks\": 8,\n" +
                        "  \"dailyHours\": 3,\n" +
                        "  \"milestones\": [\n" +
                        "    { \"week\": 1, \"topic\": \"Java Concurrency\", \"focus\": \"Locking mechanisms\", \"readingMaterialsSuggestion\": \"Java Concurrency in Practice\", \"codingExercisesSuggestion\": \"ThreadPool execution tasks\", \"milestoneProject\": \"Concurrent Task Dispatcher\" }\n" +
                        "  ],\n" +
                        "  \"revisionPlan\": \"Review week 1 lessons in week 4\",\n" +
                        "  \"interviewReadinessEvaluation\": \"Expect readiness increase by 20%\",\n" +
                        "  \"confidenceScore\": 90,\n" +
                        "  \"reasoningQuality\": \"High\"\n" +
                        "}";
            } else if (userPrompt.contains("hiringDecision") || userPrompt.contains("Hiring Verdict")) {
                // Hiring recommendation
                json = "{\n" +
                        "  \"hiringDecision\": \"Strong Hire\",\n" +
                        "  \"reasonsForVerdict\": [\"Exceptional concurrency knowledge\"],\n" +
                        "  \"hiringRisks\": [\"Over-engineering basic components\"],\n" +
                        "  \"candidatePotentialDescription\": \"High career growth candidate\",\n" +
                        "  \"recommendedGrowthAreas\": [\"CSS layouts\"],\n" +
                        "  \"confidenceScore\": 90,\n" +
                        "  \"reasoningQuality\": \"High\"\n" +
                        "}";
            } else if (userPrompt.contains("finalAssessment") || userPrompt.contains("report card")) {
                // Feedback report compilation
                json = "{\n" +
                        "  \"totalScore\": 80,\n" +
                        "  \"finalAssessment\": \"Detailed performance assessment report.\",\n" +
                        "  \"strengths\": [\"Problem solving\"],\n" +
                        "  \"areasForImprovement\": [\"Front-end technologies\"],\n" +
                        "  \"bodyLanguageTips\": [\"Speak at a consistent pace\"],\n" +
                        "  \"missedTopics\": [\"Flexbox Layouts\"],\n" +
                        "  \"companyReadiness\": 80,\n" +
                        "  \"hiringProbability\": 85,\n" +
                        "  \"expectedSalary\": \"8.5 - 12.0 LPA\",\n" +
                        "  \"recruiterVerdict\": \"Strong Candidate\",\n" +
                        "  \"finalRecommendation\": \"Highly recommended\",\n" +
                        "  \"candidateSummary\": \"The candidate performed exceptionally in Java questions.\",\n" +
                        "  \"technicalAbilityComment\": \"Strong core concepts\",\n" +
                        "  \"communicationComment\": \"Articulate speaker\",\n" +
                        "  \"leadershipComment\": \"Aligned with ownership metrics\",\n" +
                        "  \"problemSolvingComment\": \"Highly analytical\",\n" +
                        "  \"cultureFitComment\": \"Aligned with transparency\",\n" +
                        "  \"teamFitComment\": \"Good teammate\",\n" +
                        "  \"riskAssessment\": \"Low risk profile\",\n" +
                        "  \"recruiterNotes\": \"Good candidate\",\n" +
                        "  \"interviewConfidence\": 85,\n" +
                        "  \"questionComments\": [\"Perfect answer\", \"Good response\"]\n" +
                        "}";
            }
            return objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("MockAIProvider parsing failed", e);
        }
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model) {
        return Flux.just("Mock ", "streaming ", "tokens ", "for ", "the ", "interview.");
    }

    @Override
    public String getProviderName() {
        return "Mock";
    }
}
