package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.InterviewEvaluation;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.service.interview.memory.CandidateKnowledgeGraphService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewEvaluationEngineImpl implements InterviewEvaluationEngine {

    private final CompetencyScoringEngine competencyScoringEngine;
    private final EvidenceExtractionEngine evidenceExtractionEngine;
    private final HiringRecommendationEngine hiringRecommendationEngine;
    private final LearningRecommendationEngine learningRecommendationEngine;
    private final ScoringAggregationEngine scoringAggregationEngine;
    private final EvaluationPersistenceService evaluationPersistenceService;
    private final AIClient aiClient;
    private final CandidateKnowledgeGraphService candidateKnowledgeGraphService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public InterviewEvaluation runEvaluationPipeline(MockInterview interview) {
        long start = System.currentTimeMillis();
        String role = interview.getRole() != null ? interview.getRole() : "Software Engineer";

        log.info("[EVAL] [PIPELINE] Starting evaluation pipeline for interview ID: {}, role: {}", interview.getId(), role);

        try {
            // Step 1: Collect all answered questions
            List<InterviewQuestion> questions = interview.getQuestions();
            if (questions == null || questions.isEmpty()) {
                log.warn("[EVAL] [PIPELINE] No questions found for interview ID: {}", interview.getId());
                return null;
            }

            // Step 2: Score competencies across all Q&A pairs
            Map<String, Object> aggregatedScores = new HashMap<>();
            aggregatedScores.put("technicalScore", 50.0);
            aggregatedScores.put("behavioralScore", 50.0);
            aggregatedScores.put("communicationScore", 50.0);
            aggregatedScores.put("leadershipScore", 50.0);
            aggregatedScores.put("reasoningScore", 50.0);
            aggregatedScores.put("architectureScore", 50.0);

            List<Map<String, Object>> allTechDetails = new ArrayList<>();
            List<Map<String, Object>> allBehDetails = new ArrayList<>();
            List<Map<String, Object>> allCommDetails = new ArrayList<>();
            List<Map<String, Object>> allLeadDetails = new ArrayList<>();
            List<Map<String, Object>> allReasonDetails = new ArrayList<>();
            int answeredCount = 0;

            for (InterviewQuestion q : questions) {
                if (q.getAnswerText() == null || q.getAnswerText().isBlank()) continue;
                answeredCount++;
                int difficulty = 5; // Default difficulty - InterviewQuestion does not track per-question difficulty

                Map<String, Object> competencyScores = competencyScoringEngine.scoreCompetencies(
                        interview, q.getQuestionText(), q.getAnswerText(), role, difficulty);

                // Rolling average
                mergeAverage(aggregatedScores, competencyScores, "technicalScore", answeredCount);
                mergeAverage(aggregatedScores, competencyScores, "behavioralScore", answeredCount);
                mergeAverage(aggregatedScores, competencyScores, "communicationScore", answeredCount);
                mergeAverage(aggregatedScores, competencyScores, "leadershipScore", answeredCount);
                mergeAverage(aggregatedScores, competencyScores, "reasoningScore", answeredCount);
                mergeAverage(aggregatedScores, competencyScores, "architectureScore", answeredCount);

                // Collect sub-details for last question (representative)
                if (competencyScores.containsKey("technicalDetails")) allTechDetails.add(castMap(competencyScores.get("technicalDetails")));
                if (competencyScores.containsKey("behavioralDetails")) allBehDetails.add(castMap(competencyScores.get("behavioralDetails")));
                if (competencyScores.containsKey("communicationDetails")) allCommDetails.add(castMap(competencyScores.get("communicationDetails")));
                if (competencyScores.containsKey("leadershipDetails")) allLeadDetails.add(castMap(competencyScores.get("leadershipDetails")));
                if (competencyScores.containsKey("reasoningDetails")) allReasonDetails.add(castMap(competencyScores.get("reasoningDetails")));
            }

            if (answeredCount == 0) {
                log.warn("[EVAL] [PIPELINE] No answered questions for interview ID: {}", interview.getId());
                return null;
            }

            // Step 3: Evidence extraction from last answered question
            InterviewQuestion lastQ = questions.stream()
                    .filter(q -> q.getAnswerText() != null && !q.getAnswerText().isBlank())
                    .reduce((a, b) -> b).orElse(questions.get(0));

            String competencyList = "Technical Knowledge, Problem Solving, Communication, Leadership, Architecture Thinking, Reasoning";
            String evidenceJson = evidenceExtractionEngine.extractEvidence(lastQ, lastQ.getAnswerText(), competencyList);

            // Step 4: Build representative sub-detail maps (average of all rounds)
            Map<String, Object> techDetails = averageDetailList(allTechDetails);
            Map<String, Object> behDetails = averageDetailList(allBehDetails);
            Map<String, Object> commDetails = averageDetailList(allCommDetails);
            Map<String, Object> leadDetails = averageDetailList(allLeadDetails);
            Map<String, Object> reasonDetails = averageDetailList(allReasonDetails);

            aggregatedScores.put("technicalDetails", techDetails);
            aggregatedScores.put("behavioralDetails", behDetails);
            aggregatedScores.put("communicationDetails", commDetails);
            aggregatedScores.put("leadershipDetails", leadDetails);
            aggregatedScores.put("reasoningDetails", reasonDetails);

            // Step 5: Dynamic scoring aggregation by role
            Map<String, Object> finalScores = scoringAggregationEngine.aggregate(aggregatedScores, role);

            // Step 6: Hiring decision
            String aggregatedJson = objectMapper.writeValueAsString(finalScores);
            String hiringJson = hiringRecommendationEngine.generateDecision(interview, aggregatedJson, role);

            // Step 7: Skill gap identification
            String skillGapsJson = buildSkillGapsJson(finalScores);

            // Step 8: Learning roadmap
            String roadmapJson = learningRecommendationEngine.generateRoadmap(interview, skillGapsJson, role);

            // Step 8b: Evaluate soft skills & behavioral competencies via LLM
            JsonNode softCompetenciesNode = evaluateSoftCompetencies(questions, role);

            // Step 9: Build full evaluation payload
            Map<String, Object> fullEval = new HashMap<>(finalScores);
            fullEval.put("evaluationConfidence", computeConfidence(answeredCount, questions.size()));
            fullEval.put("answeredQuestions", answeredCount);
            fullEval.put("totalQuestions", questions.size());
            fullEval.put("hiringDecision", objectMapper.readValue(hiringJson, Map.class));
            fullEval.put("learningRoadmap", objectMapper.readValue(roadmapJson, Map.class));

            // Populate evidence list (combine technical evidence with soft evidence)
            List<Map<String, Object>> evidenceList = new ArrayList<>();
            JsonNode existingEvidence = objectMapper.readTree(evidenceJson);
            if (existingEvidence.isArray()) {
                for (JsonNode e : existingEvidence) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("competency", e.path("competency").asText("General"));
                    map.put("evidenceText", e.path("evidenceText").asText(""));
                    map.put("sourceQuestion", e.path("sourceQuestion").asText(""));
                    map.put("sourceAnswer", e.path("sourceAnswer").asText(""));
                    evidenceList.add(map);
                }
            }

            List<Map<String, Object>> reasoningList = new ArrayList<>();
            List<Map<String, Object>> improvementsList = new ArrayList<>();

            // Parse and append the 11 soft competencies details
            List<Map<String, Object>> competencyScores = buildCompetencyScoreList(finalScores);
            if (softCompetenciesNode.isArray()) {
                for (JsonNode node : softCompetenciesNode) {
                    String compName = node.path("competency").asText();
                    double compScore = node.path("score").asDouble(60.0);
                    double compConf = node.path("confidence").asDouble(70.0);
                    String compEvidence = node.path("evidence").asText("");
                    String compReason = node.path("reasoning").asText("");
                    String compSuggest = node.path("improvementSuggestion").asText("");

                    // 1. Competency Score
                    Map<String, Object> cs = new HashMap<>();
                    cs.put("competency", compName);
                    cs.put("score", compScore);
                    cs.put("confidence", compConf);
                    cs.put("trend", "STABLE");
                    competencyScores.add(cs);

                    // 2. Evidence
                    Map<String, Object> ev = new HashMap<>();
                    ev.put("competency", compName);
                    ev.put("evidenceText", compEvidence);
                    ev.put("sourceQuestion", "");
                    ev.put("sourceAnswer", "");
                    evidenceList.add(ev);

                    // 3. Reasoning
                    Map<String, Object> re = new HashMap<>();
                    re.put("competency", compName);
                    re.put("reasoningText", compReason);
                    reasoningList.add(re);

                    // 4. Improvement Suggestion
                    Map<String, Object> imp = new HashMap<>();
                    imp.put("improvementArea", compName);
                    imp.put("suggestion", compSuggest);
                    improvementsList.add(imp);
                }
            }

            fullEval.put("evidence", evidenceList);
            fullEval.put("competencyScores", competencyScores);
            fullEval.put("reasoningList", reasoningList);
            fullEval.put("improvementsList", improvementsList);

            // Parse skill gaps for persistence
            fullEval.put("skillGaps", objectMapper.readTree(skillGapsJson));

            String fullEvalJson = objectMapper.writeValueAsString(fullEval);

            // Step 10: Persist everything
            InterviewEvaluation saved = evaluationPersistenceService.persist(interview, fullEvalJson, role);

            // Step 11: Update candidate Knowledge Graph
            try {
                User user = interview.getUser();
                if (user != null) {
                    ObjectNode kgNode = objectMapper.createObjectNode();
                    ArrayNode skillsArray = kgNode.putArray("skills");
                    skillsArray.add("STAR Framework");
                    skillsArray.add("Communication Clarity");
                    skillsArray.add("Professionalism");
                    skillsArray.add("Leadership");
                    skillsArray.add("Ownership");
                    skillsArray.add("Teamwork");
                    skillsArray.add("Problem Solving");
                    skillsArray.add("Critical Thinking");
                    skillsArray.add("Listening Ability");
                    skillsArray.add("Response Quality");

                    ArrayNode conceptsArray = kgNode.putArray("concepts");
                    conceptsArray.add("Behavioral Competency");
                    conceptsArray.add("Confidence Trend");
                    
                    candidateKnowledgeGraphService.updateGraph(user, kgNode);
                    log.info("[EVAL] [PIPELINE] Updated Candidate Knowledge Graph with behavioral nodes.");
                }
            } catch (Exception kgEx) {
                log.warn("[EVAL] [PIPELINE] Knowledge Graph update failed: {}", kgEx.getMessage());
            }

            long elapsed = System.currentTimeMillis() - start;
            log.info("[EVAL] [PIPELINE] Completed evaluation pipeline for interview ID: {} in {}ms. Score: {}, Decision: {}",
                    interview.getId(), elapsed, finalScores.get("weightedOverallScore"),
                    objectMapper.readTree(hiringJson).path("decision").asText("Unknown"));

            return saved;

        } catch (Exception e) {
            log.error("[EVAL] [PIPELINE] Pipeline failed for interview ID: {}. Error: {}", interview.getId(), e.getMessage());
            return null;
        }
    }

    private void mergeAverage(Map<String, Object> target, Map<String, Object> source, String key, int count) {
        double prev = extractDouble(target, key);
        double curr = extractDouble(source, key);
        target.put(key, ((prev * (count - 1)) + curr) / count);
    }

    private double extractDouble(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v instanceof Number) return ((Number) v).doubleValue();
        return 50.0;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object obj) {
        if (obj instanceof Map) return (Map<String, Object>) obj;
        return new HashMap<>();
    }

    private Map<String, Object> averageDetailList(List<Map<String, Object>> list) {
        if (list.isEmpty()) return new HashMap<>();
        Map<String, Object> result = new HashMap<>();
        for (Map<String, Object> m : list) {
            m.forEach((k, v) -> {
                if (v instanceof Number) {
                    result.merge(k, ((Number) v).doubleValue(), (a, b) -> ((Number) a).doubleValue() + ((Number) b).doubleValue());
                }
            });
        }
        int n = list.size();
        result.replaceAll((k, v) -> v instanceof Number ? ((Number) v).doubleValue() / n : v);
        return result;
    }

    private double computeConfidence(int answered, int total) {
        if (total == 0) return 0;
        double ratio = (double) answered / total;
        return Math.min(95.0, 40.0 + ratio * 55.0);
    }

    private String buildSkillGapsJson(Map<String, Object> scores) {
        try {
            List<Map<String, Object>> gaps = new ArrayList<>();
            addGapIfLow(gaps, "Technical Knowledge", scores, "technicalScore", 75);
            addGapIfLow(gaps, "Communication", scores, "communicationScore", 70);
            addGapIfLow(gaps, "Leadership", scores, "leadershipScore", 65);
            addGapIfLow(gaps, "Architecture", scores, "architectureScore", 65);
            addGapIfLow(gaps, "Reasoning", scores, "reasoningScore", 70);
            addGapIfLow(gaps, "Behavioral", scores, "behavioralScore", 65);
            return objectMapper.writeValueAsString(gaps);
        } catch (Exception e) {
            return "[]";
        }
    }

    private void addGapIfLow(List<Map<String, Object>> gaps, String skill, Map<String, Object> scores, String key, double threshold) {
        double score = extractDouble(scores, key);
        if (score < threshold) {
            Map<String, Object> gap = new HashMap<>();
            gap.put("skill", skill);
            gap.put("currentLevel", Math.round(score * 10.0) / 10.0);
            gap.put("expectedLevel", threshold);
            gap.put("gap", Math.round((threshold - score) * 10.0) / 10.0);
            gap.put("priority", score < 50 ? 1 : 2);
            gap.put("estimatedImprovementTime", score < 50 ? "4-8 weeks" : "2-4 weeks");
            gap.put("trainingSuggestions", "Practice targeted exercises and review core concepts for " + skill);
            gaps.add(gap);
        }
    }

    private List<Map<String, Object>> buildCompetencyScoreList(Map<String, Object> scores) {
        List<Map<String, Object>> list = new ArrayList<>();
        String[][] competencies = {
            {"Technical Knowledge", "technicalScore"},
            {"Communication", "communicationScore"},
            {"Leadership", "leadershipScore"},
            {"Behavioral Competency", "behavioralScore"},
            {"Reasoning", "reasoningScore"},
            {"Architecture Thinking", "architectureScore"}
        };
        for (String[] pair : competencies) {
            Map<String, Object> cs = new HashMap<>();
            cs.put("competency", pair[0]);
            cs.put("score", extractDouble(scores, pair[1]));
            cs.put("confidence", 70.0);
            cs.put("trend", "STABLE");
            list.add(cs);
        }
        return list;
    }

    private JsonNode evaluateSoftCompetencies(List<InterviewQuestion> questions, String role) {
        StringBuilder qa = new StringBuilder();
        for (InterviewQuestion q : questions) {
            if (q.getAnswerText() == null || q.getAnswerText().isBlank()) continue;
            qa.append("Question: ").append(q.getQuestionText()).append("\n");
            qa.append("Answer: ").append(q.getAnswerText()).append("\n\n");
        }

        String prompt = """
                You are an expert talent acquisition advisor assessing a candidate's soft skills, behavioral competencies, and communication intelligence.
                
                ROLE: %s
                TRANSCRIPT:
                %s
                
                Evaluate the candidate's performance across exactly these 11 soft competencies:
                1. STAR Framework (situation, task, action, result structural clarity)
                2. Communication Clarity (word choice, structuring, articulation)
                3. Professionalism (tone, respectfulness, focus)
                4. Leadership (influencing, mentoring, taking charge)
                5. Ownership (taking responsibility, accountability)
                6. Teamwork (collaboration, conflict resolution mindset)
                7. Problem Solving (algorithmic breakdown, debugging)
                8. Critical Thinking (trade-off analysis, analytical deep dive)
                9. Confidence Trend (progression of self-assurance)
                10. Listening Ability (paying attention, answering directly)
                11. Response Quality (completeness, correctness, depth)
                
                Respond with ONLY valid JSON as a list/array of objects in this format:
                [
                  {
                    "competency": "<Competency Name>",
                    "score": <0-100>,
                    "confidence": <0-100>,
                    "reasoning": "<1-2 sentence explanation of reasoning>",
                    "evidence": "<specific quote or action from the candidate>",
                    "improvementSuggestion": "<actionable development advice>"
                  },
                  ...
                ]
                """.formatted(role, qa.toString());

        try {
            JsonNode response = aiClient.generateJson(
                    "You are a behavioral analyst. Respond ONLY with valid JSON array.",
                    prompt, 0.2, 3000, e -> defaultSoftCompetenciesJson());
            if (response != null && response.isArray() && response.size() > 0) {
                return response;
            }
        } catch (Exception e) {
            log.warn("[EVAL] [SOFT_SKILLS] AI evaluation failed, returning default: {}", e.getMessage());
        }
        try {
            return objectMapper.readTree(defaultSoftCompetenciesJson());
        } catch (Exception e) {
            return objectMapper.createArrayNode();
        }
    }

    private String defaultSoftCompetenciesJson() {
        return """
            [
              {"competency":"STAR Framework","score":60.0,"confidence":50.0,"reasoning":"Could not determine detail.","evidence":"N/A","improvementSuggestion":"Structure your answers using STAR method."},
              {"competency":"Communication Clarity","score":60.0,"confidence":50.0,"reasoning":"Could not determine detail.","evidence":"N/A","improvementSuggestion":"Speak clearly and use structured summaries."},
              {"competency":"Professionalism","score":70.0,"confidence":60.0,"reasoning":"Maintained formal dialogue.","evidence":"Formal tone observed.","improvementSuggestion":"Keep up the professional communication."},
              {"competency":"Leadership","score":60.0,"confidence":50.0,"reasoning":"Could not determine detail.","evidence":"N/A","improvementSuggestion":"Highlight lead roles or mentoring in project stories."},
              {"competency":"Ownership","score":60.0,"confidence":50.0,"reasoning":"Could not determine detail.","evidence":"N/A","improvementSuggestion":"Explain instances where you took end-to-end charge."},
              {"competency":"Teamwork","score":65.0,"confidence":50.0,"reasoning":"Expressed general collaborative intent.","evidence":"N/A","improvementSuggestion":"Mention cross-functional collaboration explicitly."},
              {"competency":"Problem Solving","score":60.0,"confidence":50.0,"reasoning":"Could not determine detail.","evidence":"N/A","improvementSuggestion":"Decompose complex architecture into modular components."},
              {"competency":"Critical Thinking","score":60.0,"confidence":50.0,"reasoning":"Could not determine detail.","evidence":"N/A","improvementSuggestion":"Discuss trade-offs and alternative strategies during questions."},
              {"competency":"Confidence Trend","score":65.0,"confidence":50.0,"reasoning":"Maintained steady delivery.","evidence":"N/A","improvementSuggestion":"Practice voice speaking to gain confidence."},
              {"competency":"Listening Ability","score":70.0,"confidence":60.0,"reasoning":"Attentive answering.","evidence":"Directly addressed query.","improvementSuggestion":"Listen carefully to question constraints."},
              {"competency":"Response Quality","score":60.0,"confidence":50.0,"reasoning":"Baseline answers provided.","evidence":"Answers present.","improvementSuggestion":"Deepen technical completeness of answers."}
            ]
            """;
    }
}
