package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingReplay;
import java.util.List;
import java.util.Map;

public interface CodingService {
    CodingProblem getCurrentProblem(Long interviewId);
    Map<String, Object> getSubmission(Long submissionId);
    List<CodingReplay> getReplay(Long submissionId);
    Map<String, Object> getCodingProfile(Long userId);
    Map<String, Object> autoSave(Long submissionId, String code, String eventType);
}
