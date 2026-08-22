package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.service.admin.AdminPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT', 'BILLING_ADMIN', 'ANALYTICS_VIEWER')")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminPortalController {

    private final AdminPortalService adminPortalService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminPortalService.getDashboardStats());
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "DESC") String sortDir,
            @RequestParam(value = "college", required = false) String college,
            @RequestParam(value = "branch", required = false) String branch,
            @RequestParam(value = "plan", required = false) String plan,
            @RequestParam(value = "status", required = false) String status
    ) {
        return ResponseEntity.ok(adminPortalService.getUsers(search, page, size, sortBy, sortDir, college, branch, plan, status));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Map<String, Object>> getUserDetails(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminPortalService.getUserDetails(id));
    }

    @GetMapping("/credits")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getCreditsStats() {
        return ResponseEntity.ok(adminPortalService.getCreditsStats());
    }

    @GetMapping("/api-usage")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getAiUsageStats() {
        return ResponseEntity.ok(adminPortalService.getAiUsageStats());
    }

    @GetMapping("/resumes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getResumeStats() {
        return ResponseEntity.ok(adminPortalService.getResumeStats());
    }

    @GetMapping("/interviews")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getInterviewStats() {
        return ResponseEntity.ok(adminPortalService.getInterviewStats());
    }

    @GetMapping("/system-health")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        return ResponseEntity.ok(adminPortalService.getSystemHealth());
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<?>> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminPortalService.getAuditLogs(page, size));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<byte[]> getReport(@RequestParam("type") String type) {
        byte[] csvData = adminPortalService.generateReport(type);
        
        String filename = type.toLowerCase() + "_report_" + LocalDate.now() + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/college-analytics")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Map<String, Object>> getCollegeAnalytics(
            @RequestParam(value = "college", required = false) String college,
            @RequestParam(value = "branch", required = false) String branch
    ) {
        return ResponseEntity.ok(adminPortalService.getCollegeAnalytics(college, branch));
    }

    @RequestMapping(value = "/users/{id}/plan", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUserPlan(
            @PathVariable("id") Long id,
            @RequestParam(value = "plan", required = false) String planParam,
            @RequestBody(required = false) Map<String, String> body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String newPlan = (body != null && body.containsKey("plan")) ? body.get("plan") : planParam;
        if (newPlan == null || newPlan.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Plan field is required"));
        }
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(adminPortalService.updateUserPlan(id, newPlan, adminEmail, clientIp));
    }

    @PatchMapping("/users/{id}/block")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Map<String, String>> blockUser(
            @PathVariable("id") Long id,
            @RequestBody(required = false) com.aiplacement.backend.dto.admin.BlockUserRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String reason = body != null ? body.getReason() : null;
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        adminPortalService.blockUser(id, reason, adminEmail, clientIp);
        return ResponseEntity.ok(Map.of("message", "User account successfully blocked"));
    }

    @PatchMapping("/users/{id}/unblock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Map<String, String>> unblockUser(
            @PathVariable("id") Long id,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        adminPortalService.unblockUser(id, adminEmail, clientIp);
        return ResponseEntity.ok(Map.of("message", "User account successfully unblocked"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> softDeleteUser(
            @PathVariable("id") Long id,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        adminPortalService.softDeleteUser(id, adminEmail, clientIp);
        return ResponseEntity.ok(Map.of("message", "User account soft-deleted (retained for 30 days)"));
    }

    @DeleteMapping("/users/{id}/permanent")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> hardDeleteUser(
            @PathVariable("id") Long id,
            @RequestBody com.aiplacement.backend.dto.admin.HardDeleteUserRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String confirmEmail = body != null ? body.getConfirmEmail() : null;
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        adminPortalService.hardDeleteUser(id, confirmEmail, adminEmail, clientIp);
        return ResponseEntity.ok(Map.of("message", "User account permanently destroyed"));
    }

    @PostMapping("/users/{id}/impersonate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<com.aiplacement.backend.dto.admin.ImpersonateResponse> impersonateUser(
            @PathVariable("id") Long id,
            @RequestBody(required = false) com.aiplacement.backend.dto.admin.ImpersonateRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String reason = body != null ? body.getReason() : null;
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(adminPortalService.impersonateUser(id, reason, adminEmail, clientIp));
    }

    @PostMapping("/impersonate/end")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Map<String, String>> endImpersonation(
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String authHeader = request.getHeader("Authorization");
        String impersonationToken = (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        adminPortalService.endImpersonation(impersonationToken, adminEmail, clientIp);
        return ResponseEntity.ok(Map.of("message", "Impersonation session ended. Admin session restored."));
    }

    @PostMapping("/users/bulk/plan")
    public ResponseEntity<com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto> submitBulkPlan(
            @RequestBody com.aiplacement.backend.dto.admin.bulk.BulkPlanRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.accepted().body(adminPortalService.submitBulkPlan(body, adminEmail, clientIp));
    }

    @PostMapping("/users/bulk/block")
    public ResponseEntity<com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto> submitBulkBlock(
            @RequestBody com.aiplacement.backend.dto.admin.bulk.BulkBlockRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.accepted().body(adminPortalService.submitBulkBlock(body, true, adminEmail, clientIp));
    }

    @PostMapping("/users/bulk/unblock")
    public ResponseEntity<com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto> submitBulkUnblock(
            @RequestBody com.aiplacement.backend.dto.admin.bulk.BulkBlockRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.accepted().body(adminPortalService.submitBulkBlock(body, false, adminEmail, clientIp));
    }

    @PostMapping("/users/bulk/upload")
    public ResponseEntity<com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto> submitBulkUpload(
            @RequestBody java.util.List<com.aiplacement.backend.dto.admin.bulk.BulkUploadRow> rows,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.accepted().body(adminPortalService.submitBulkUpload(rows, adminEmail, clientIp));
    }

    @PostMapping("/users/bulk/export")
    public ResponseEntity<com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto> submitBulkExport(
            @RequestBody(required = false) Map<String, Object> payload,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        com.aiplacement.backend.dto.admin.bulk.BulkUserFilterDto filter = null;
        List<Long> userIds = null;
        return ResponseEntity.accepted().body(adminPortalService.submitBulkExport(filter, userIds, adminEmail, clientIp));
    }

    @GetMapping("/users/bulk/jobs/{jobId}")
    public ResponseEntity<com.aiplacement.backend.dto.admin.bulk.BulkJobStateDto> getBulkJobStatus(
            @PathVariable("jobId") String jobId
    ) {
        return ResponseEntity.ok(adminPortalService.getBulkJobStatus(jobId));
    }

    @PostMapping("/users/{id}/notes")
    public ResponseEntity<com.aiplacement.backend.dto.admin.note.AdminNoteDto> createAdminUserNote(
            @PathVariable("id") Long id,
            @RequestBody com.aiplacement.backend.dto.admin.note.CreateAdminNoteRequest body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        return ResponseEntity.ok(adminPortalService.createAdminUserNote(id, body, adminEmail));
    }

    @GetMapping("/users/{id}/notes")
    public ResponseEntity<List<com.aiplacement.backend.dto.admin.note.AdminNoteDto>> getAdminUserNotes(
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.ok(adminPortalService.getAdminUserNotes(id));
    }
}
