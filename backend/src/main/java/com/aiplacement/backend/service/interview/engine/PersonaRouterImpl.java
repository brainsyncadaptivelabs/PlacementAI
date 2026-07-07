package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.service.interview.orchestrator.InterviewState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PersonaRouterImpl implements PersonaRouter {

    @Override
    public String routeToPersona(InterviewState state, String conversationalStyle) {
        String baseInstructions = "";
        
        if ("Friendly".equalsIgnoreCase(conversationalStyle)) {
            baseInstructions = "Adopt a warm, encouraging, positive, and supportive tone.";
        } else if ("Strict".equalsIgnoreCase(conversationalStyle)) {
            baseInstructions = "Adopt a highly rigorous, challenging, and scrutinizing tone. Be demanding and challenge shallow assumptions.";
        } else if ("Senior Engineer".equalsIgnoreCase(conversationalStyle)) {
            baseInstructions = "Adopt a deep technical pragmatist/manager persona. Focus heavily on architecture trade-offs, scaling, and system optimization.";
        } else {
            baseInstructions = "Adopt a balanced, formal, objective, and professional recruiter tone.";
        }

        switch (state) {
            case INTRODUCTION:
                return baseInstructions + " Act as an HR Recruiter welcoming the candidate and gathering high-level background context.";
            case RESUME_REVIEW:
                return baseInstructions + " Act as a Technical Recruiter scanning and validating the claims on their resume with targeted questions.";
            case TECHNICAL:
                return baseInstructions + " Act as a Domain Expert/Senior Engineer assessing core concepts, languages, and technical frameworks.";
            case CODING:
                return baseInstructions + " Act as a Coding Interviewer evaluating programming ability, logic, code optimization, and edge cases.";
            case SYSTEM_DESIGN:
                return baseInstructions + " Act as a System Design Expert or Lead Architect probing scalability, microservices, load balancing, and trade-offs.";
            case BEHAVIORAL:
                return baseInstructions + " Act as an Engineering Manager evaluating leadership principles and past experiences using the STAR method.";
            case HR:
                return baseInstructions + " Act as a Hiring Manager assessing organizational alignment, values, culture, and communication.";
            default:
                return baseInstructions + " Act as a balanced and professional AI interviewer.";
        }
    }
}
