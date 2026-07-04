package com.aiplacement.backend.intelligence;

import org.springframework.stereotype.Service;

/**
 * Engine that defines and manages intent categories.
 */
@Service
public class IntentEngine {

    /**
     * Enum containing the various types of placement intents.
     */
    public enum IntentType {
        RESUME_REVIEW,
        CAREER_ADVICE,
        ROADMAP,
        COMPANY_COMPARISON,
        PLACEMENT_PREDICTION,
        SIMPLE_QA
    }
}
