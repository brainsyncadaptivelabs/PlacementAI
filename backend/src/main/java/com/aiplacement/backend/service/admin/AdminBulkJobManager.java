package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.bulk.*;
import com.aiplacement.backend.entity.AccountStatus;
import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AuditLogRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.security.UserTokenRevocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminBulkJobManager {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserTokenRevocationService tokenRevocationService;

    private final Map<String, BulkJobStateDto> jobStore = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);

    private static final int MAX_BULK_CAP = 5000;
    private static final int BATCH_SIZE = 250;

    public BulkJobStateDto getJobStatus(String jobId) {
        BulkJobStateDto job = jobStore.get(jobId);
        if (job == null) {
            throw new RuntimeException("Bulk job not found with ID: " + jobId);
        }
        return job;
    }

    public BulkJobStateDto submitBulkPlanJob(BulkPlanRequest request, String adminEmail, String clientIp) {
        List<User> targetUsers = resolveTargetUsers(request.getUserIds(), request.getFilter(), request.getSelectAllMatchingFilter());
        validateCap(targetUsers.size());

        String jobId = "job-plan-" + UUID.randomUUID().toString().substring(0, 8);
        BulkJobStateDto state = BulkJobStateDto.builder()
                .jobId(jobId)
                .jobType("BULK_PLAN")
                .adminEmail(adminEmail)
                .status("QUEUED")
                .totalTargetCount(targetUsers.size())
                .processedCount(0)
                .successCount(0)
                .failureCount(0)
                .failures(new ArrayList<>())
                .filterSummary(buildFilterSummary(request.getFilter(), request.getUserIds()))
                .createdAt(LocalDateTime.now())
                .build();

        jobStore.put(jobId, state);

        executorService.submit(() -> processBulkPlanJob(jobId, targetUsers, request.getTargetPlan(), adminEmail, clientIp));
        return state;
    }

    public BulkJobStateDto submitBulkBlockJob(BulkBlockRequest request, boolean isBlock, String adminEmail, String clientIp) {
        List<User> targetUsers = resolveTargetUsers(request.getUserIds(), request.getFilter(), request.getSelectAllMatchingFilter());
        validateCap(targetUsers.size());

        String jobType = isBlock ? "BULK_BLOCK" : "BULK_UNBLOCK";
        String jobId = "job-" + (isBlock ? "block-" : "unblock-") + UUID.randomUUID().toString().substring(0, 8);

        BulkJobStateDto state = BulkJobStateDto.builder()
                .jobId(jobId)
                .jobType(jobType)
                .adminEmail(adminEmail)
                .status("QUEUED")
                .totalTargetCount(targetUsers.size())
                .processedCount(0)
                .successCount(0)
                .failureCount(0)
                .failures(new ArrayList<>())
                .filterSummary(buildFilterSummary(request.getFilter(), request.getUserIds()))
                .createdAt(LocalDateTime.now())
                .build();

        jobStore.put(jobId, state);

        executorService.submit(() -> processBulkBlockJob(jobId, targetUsers, isBlock, request.getReason(), adminEmail, clientIp));
        return state;
    }

    public BulkJobStateDto submitBulkUploadJob(List<BulkUploadRow> rows, String adminEmail, String clientIp) {
        validateCap(rows.size());

        String jobId = "job-upload-" + UUID.randomUUID().toString().substring(0, 8);
        BulkJobStateDto state = BulkJobStateDto.builder()
                .jobId(jobId)
                .jobType("BULK_CSV_UPLOAD")
                .adminEmail(adminEmail)
                .status("QUEUED")
                .totalTargetCount(rows.size())
                .processedCount(0)
                .successCount(0)
                .failureCount(0)
                .failures(new ArrayList<>())
                .filterSummary("Batch CSV Upload (" + rows.size() + " rows)")
                .createdAt(LocalDateTime.now())
                .build();

        jobStore.put(jobId, state);

        executorService.submit(() -> processBulkUploadJob(jobId, rows, adminEmail, clientIp));
        return state;
    }

    public BulkJobStateDto submitBulkExportJob(BulkUserFilterDto filter, List<Long> userIds, String adminEmail, String clientIp) {
        List<User> targetUsers = resolveTargetUsers(userIds, filter, true);
        validateCap(targetUsers.size());

        String jobId = "job-export-" + UUID.randomUUID().toString().substring(0, 8);
        BulkJobStateDto state = BulkJobStateDto.builder()
                .jobId(jobId)
                .jobType("BULK_EXPORT")
                .adminEmail(adminEmail)
                .status("QUEUED")
                .totalTargetCount(targetUsers.size())
                .processedCount(0)
                .successCount(0)
                .failureCount(0)
                .failures(new ArrayList<>())
                .filterSummary(buildFilterSummary(filter, userIds))
                .createdAt(LocalDateTime.now())
                .build();

        jobStore.put(jobId, state);

        executorService.submit(() -> processBulkExportJob(jobId, targetUsers, adminEmail, clientIp));
        return state;
    }

    private void processBulkPlanJob(String jobId, List<User> targetUsers, String targetPlan, String adminEmail, String clientIp) {
        BulkJobStateDto state = jobStore.get(jobId);
        state.setStatus("RUNNING");
        List<Long> affectedIds = new ArrayList<>();

        for (int i = 0; i < targetUsers.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, targetUsers.size());
            List<User> batch = targetUsers.subList(i, end);
            for (User u : batch) {
                try {
                    u.setPlan(targetPlan);
                    if ("PREMIUM".equalsIgnoreCase(targetPlan)) u.setCreditsRemaining(1000);
                    else if ("BASIC".equalsIgnoreCase(targetPlan)) u.setCreditsRemaining(500);
                    else u.setCreditsRemaining(100);

                    userRepository.save(u);
                    affectedIds.add(u.getId());
                    state.setSuccessCount(state.getSuccessCount() + 1);
                } catch (Exception e) {
                    state.setFailureCount(state.getFailureCount() + 1);
                    state.getFailures().add(BulkRowResult.builder()
                            .rowNumber(state.getProcessedCount() + 1)
                            .email(u.getEmail())
                            .userId(u.getId())
                            .success(false)
                            .error(e.getMessage())
                            .build());
                }
                state.setProcessedCount(state.getProcessedCount() + 1);
            }
        }

        state.setStatus("COMPLETED");
        state.setCompletedAt(LocalDateTime.now());
        logSummaryAudit(adminEmail, clientIp, "BULK_USER_PLAN_UPDATE", state, affectedIds);
    }

    private void processBulkBlockJob(String jobId, List<User> targetUsers, boolean isBlock, String reason, String adminEmail, String clientIp) {
        BulkJobStateDto state = jobStore.get(jobId);
        state.setStatus("RUNNING");
        List<Long> affectedIds = new ArrayList<>();

        for (int i = 0; i < targetUsers.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, targetUsers.size());
            List<User> batch = targetUsers.subList(i, end);
            for (User u : batch) {
                try {
                    if (isBlock) {
                        u.setAccountStatus(AccountStatus.BLOCKED);
                        u.setBlockReason(reason);
                        u.setBlockedAt(LocalDateTime.now());
                        if (tokenRevocationService != null) {
                            tokenRevocationService.revokeUserTokens(u.getId(), u.getEmail());
                        }
                    } else {
                        u.setAccountStatus(AccountStatus.ACTIVE);
                        u.setBlockReason(null);
                        u.setBlockedAt(null);
                        if (tokenRevocationService != null) {
                            tokenRevocationService.clearUserRevocation(u.getId(), u.getEmail());
                        }
                    }
                    userRepository.save(u);
                    affectedIds.add(u.getId());
                    state.setSuccessCount(state.getSuccessCount() + 1);
                } catch (Exception e) {
                    state.setFailureCount(state.getFailureCount() + 1);
                    state.getFailures().add(BulkRowResult.builder()
                            .rowNumber(state.getProcessedCount() + 1)
                            .email(u.getEmail())
                            .userId(u.getId())
                            .success(false)
                            .error(e.getMessage())
                            .build());
                }
                state.setProcessedCount(state.getProcessedCount() + 1);
            }
        }

        state.setStatus("COMPLETED");
        state.setCompletedAt(LocalDateTime.now());
        String actionKey = isBlock ? "BULK_USER_BLOCKED" : "BULK_USER_UNBLOCKED";
        logSummaryAudit(adminEmail, clientIp, actionKey, state, affectedIds);
    }

    private void processBulkUploadJob(String jobId, List<BulkUploadRow> rows, String adminEmail, String clientIp) {
        BulkJobStateDto state = jobStore.get(jobId);
        state.setStatus("RUNNING");
        List<Long> affectedIds = new ArrayList<>();

        for (BulkUploadRow row : rows) {
            try {
                if (row.getEmail() == null || row.getEmail().isBlank()) {
                    throw new RuntimeException("Missing candidate email");
                }
                Optional<User> uOpt = userRepository.findByEmailIgnoreCase(row.getEmail().trim());
                if (uOpt.isEmpty()) {
                    throw new RuntimeException("User email not found in platform");
                }

                User u = uOpt.get();
                String action = row.getAction() != null ? row.getAction().toUpperCase() : "GRANT_PREMIUM";
                if ("GRANT_PREMIUM".equalsIgnoreCase(action)) {
                    u.setPlan("PREMIUM");
                    u.setCreditsRemaining(1000);
                } else if ("GRANT_BASIC".equalsIgnoreCase(action)) {
                    u.setPlan("BASIC");
                    u.setCreditsRemaining(500);
                } else if ("BLOCK".equalsIgnoreCase(action)) {
                    u.setAccountStatus(AccountStatus.BLOCKED);
                    u.setBlockedAt(LocalDateTime.now());
                    if (tokenRevocationService != null) tokenRevocationService.revokeUserTokens(u.getId(), u.getEmail());
                } else if ("UNBLOCK".equalsIgnoreCase(action)) {
                    u.setAccountStatus(AccountStatus.ACTIVE);
                    if (tokenRevocationService != null) tokenRevocationService.clearUserRevocation(u.getId(), u.getEmail());
                } else if ("SOFT_DELETE".equalsIgnoreCase(action)) {
                    u.setAccountStatus(AccountStatus.DELETED);
                    u.setDeletedAt(LocalDateTime.now());
                    if (tokenRevocationService != null) tokenRevocationService.revokeUserTokens(u.getId(), u.getEmail());
                }

                userRepository.save(u);
                affectedIds.add(u.getId());
                state.setSuccessCount(state.getSuccessCount() + 1);
            } catch (Exception e) {
                state.setFailureCount(state.getFailureCount() + 1);
                state.getFailures().add(BulkRowResult.builder()
                        .rowNumber(row.getRowNumber())
                        .email(row.getEmail())
                        .success(false)
                        .error(e.getMessage())
                        .build());
            }
            state.setProcessedCount(state.getProcessedCount() + 1);
        }

        state.setStatus("COMPLETED");
        state.setCompletedAt(LocalDateTime.now());
        logSummaryAudit(adminEmail, clientIp, "BULK_USER_CSV_UPLOAD", state, affectedIds);
    }

    private void processBulkExportJob(String jobId, List<User> targetUsers, String adminEmail, String clientIp) {
        BulkJobStateDto state = jobStore.get(jobId);
        state.setStatus("RUNNING");
        List<Long> affectedIds = new ArrayList<>();

        for (User u : targetUsers) {
            affectedIds.add(u.getId());
            state.setSuccessCount(state.getSuccessCount() + 1);
            state.setProcessedCount(state.getProcessedCount() + 1);
        }

        state.setStatus("COMPLETED");
        state.setCompletedAt(LocalDateTime.now());
        logSummaryAudit(adminEmail, clientIp, "BULK_USER_EXPORT", state, affectedIds);
    }

    private List<User> resolveTargetUsers(List<Long> userIds, BulkUserFilterDto filter, Boolean selectAllMatching) {
        if (Boolean.TRUE.equals(selectAllMatching) || userIds == null || userIds.isEmpty()) {
            String search = filter != null ? filter.getSearch() : "";
            String college = filter != null ? filter.getCollege() : "";
            String branch = filter != null ? filter.getBranch() : "";
            String plan = filter != null ? filter.getPlan() : "";
            String status = filter != null ? filter.getStatus() : "";

            Page<User> page = userRepository.searchUsers(
                    "ALL".equalsIgnoreCase(search) ? "" : search,
                    "ALL".equalsIgnoreCase(college) ? "" : college,
                    "ALL".equalsIgnoreCase(branch) ? "" : branch,
                    "ALL".equalsIgnoreCase(plan) ? "" : plan,
                    "ALL".equalsIgnoreCase(status) ? "" : status,
                    PageRequest.of(0, MAX_BULK_CAP)
            );
            return page.getContent();
        } else {
            return userRepository.findAllById(userIds);
        }
    }

    private void validateCap(int size) {
        if (size > MAX_BULK_CAP) {
            throw new RuntimeException("Bulk request limit exceeded. Maximum of " + MAX_BULK_CAP + " users can be processed per bulk request. Requested: " + size);
        }
    }

    private String buildFilterSummary(BulkUserFilterDto filter, List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            return "Specific Candidates (" + ids.size() + " IDs)";
        }
        if (filter == null) return "All Candidates";
        return String.format("Filter [College: %s, Branch: %s, Plan: %s, Status: %s]",
                filter.getCollege() != null ? filter.getCollege() : "ALL",
                filter.getBranch() != null ? filter.getBranch() : "ALL",
                filter.getPlan() != null ? filter.getPlan() : "ALL",
                filter.getStatus() != null ? filter.getStatus() : "ALL");
    }

    private void logSummaryAudit(String adminEmail, String clientIp, String action, BulkJobStateDto state, List<Long> affectedIds) {
        try {
            String details = String.format("Job ID: %s | Criteria: %s | Total: %d | Succeeded: %d | Failed: %d | Affected User IDs: %s",
                    state.getJobId(), state.getFilterSummary(), state.getTotalTargetCount(), state.getSuccessCount(), state.getFailureCount(), affectedIds.toString());

            AuditLog entry = AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ipAddress(clientIp != null ? clientIp : "127.0.0.1")
                    .adminEmail(adminEmail != null ? adminEmail : "SUPER_ADMIN")
                    .action(action)
                    .target(details)
                    .status("SUCCESS")
                    .browser("Admin Console (Bulk Queue)")
                    .os("Server")
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("[BULK_AUDIT] Failed to save summary audit log", e);
        }
    }
}
