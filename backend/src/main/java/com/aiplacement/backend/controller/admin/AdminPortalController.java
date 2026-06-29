package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.service.admin.AdminPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminPortalController {

    private final AdminPortalService adminPortalService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminPortalService.getDashboardStats());
    }

    @GetMapping("/users")
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
    public ResponseEntity<Map<String, Object>> getUserDetails(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminPortalService.getUserDetails(id));
    }

    @GetMapping("/credits")
    public ResponseEntity<Map<String, Object>> getCreditsStats() {
        return ResponseEntity.ok(adminPortalService.getCreditsStats());
    }

    @GetMapping("/api-usage")
    public ResponseEntity<Map<String, Object>> getAiUsageStats() {
        return ResponseEntity.ok(adminPortalService.getAiUsageStats());
    }

    @GetMapping("/resumes")
    public ResponseEntity<Map<String, Object>> getResumeStats() {
        return ResponseEntity.ok(adminPortalService.getResumeStats());
    }

    @GetMapping("/interviews")
    public ResponseEntity<Map<String, Object>> getInterviewStats() {
        return ResponseEntity.ok(adminPortalService.getInterviewStats());
    }

    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        return ResponseEntity.ok(adminPortalService.getSystemHealth());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<?>> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminPortalService.getAuditLogs(page, size));
    }

    @GetMapping("/reports")
    public ResponseEntity<byte[]> getReport(@RequestParam("type") String type) {
        byte[] csvData = adminPortalService.generateReport(type);
        
        String filename = type.toLowerCase() + "_report_" + LocalDate.now() + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
