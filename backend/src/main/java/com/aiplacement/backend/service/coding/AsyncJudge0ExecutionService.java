package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

public interface AsyncJudge0ExecutionService {

    CodingSubmission submitAsync(CodingSubmission submission, CodingProblem problem);

    void processWebhookResult(String token, Judge0WebhookPayload payload);

    SseEmitter subscribeToSse(Long submissionId);

    Map<String, Object> getSubmissionStatus(Long submissionId);

    void cancelExecution(Long submissionId);
}
