package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.service.interview.orchestrator.InterviewState;

public interface PersonaRouter {
    String routeToPersona(InterviewState state, String conversationalStyle);
}
