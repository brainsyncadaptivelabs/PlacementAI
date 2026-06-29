package com.aiplacement.backend.service.admin;

import org.springframework.data.domain.Page;
import java.util.Map;

public interface AdminPortalService {
    Map<String, Object> getDashboardStats();
    Map<String, Object> getUsers(String search, int page, int size, String sortBy, String sortDir, String college, String branch, String plan, String status);
    Map<String, Object> getUserDetails(Long userId);
    Map<String, Object> getCreditsStats();
    Map<String, Object> getAiUsageStats();
    Map<String, Object> getResumeStats();
    Map<String, Object> getInterviewStats();
    Map<String, Object> getSystemHealth();
    Page<?> getAuditLogs(int page, int size);
    byte[] generateReport(String type);
}
