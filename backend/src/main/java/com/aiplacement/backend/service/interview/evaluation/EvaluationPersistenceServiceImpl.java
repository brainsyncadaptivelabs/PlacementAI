package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.evaluation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EvaluationPersistenceServiceImpl implements EvaluationPersistenceService {

    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewCompetencyScoreRepository competencyScoreRepository;
    private final InterviewEvidenceRepository evidenceRepository;
    private final InterviewRecommendationRepository recommendationRepository;
    private final InterviewSkillGapRepository skillGapRepository;
    private final InterviewHiringDecisionRepository hiringDecisionRepository;
    private final InterviewCommunicationMetricsRepository communicationMetricsRepository;
    private final InterviewBehaviorMetricsRepository behaviorMetricsRepository;
    private final InterviewTechnicalMetricsRepository technicalMetricsRepository;
    private final InterviewArchitectureMetricsRepository architectureMetricsRepository;
    private final InterviewLeadershipMetricsRepository leadershipMetricsRepository;
    private final EvaluationAuditRepository auditRepository;
    private final EvaluationVersionRepository versionRepository;
    private final InterviewReasoningRepository reasoningRepository;
    private final InterviewImprovementRepository improvementRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public InterviewEvaluation persist(MockInterview interview, String fullEvaluationJson, String role) {
        try {
            JsonNode root = objectMapper.readTree(fullEvaluationJson);

            // 1. Core evaluation record
            double overallScore = root.path("weightedOverallScore").asDouble(50.0);
            double confidence = root.path("evaluationConfidence").asDouble(60.0);

            InterviewEvaluation eval = InterviewEvaluation.builder()
                    .mockInterview(interview)
                    .overallScore(overallScore)
                    .confidence(confidence)
                    .evaluatorName("PlacementAI-v2-XAI")
                    .version(1)
                    .build();
            eval = evaluationRepository.save(eval);
            final InterviewEvaluation savedEval = eval;

            // 2. Technical metrics
            JsonNode techDetails = root.path("technicalDetails");
            if (!techDetails.isMissingNode()) {
                InterviewTechnicalMetrics tech = InterviewTechnicalMetrics.builder()
                        .evaluation(savedEval)
                        .correctness(techDetails.path("correctness").asDouble(50))
                        .completeness(techDetails.path("completeness").asDouble(50))
                        .depth(techDetails.path("depth").asDouble(50))
                        .tradeOffs(techDetails.path("tradeOffs").asDouble(50))
                        .architecture(techDetails.path("architecture").asDouble(50))
                        .complexity(techDetails.path("complexity").asDouble(50))
                        .optimization(techDetails.path("optimization").asDouble(50))
                        .bestPractices(techDetails.path("bestPractices").asDouble(50))
                        .security(techDetails.path("security").asDouble(50))
                        .performance(techDetails.path("performance").asDouble(50))
                        .scalability(techDetails.path("scalability").asDouble(50))
                        .build();
                technicalMetricsRepository.save(tech);
            }

            // 3. Communication metrics
            JsonNode commDetails = root.path("communicationDetails");
            if (!commDetails.isMissingNode()) {
                InterviewCommunicationMetrics comm = InterviewCommunicationMetrics.builder()
                        .evaluation(savedEval)
                        .clarity(commDetails.path("clarity").asDouble(50))
                        .structure(commDetails.path("structure").asDouble(50))
                        .confidence(commDetails.path("confidence").asDouble(50))
                        .organization(commDetails.path("organization").asDouble(50))
                        .examplesCount(commDetails.path("examplesCount").asInt(0))
                        .vocabularyUsage(commDetails.path("vocabularyUsage").asDouble(50))
                        .professionalism(commDetails.path("professionalism").asDouble(50))
                        .speakingFlow(commDetails.path("speakingFlow").asDouble(50))
                        .conciseness(commDetails.path("conciseness").asDouble(50))
                        .build();
                communicationMetricsRepository.save(comm);
            }

            // 4. Behavioral metrics
            JsonNode behDetails = root.path("behavioralDetails");
            if (!behDetails.isMissingNode()) {
                InterviewBehaviorMetrics beh = InterviewBehaviorMetrics.builder()
                        .evaluation(savedEval)
                        .situationScore(behDetails.path("situationScore").asDouble(50))
                        .taskScore(behDetails.path("taskScore").asDouble(50))
                        .actionScore(behDetails.path("actionScore").asDouble(50))
                        .resultScore(behDetails.path("resultScore").asDouble(50))
                        .ownership(behDetails.path("ownership").asDouble(50))
                        .leadership(behDetails.path("leadership").asDouble(50))
                        .conflictResolution(behDetails.path("conflictResolution").asDouble(50))
                        .initiative(behDetails.path("initiative").asDouble(50))
                        .growthMindset(behDetails.path("growthMindset").asDouble(50))
                        .accountability(behDetails.path("accountability").asDouble(50))
                        .build();
                behaviorMetricsRepository.save(beh);
            }

            // 5. Leadership metrics
            JsonNode leadDetails = root.path("leadershipDetails");
            if (!leadDetails.isMissingNode()) {
                InterviewLeadershipMetrics lead = InterviewLeadershipMetrics.builder()
                        .evaluation(savedEval)
                        .ownership(leadDetails.path("ownership").asDouble(50))
                        .decisionMaking(leadDetails.path("decisionMaking").asDouble(50))
                        .influence(leadDetails.path("influence").asDouble(50))
                        .mentoring(leadDetails.path("mentoring").asDouble(50))
                        .collaboration(leadDetails.path("collaboration").asDouble(50))
                        .build();
                leadershipMetricsRepository.save(lead);
            }

            // 6. Architecture metrics
            JsonNode reasonDetails = root.path("reasoningDetails");
            if (!reasonDetails.isMissingNode()) {
                InterviewArchitectureMetrics arch = InterviewArchitectureMetrics.builder()
                        .evaluation(savedEval)
                        .scalability(reasonDetails.path("tradeOffUnderstanding").asDouble(50))
                        .resilience(reasonDetails.path("riskAwareness").asDouble(50))
                        .decoupling(reasonDetails.path("problemDecomposition").asDouble(50))
                        .reliability(reasonDetails.path("logicalConsistency").asDouble(50))
                        .patternsUnderstanding(reasonDetails.path("analyticalThinking").asDouble(50))
                        .build();
                architectureMetricsRepository.save(arch);
            }

            // 7. Hiring decision
            JsonNode hiringNode = root.path("hiringDecision");
            if (!hiringNode.isMissingNode()) {
                InterviewHiringDecision decision = InterviewHiringDecision.builder()
                        .evaluation(savedEval)
                        .decision(hiringNode.path("decision").asText("Borderline Hire"))
                        .reasons(hiringNode.path("reasons").asText(""))
                        .evidence(hiringNode.path("evidence").asText(""))
                        .strengths(hiringNode.path("strengths").asText(""))
                        .weaknesses(hiringNode.path("weaknesses").asText(""))
                        .risks(hiringNode.path("risks").asText(""))
                        .recommendedLevel(hiringNode.path("recommendedLevel").asText("Mid"))
                        .recommendedTeam(hiringNode.path("recommendedTeam").asText("General"))
                        .interviewConfidence(hiringNode.path("interviewConfidence").asDouble(60))
                        .build();
                hiringDecisionRepository.save(decision);
            }

            // 8. Evidence items
            JsonNode evidenceArray = root.path("evidence");
            if (evidenceArray.isArray()) {
                List<InterviewEvidence> evidenceList = new ArrayList<>();
                for (JsonNode e : evidenceArray) {
                    evidenceList.add(InterviewEvidence.builder()
                            .evaluation(savedEval)
                            .competency(e.path("competency").asText("General"))
                            .evidenceText(e.path("evidenceText").asText(""))
                            .sourceQuestion(e.path("sourceQuestion").asText(""))
                            .sourceAnswer(e.path("sourceAnswer").asText(""))
                            .build());
                }
                evidenceRepository.saveAll(evidenceList);
            }

            // 9. Competency scores
            JsonNode competencyScoresNode = root.path("competencyScores");
            if (competencyScoresNode.isArray()) {
                List<InterviewCompetencyScore> csList = new ArrayList<>();
                for (JsonNode cs : competencyScoresNode) {
                    csList.add(InterviewCompetencyScore.builder()
                            .evaluation(savedEval)
                            .competency(cs.path("competency").asText("General"))
                            .score(cs.path("score").asDouble(50))
                            .confidence(cs.path("confidence").asDouble(60))
                            .trend(cs.path("trend").asText("STABLE"))
                            .build());
                }
                competencyScoreRepository.saveAll(csList);
            }

            // 9b. Reasoning details
            JsonNode reasoningArray = root.path("reasoningList");
            if (reasoningArray.isArray()) {
                List<InterviewReasoning> reasoningList = new ArrayList<>();
                for (JsonNode r : reasoningArray) {
                    reasoningList.add(InterviewReasoning.builder()
                            .evaluation(savedEval)
                            .competency(r.path("competency").asText("General"))
                            .reasoningText(r.path("reasoningText").asText(""))
                            .build());
                }
                reasoningRepository.saveAll(reasoningList);
            }

            // 9c. Improvements/Suggestions details
            JsonNode improvementsArray = root.path("improvementsList");
            if (improvementsArray.isArray()) {
                List<InterviewImprovement> improvementsList = new ArrayList<>();
                for (JsonNode imp : improvementsArray) {
                    improvementsList.add(InterviewImprovement.builder()
                            .evaluation(savedEval)
                            .improvementArea(imp.path("improvementArea").asText("General"))
                            .suggestion(imp.path("suggestion").asText(""))
                            .build());
                }
                improvementRepository.saveAll(improvementsList);
            }

            // 10. Skill gaps
            JsonNode skillGapsNode = root.path("skillGaps");
            if (skillGapsNode.isArray()) {
                List<InterviewSkillGap> gaps = new ArrayList<>();
                for (JsonNode g : skillGapsNode) {
                    gaps.add(InterviewSkillGap.builder()
                            .evaluation(savedEval)
                            .skill(g.path("skill").asText("General"))
                            .expectedLevel(g.path("expectedLevel").asDouble(80))
                            .currentLevel(g.path("currentLevel").asDouble(50))
                            .gap(g.path("gap").asDouble(30))
                            .priority(g.path("priority").asInt(1))
                            .estimatedImprovementTime(g.path("estimatedImprovementTime").asText("2-4 weeks"))
                            .trainingSuggestions(g.path("trainingSuggestions").asText(""))
                            .build());
                }
                skillGapRepository.saveAll(gaps);
            }

            // 11. Recommendations
            JsonNode recommendationsNode = root.path("recommendations");
            if (recommendationsNode.isArray()) {
                List<InterviewRecommendation> recs = new ArrayList<>();
                for (JsonNode r : recommendationsNode) {
                    recs.add(InterviewRecommendation.builder()
                            .evaluation(savedEval)
                            .recommendationText(r.path("text").asText(""))
                            .type(r.path("type").asText("COURSE"))
                            .build());
                }
                recommendationRepository.saveAll(recs);
            }

            // 12. Audit record
            EvaluationAudit audit = EvaluationAudit.builder()
                    .evaluation(savedEval)
                    .action("EVALUATION_COMPLETED")
                    .actor("PlacementAI-XAI-Engine")
                    .details("Full multi-dimensional evaluation persisted for interview " + interview.getId())
                    .build();
            auditRepository.save(audit);

            // 13. Version snapshot
            EvaluationVersion version = EvaluationVersion.builder()
                    .evaluation(savedEval)
                    .version(1)
                    .scoreSnapshot(overallScore)
                    .build();
            versionRepository.save(version);

            log.info("[EVAL] [PERSISTENCE] Successfully persisted evaluation for interview ID: {}, score: {}", interview.getId(), overallScore);
            return savedEval;

        } catch (Exception e) {
            log.error("[EVAL] [PERSISTENCE] Failed to persist evaluation for interview ID: {}. Error: {}", interview.getId(), e.getMessage());
            throw new RuntimeException("Evaluation persistence failed", e);
        }
    }
}
