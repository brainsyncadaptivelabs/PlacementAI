package com.aiplacement.backend.dto.admin.bulk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkJobStateDto {
    private String jobId;
    private String jobType; // BULK_PLAN, BULK_BLOCK, BULK_UNBLOCK, BULK_CSV_UPLOAD, BULK_EXPORT
    private String adminEmail;
    private String status; // QUEUED, RUNNING, COMPLETED, FAILED
    private int totalTargetCount;
    private int processedCount;
    private int successCount;
    private int failureCount;
    private List<BulkRowResult> failures;
    private String downloadUrl;
    private String filterSummary;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
