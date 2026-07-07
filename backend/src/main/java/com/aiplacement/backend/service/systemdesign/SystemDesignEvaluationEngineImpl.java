package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.SystemDesignDiagram;
import com.aiplacement.backend.entity.interview.SystemDesignEvaluation;
import com.aiplacement.backend.repository.interview.SystemDesignEvaluationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemDesignEvaluationEngineImpl implements SystemDesignEvaluationEngine {

    private final AIClient aiClient;
    private final SystemDesignEvaluationRepository evaluationRepository;

    @Override
    @Transactional
    public SystemDesignEvaluation evaluate(SystemDesignDiagram diagram, String scenarioTitle, String problemDescription, String role) {
        log.info("[SYSTEM_DESIGN] [EVAL] Running AI evaluation for diagram ID: {}", diagram.getId());

        String prompt = """
                You are a principal cloud systems architect. Evaluate the candidate's system design solution.
                
                SCENARIO TITLE: %s
                DESCRIPTION: %s
                ROLE: %s
                
                CANDIDATE NOTES / DESIGN DESCRIPTION:
                %s
                
                DIAGRAM CANVAS JSON NODES (Components):
                %s
                
                DIAGRAM CANVAS JSON EDGES (Connections):
                %s
                
                Evaluate the solution across:
                - 13 categories: requirements, apiDesign, databaseDesign, microservices, distributedSystems, scalability, caching, loadBalancing, messageQueues, security, monitoring, disasterRecovery, tradeOffs (scores 0-100).
                - 7 core metrics: Architecture, Scalability, Reliability, Security, Performance, Decision making, Trade-off analysis.
                For EACH core metric, you MUST provide score, reasoning, evidence (referencing specific candidate notes or diagram nodes), and improvement suggestion.
                
                Return ONLY valid JSON matching this exact schema:
                {
                  "requirements": 85,
                  "apiDesign": 80,
                  "databaseDesign": 75,
                  "microservices": 80,
                  "distributedSystems": 80,
                  "scalability": 85,
                  "caching": 90,
                  "loadBalancing": 85,
                  "messageQueues": 80,
                  "security": 75,
                  "monitoring": 70,
                  "disasterRecovery": 65,
                  "tradeOffs": 80,
                  
                  "architectureMetric": {
                    "score": 82,
                    "reasoning": "Designed decoupling layers properly...",
                    "evidence": "Connected API Gateway to application microservices using Event Broker node",
                    "improvement": "Add a separate Redis caching layer for session storage to avoid DB calls."
                  },
                  "scalabilityMetric": {
                    "score": 85,
                    "reasoning": "Database is sharded horizontally...",
                    "evidence": "Diagram includes partitioned MySQL clusters and replica nodes",
                    "improvement": "Introduce auto-scaling groups on application worker servers."
                  },
                  "reliabilityMetric": {
                    "score": 80,
                    "reasoning": "High uptime setup...",
                    "evidence": "Multi-AZ replica database connection setup listed in notes",
                    "improvement": "Setup circuit breakers on payment API integrations."
                  },
                  "securityMetric": {
                    "score": 75,
                    "reasoning": "Basic auth listed...",
                    "evidence": "Uses OAuth2 gateway connection",
                    "improvement": "Encrypt data at rest in Cassandra clusters using KMS."
                  },
                  "performanceMetric": {
                    "score": 88,
                    "reasoning": "Caching strategy works...",
                    "evidence": "Redis cache has write-through caching model in notes",
                    "improvement": "Leverage CDN edge nodes for static media distribution."
                  },
                  "decisionMakingMetric": {
                    "score": 80,
                    "reasoning": "Understands scaling challenges...",
                    "evidence": "Justified choosing PostgreSQL over MongoDB for ACID transaction integrity",
                    "improvement": "Explain why Redis cluster topology was preferred over Memcached."
                  },
                  "tradeOffMetric": {
                    "score": 80,
                    "reasoning": "Detailed CAP analysis...",
                    "evidence": "Favored Availability over Consistency (AP system) during partition events",
                    "improvement": "Elaborate on eventual consistency resolution techniques."
                  },
                  
                  "overallScore": 82,
                  "confidence": 90,
                  "feedbackText": "Excellent architectural proposal with detailed database sharding schema."
                }
                """.formatted(
                scenarioTitle,
                problemDescription,
                role,
                diagram.getCandidateNotes() != null ? diagram.getCandidateNotes() : "",
                diagram.getComponentsJson() != null ? diagram.getComponentsJson() : "[]",
                diagram.getConnectionsJson() != null ? diagram.getConnectionsJson() : "[]"
        );

        JsonNode response = null;
        try {
            response = aiClient.generateJson(
                    "You are a principal systems architect. Respond ONLY with valid JSON.",
                    prompt, 0.3, 4000, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.warn("[SYSTEM_DESIGN] [EVAL] AI evaluation failed, using fallbacks: {}", e.getMessage());
        }

        SystemDesignEvaluation eval;
        if (response != null) {
            eval = SystemDesignEvaluation.builder()
                    .systemDesignDiagram(diagram)
                    .interviewQuestion(diagram.getInterviewQuestion())
                    .requirementsScore(response.path("requirements").asDouble(50.0))
                    .apiDesignScore(response.path("apiDesign").asDouble(50.0))
                    .databaseDesignScore(response.path("databaseDesign").asDouble(50.0))
                    .microservicesScore(response.path("microservices").asDouble(50.0))
                    .distributedSystemsScore(response.path("distributedSystems").asDouble(50.0))
                    .scalabilityScore(response.path("scalability").asDouble(50.0))
                    .cachingScore(response.path("caching").asDouble(50.0))
                    .loadBalancingScore(response.path("loadBalancing").asDouble(50.0))
                    .messageQueuesScore(response.path("messageQueues").asDouble(50.0))
                    .securityScore(response.path("security").asDouble(50.0))
                    .monitoringScore(response.path("monitoring").asDouble(50.0))
                    .disasterRecoveryScore(response.path("disasterRecovery").asDouble(50.0))
                    .tradeOffsScore(response.path("tradeOffs").asDouble(50.0))

                    // Metrics
                    .metricArchitectureScore(response.path("architectureMetric").path("score").asDouble(50.0))
                    .metricArchitectureReasoning(response.path("architectureMetric").path("reasoning").asText(""))
                    .metricArchitectureEvidence(response.path("architectureMetric").path("evidence").asText(""))
                    .metricArchitectureImprovement(response.path("architectureMetric").path("improvement").asText(""))

                    .metricScalabilityScore(response.path("scalabilityMetric").path("score").asDouble(50.0))
                    .metricScalabilityReasoning(response.path("scalabilityMetric").path("reasoning").asText(""))
                    .metricScalabilityEvidence(response.path("scalabilityMetric").path("evidence").asText(""))
                    .metricScalabilityImprovement(response.path("scalabilityMetric").path("improvement").asText(""))

                    .metricReliabilityScore(response.path("reliabilityMetric").path("score").asDouble(50.0))
                    .metricReliabilityReasoning(response.path("reliabilityMetric").path("reasoning").asText(""))
                    .metricReliabilityEvidence(response.path("reliabilityMetric").path("evidence").asText(""))
                    .metricReliabilityImprovement(response.path("reliabilityMetric").path("improvement").asText(""))

                    .metricSecurityScore(response.path("securityMetric").path("score").asDouble(50.0))
                    .metricSecurityReasoning(response.path("securityMetric").path("reasoning").asText(""))
                    .metricSecurityEvidence(response.path("securityMetric").path("evidence").asText(""))
                    .metricSecurityImprovement(response.path("securityMetric").path("improvement").asText(""))

                    .metricPerformanceScore(response.path("performanceMetric").path("score").asDouble(50.0))
                    .metricPerformanceReasoning(response.path("performanceMetric").path("reasoning").asText(""))
                    .metricPerformanceEvidence(response.path("performanceMetric").path("evidence").asText(""))
                    .metricPerformanceImprovement(response.path("performanceMetric").path("improvement").asText(""))

                    .metricDecisionMakingScore(response.path("decisionMakingMetric").path("score").asDouble(50.0))
                    .metricDecisionMakingReasoning(response.path("decisionMakingMetric").path("reasoning").asText(""))
                    .metricDecisionMakingEvidence(response.path("decisionMakingMetric").path("evidence").asText(""))
                    .metricDecisionMakingImprovement(response.path("decisionMakingMetric").path("improvement").asText(""))

                    .metricTradeOffScore(response.path("tradeOffMetric").path("score").asDouble(50.0))
                    .metricTradeOffReasoning(response.path("tradeOffMetric").path("reasoning").asText(""))
                    .metricTradeOffEvidence(response.path("tradeOffMetric").path("evidence").asText(""))
                    .metricTradeOffImprovement(response.path("tradeOffMetric").path("improvement").asText(""))

                    .overallScore(response.path("overallScore").asDouble(50.0))
                    .confidence(response.path("confidence").asDouble(70.0))
                    .feedbackText(response.path("feedbackText").asText(""))
                    .build();
        } else {
            // Default Fallbacks
            eval = SystemDesignEvaluation.builder()
                    .systemDesignDiagram(diagram)
                    .interviewQuestion(diagram.getInterviewQuestion())
                    .requirementsScore(60.0).apiDesignScore(60.0).databaseDesignScore(60.0)
                    .microservicesScore(60.0).distributedSystemsScore(60.0).scalabilityScore(60.0)
                    .cachingScore(60.0).loadBalancingScore(60.0).messageQueuesScore(60.0)
                    .securityScore(60.0).monitoringScore(60.0).disasterRecoveryScore(60.0).tradeOffsScore(60.0)
                    .metricArchitectureScore(60.0).metricScalabilityScore(60.0).metricReliabilityScore(60.0)
                    .metricSecurityScore(60.0).metricPerformanceScore(60.0).metricDecisionMakingScore(60.0)
                    .metricTradeOffScore(60.0)
                    .overallScore(60.0)
                    .confidence(50.0)
                    .feedbackText("Evaluation complete. Scores defaulted due to LLM timeout.")
                    .build();
        }

        eval = evaluationRepository.save(eval);
        log.info("[SYSTEM_DESIGN] [EVAL] Evaluation persisted. Score: {}", eval.getOverallScore());
        return eval;
    }
}
