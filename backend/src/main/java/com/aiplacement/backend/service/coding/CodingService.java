package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingReplay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface CodingService {
    Map<String, Object> getSubmission(Long submissionId);
    List<CodingReplay> getReplay(Long submissionId);
    Map<String, Object> getCodingProfile(Long userId);
    Map<String, Object> autoSave(Long submissionId, String code, String eventType);

    Page<ProblemDto> getProblems(String difficulty, String tag, String query, User user, Pageable pageable);
    ProblemDto getProblemById(Long id, User user);
    ProblemRunResponse runProblemCode(Long problemId, ProblemRunRequest request, User user);
    Map<String, Object> submitProblemCode(Long problemId, ProblemRunRequest request, User user);
    List<Map<String, Object>> getProblemSubmissions(Long problemId, User user);
    CodingDashboardDto getCodingDashboard(User user);
    CopilotResponse copilotAssist(Long problemId, CopilotRequest request, User user);
}

