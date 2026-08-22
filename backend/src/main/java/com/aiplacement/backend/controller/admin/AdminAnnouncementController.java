package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.dto.admin.announcement.*;
import com.aiplacement.backend.entity.Announcement;
import com.aiplacement.backend.service.admin.AnnouncementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminAnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping("/announcements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Page<Announcement>> getAnnouncements(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(announcementService.getAnnouncements(page, size));
    }

    @PostMapping("/announcements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT')")
    public ResponseEntity<Announcement> createAnnouncement(
            @RequestBody CreateAnnouncementRequest body,
            HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String userRole = "ROLE_SUPER_ADMIN";
        if (request.isUserInRole("ROLE_SUPPORT")) userRole = "ROLE_SUPPORT";
        if (request.isUserInRole("ROLE_SUPER_ADMIN")) userRole = "ROLE_SUPER_ADMIN";

        return ResponseEntity.ok(announcementService.createAnnouncement(body, adminEmail, userRole));
    }

    @PostMapping("/announcements/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Announcement> approveAnnouncement(
            @PathVariable("id") Long id,
            HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        return ResponseEntity.ok(announcementService.approveAnnouncement(id, adminEmail));
    }

    @PostMapping("/maintenance-mode")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> updateMaintenanceMode(
            @RequestBody MaintenanceModeRequest body,
            HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        announcementService.updateMaintenanceMode(body, adminEmail);
        return ResponseEntity.ok(Map.of("message", "Maintenance mode settings updated successfully"));
    }
}
