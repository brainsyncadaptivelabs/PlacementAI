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
    
    Map<String, Object> getCollegeAnalytics(String college, String branch);
    void deleteUser(Long id);
    Map<String, Object> updateUserPlan(Long id, String newPlan, String adminEmail, String clientIp);
    void blockUser(Long id, String reason, String adminEmail, String clientIp);
    void unblockUser(Long id, String adminEmail, String clientIp);
    void softDeleteUser(Long id, String adminEmail, String clientIp);
    void hardDeleteUser(Long id, String confirmEmail, String adminEmail, String clientIp);
    com.aiplacement.backend.dto.admin.ImpersonateResponse impersonateUser(Long targetUserId, String reason, String adminEmail, String clientIp);
    void endImpersonation(String impersonationToken, String adminEmail, String clientIp);

    com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto submitBulkPlan(com.aiplacement.backend.dto.admin.bulk.BulkPlanRequest request, String adminEmail, String clientIp);
    com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto submitBulkBlock(com.aiplacement.backend.dto.admin.bulk.BulkBlockRequest request, boolean isBlock, String adminEmail, String clientIp);
    com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto submitBulkUpload(java.util.List<com.aiplacement.backend.dto.admin.bulk.BulkUploadRow> rows, String adminEmail, String clientIp);
    com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto submitBulkExport(com.aiplacement.backend.dto.admin.bulk.BulkUserFilterDto filter, java.util.List<Long> userIds, String adminEmail, String clientIp);
    com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto getBulkJobStatus(String jobId);

    com.aiplacement.backend.dto.admin.note.AdminNoteDto createAdminUserNote(Long userId, com.aiplacement.backend.dto.admin.note.CreateAdminNoteRequest request, String adminEmail);
    java.util.List<com.aiplacement.backend.dto.admin.note.AdminNoteDto> getAdminUserNotes(Long userId);
}
