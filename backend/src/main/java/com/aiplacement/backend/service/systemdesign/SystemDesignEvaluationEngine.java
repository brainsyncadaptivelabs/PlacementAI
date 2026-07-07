package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.entity.interview.SystemDesignDiagram;
import com.aiplacement.backend.entity.interview.SystemDesignEvaluation;

public interface SystemDesignEvaluationEngine {
    /**
     * Evaluates a system design diagram submission (components, connections, candidate text notes).
     */
    SystemDesignEvaluation evaluate(SystemDesignDiagram diagram, String scenarioTitle, String problemDescription, String role);
}
