package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.service.interview.orchestrator.InterviewState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InterviewStateMachine {

    public void validateTransition(InterviewState from, InterviewState to) {
        log.info("Validating transition from {} to {}", from, to);
        if (from == to) {
            return; // Self-transitions are always valid (e.g., clarification turns)
        }

        // Global exits
        if (to == InterviewState.CANCELLED || to == InterviewState.FAILED) {
            return;
        }

        boolean valid = false;
        switch (from) {
            case INITIALIZING:
                valid = (to == InterviewState.RESUME_ANALYSIS);
                break;
            case RESUME_ANALYSIS:
                valid = (to == InterviewState.JD_ANALYSIS);
                break;
            case JD_ANALYSIS:
                valid = (to == InterviewState.INTERVIEW_BLUEPRINT);
                break;
            case INTERVIEW_BLUEPRINT:
                valid = (to == InterviewState.INTRODUCTION);
                break;
            case INTRODUCTION:
            case RESUME_DISCUSSION:
            case TECHNICAL:
            case CODING:
            case SYSTEM_DESIGN:
            case BEHAVIORAL:
            case FOLLOW_UP:
                valid = (to == InterviewState.RESUME_DISCUSSION ||
                         to == InterviewState.TECHNICAL ||
                         to == InterviewState.CODING ||
                         to == InterviewState.SYSTEM_DESIGN ||
                         to == InterviewState.BEHAVIORAL ||
                         to == InterviewState.FOLLOW_UP ||
                         to == InterviewState.FINAL_EVALUATION);
                break;
            case FINAL_EVALUATION:
                valid = (to == InterviewState.REPORT_GENERATION);
                break;
            case REPORT_GENERATION:
                valid = (to == InterviewState.COMPLETED);
                break;
            case COMPLETED:
            case CANCELLED:
            case FAILED:
                valid = false; // Terminal states
                break;
            default:
                break;
        }

        if (!valid) {
            log.error("Invalid state transition attempted: {} -> {}", from, to);
            throw new IllegalStateException("Invalid state transition attempted: " + from + " -> " + to);
        }
    }
}
